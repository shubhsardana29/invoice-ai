import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileType } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setLoading, setError, addInvoice } from '../store/slices/invoicesSlice';
import { addProduct } from '../store/slices/productsSlice';
import { addCustomer } from '../store/slices/customersSlice';
import { extractDataFromFiles } from '../services/gemini';
import { FileProcessingError, AIProcessingError } from '../services/errors';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CONCURRENT_PROCESSING = 3;

const FileUpload: React.FC = () => {
  const dispatch = useDispatch();
  const [processingProgress, setProcessingProgress] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setProcessingProgress([]);
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Validate file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileList = oversizedFiles.map(f => f.name).join(', ');
      toast.error(`Files exceeding 10MB limit: ${fileList}`);
      dispatch(setLoading(false));
      return;
    }

    try {
      const loadingToast = toast.loading(`Processing ${acceptedFiles.length} files...`);
      
      // Process files in batches
      for (let i = 0; i < acceptedFiles.length; i += MAX_CONCURRENT_PROCESSING) {
        const batch = acceptedFiles.slice(i, i + MAX_CONCURRENT_PROCESSING);
        setProcessingProgress(prev => [...prev, ...batch.map(f => `Processing ${f.name}...`)]);
        
        try {
          const extractedData = await extractDataFromFiles(batch);
          
          // Update Redux store with extracted data
          extractedData.invoices.forEach(invoice => dispatch(addInvoice(invoice)));
          extractedData.products.forEach(product => dispatch(addProduct(product)));
          extractedData.customers.forEach(customer => dispatch(addCustomer(customer)));
          
          // Update progress
          setProcessingProgress(prev => 
            prev.filter(p => !batch.some(f => p.includes(f.name)))
          );
        } catch (error) {
          if (error instanceof FileProcessingError || error instanceof AIProcessingError) {
            toast.error(`${error.fileName}: ${error.message}`);
          } else {
            toast.error(`Error processing files: ${error.message}`);
          }
        }
      }

      toast.dismiss(loadingToast);
      toast.success('File processing completed');

    } catch (error) {
      let errorMessage = 'An unexpected error occurred while processing files.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
      setProcessingProgress([]);
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-full">
            <Upload className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              or click to select files
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <FileType className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              Supported formats: PDF, Images (PNG, JPG), Excel (XLSX, XLS) - Max 10MB per file
            </span>
          </div>
        </div>
      </div>
      
      {processingProgress.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Processing Files</h3>
          <div className="space-y-2">
            {processingProgress.map((progress, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <span className="text-sm text-gray-600">{progress}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;