import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import DataTable from '../components/DataTable';

const ProductsTab: React.FC = () => {
  const products = useSelector((state: RootState) => state.products.items);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unitPrice', label: 'Unit Price', render: (value: number) => `$${value.toFixed(2)}` },
    { key: 'tax', label: 'Tax', render: (value: number) => `${value}%` },
    { key: 'priceWithTax', label: 'Price with Tax', render: (value: number) => `$${value.toFixed(2)}` },
    {
      key: 'discount',
      label: 'Discount',
      render: (value: number | undefined) => (value ? `${value}%` : '-'),
    },
  ];

  return <DataTable columns={columns} data={products} />;
};

export default ProductsTab;