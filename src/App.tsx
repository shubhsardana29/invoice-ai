import { useState } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import FileUpload from './components/FileUpload';
import Tabs from './components/Tabs';
import InvoicesTab from './tabs/InvoicesTab';
import ProductsTab from './tabs/ProductsTab';
import CustomersTab from './tabs/CustomersTab';
import { Bot } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('invoices');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'invoices':
        return <InvoicesTab />;
      case 'products':
        return <ProductsTab />;
      case 'customers':
        return <CustomersTab />;
      default:
        return null;
    }
  };

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Invoice AI Manager
              </h1>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8">
            <FileUpload />
          </div>

          {/* Tabs and Content */}
          <div className="bg-white rounded-lg shadow">
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="p-6">
              {renderActiveTab()}
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </div>
    </Provider>
  );
}

export default App;