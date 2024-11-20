import { GoogleGenerativeAI } from '@google/generative-ai';
import * as XLSX from 'xlsx';
import { ExtractedData } from '../types/data';
import { FileProcessingError, AIProcessingError } from './errors';
import { readFileAsBase64 } from './fileProcessor';
import { validateAndTransformData } from './dataValidator';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const EXTRACTION_PROMPT = `Extract invoice, product, and customer information from this document. Return ONLY a JSON object with this exact structure:  {   "invoice": {     "serialNumber": "string",     "customerName": "string",     "productName": "string",     "quantity": number,     "tax": number,     "totalAmount": number,     "date": "YYYY-MM-DD"   },   "product": {     "name": "string",     "quantity": number,     "unitPrice": number,     "tax": number,     "priceWithTax": number,     "discount": number (optional)   },   "customer": {     "name": "string",     "phoneNumber": "string",     "totalPurchaseAmount": number,     "email": "string (optional)",     "address": "string (optional)",     "lastPurchaseDate": "YYYY-MM-DD (optional)"   } }  Important: - Return ONLY the JSON object - Use numbers for numeric values, not strings - Use YYYY-MM-DD format for dates - Omit fields if data cannot be extracted with high confidence - Do not add any explanatory text`;

// Function to convert Excel to base64 encoded text
async function convertExcelToText(file: File): Promise<{ mimeType: string, data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Read the workbook
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to CSV
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        
        // Convert CSV to base64
        const base64Data = btoa(unescape(encodeURIComponent(csvContent)));
        
        resolve({
          mimeType: 'text/csv',
          data: base64Data
        });
      } catch (error) {
        reject(new Error(`Failed to convert Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    // Read file as binary string
    reader.readAsBinaryString(file);
  });
}

export async function extractDataFromFiles(files: File[]): Promise<ExtractedData> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const processedData: ExtractedData = {
    invoices: [],
    products: [],
    customers: [],
  };

  for (const file of files) {
    try {
      // Determine file type and use appropriate reading method
      const { mimeType, data } = 
        file.type.includes('excel') || file.type.includes('spreadsheet')
          ? await convertExcelToText(file)
          : await readFileAsBase64(file);

      // Process with Gemini
      const result = await model.generateContent([
        { inlineData: { mimeType, data } },
        EXTRACTION_PROMPT
      ]);

      const response = await result.response;
      let extractedJson = response.candidates[0].content.parts[0].text;

      // Extract JSON from code block
      const jsonMatch = extractedJson.match(/```json\n([\s\S]*)\n```/);
      if (!jsonMatch) {
        // If no code block, try direct JSON parsing
        const jsonStartIndex = extractedJson.indexOf('{');
        const jsonEndIndex = extractedJson.lastIndexOf('}') + 1;
        
        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
          throw new AIProcessingError('No valid JSON found in response', file.name);
        }
        
        extractedJson = extractedJson.substring(jsonStartIndex, jsonEndIndex);
      } else {
        extractedJson = jsonMatch[1];
      }

      // Parse and validate extracted data
      let parsedData;
      try {
        parsedData = JSON.parse(extractedJson);
      } catch (error) {
        throw new AIProcessingError('Invalid JSON response from AI', file.name);
      }

      // Validate and transform the data
      const validatedData = validateAndTransformData(parsedData, file.name);

      // Add validated data to results
      if (validatedData.invoice) {
        processedData.invoices.push(validatedData.invoice);
      }
      if (validatedData.product) {
        processedData.products.push(...(Array.isArray(validatedData.product) ? validatedData.product : [validatedData.product]));
      }
      if (validatedData.customer) {
        processedData.customers.push(validatedData.customer);
      }
    } catch (error) {
      if (error instanceof FileProcessingError || error instanceof AIProcessingError) {
        throw error;
      }
      throw new FileProcessingError(
        `Failed to process file: ${error.message}`,
        file.name
      );
    }
  }

  return processedData;
}