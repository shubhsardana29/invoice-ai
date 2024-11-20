import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import DataTable from '../components/DataTable';

const CustomersTab: React.FC = () => {
  const customers = useSelector((state: RootState) => state.customers.items);

  const columns = [
    { key: 'name', label: 'Customer Name' },
    { key: 'phoneNumber', label: 'Phone Number' },
    {
      key: 'totalPurchaseAmount',
      label: 'Total Purchase Amount',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    { key: 'email', label: 'Email', render: (value: string | undefined) => value || '-' },
    { key: 'address', label: 'Address', render: (value: string | undefined) => value || '-' },
    {
      key: 'lastPurchaseDate',
      label: 'Last Purchase',
      render: (value: string | undefined) => value || '-',
    },
  ];

  return <DataTable columns={columns} data={customers} />;
};

export default CustomersTab;