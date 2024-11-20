import { ValidationError } from './errors';
import { Invoice } from '../store/slices/invoicesSlice';
import { Product } from '../store/slices/productsSlice';
import { Customer } from '../store/slices/customersSlice';

interface RawData {
  invoice?: Record<string, any>;
  product?: Record<string, any>;
  customer?: Record<string, any>;
}

export function validateAndTransformData(rawData: RawData, fileName: string): {
  invoice?: Invoice;
  product?: Product;
  customer?: Customer;
} {
  const result: {
    invoice?: Invoice;
    product?: Product;
    customer?: Customer;
  } = {};

  if (rawData.invoice) {
    result.invoice = validateInvoice(rawData.invoice);
  }

  if (rawData.product) {
    result.product = validateProduct(rawData.product);
  }

  if (rawData.customer) {
    result.customer = validateCustomer(rawData.customer);
  }

  if (!result.invoice && !result.product && !result.customer) {
    throw new ValidationError('No valid data found in the extracted content');
  }

  return result;
}

function validateInvoice(data: Record<string, any>): Invoice {
  const requiredFields = ['serialNumber', 'customerName', 'productName', 'quantity', 'tax', 'totalAmount'];
  const missingFields = requiredFields.filter(field => !data[field]);

  return {
    id: crypto.randomUUID(),
    serialNumber: String(data.serialNumber || ''),
    customerName: String(data.customerName || ''),
    productName: String(data.productName || ''),
    quantity: Number(data.quantity) || 0,
    tax: Number(data.tax) || 0,
    totalAmount: Number(data.totalAmount) || 0,
    date: data.date || new Date().toISOString().split('T')[0],
    status: missingFields.length ? 'incomplete' : 'complete',
    missingFields: missingFields.length ? missingFields : undefined,
  };
}

function validateProduct(data: Record<string, any>): Product {
  return {
    id: crypto.randomUUID(),
    name: String(data.name || ''),
    quantity: Number(data.quantity) || 0,
    unitPrice: Number(data.unitPrice) || 0,
    tax: Number(data.tax) || 0,
    priceWithTax: Number(data.priceWithTax) || 0,
    discount: data.discount !== undefined ? Number(data.discount) : undefined,
  };
}

function validateCustomer(data: Record<string, any>): Customer {
  return {
    id: crypto.randomUUID(),
    name: String(data.name || ''),
    phoneNumber: String(data.phoneNumber || ''),
    totalPurchaseAmount: Number(data.totalPurchaseAmount) || 0,
    email: data.email,
    address: data.address,
    lastPurchaseDate: data.lastPurchaseDate,
  };
}