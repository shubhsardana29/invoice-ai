import { Invoice } from '../store/slices/invoicesSlice';
import { Product } from '../store/slices/productsSlice';
import { Customer } from '../store/slices/customersSlice';

export interface ExtractedData {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
}