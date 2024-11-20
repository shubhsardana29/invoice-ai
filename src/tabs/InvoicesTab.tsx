import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import DataTable from '../components/DataTable';
import { AlertCircle } from 'lucide-react';

const InvoicesTab: React.FC = () => {
  const { items: invoices, loading, error } = useSelector((state: RootState) => state.invoices);

  const columns = [
    { key: 'serialNumber', label: 'Serial Number' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'productName', label: 'Product Name' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'tax', label: 'Tax', render: (value: number) => `${value}%` },
    { key: 'totalAmount', label: 'Total Amount', render: (value: number) => `$${value.toFixed(2)}` },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${value === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
        >
          {value === 'complete' ? 'Complete' : 'Incomplete'}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return <DataTable columns={columns} data={invoices} isLoading={loading} />;
};

export default InvoicesTab;