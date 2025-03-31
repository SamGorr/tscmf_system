import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const MOCK_PROGRAMS = [
  { id: 'TFP', name: 'Trade Finance Program' },
  { id: 'SCFP', name: 'Supply Chain Finance Program' },
  { id: 'MFP', name: 'Microfinance Program' }
];

const MOCK_PRODUCTS = [
  { id: 'CG', name: 'Credit Guarantee', program: 'TFP' },
  { id: 'RCF', name: 'Revolving Credit Facility', program: 'TFP' },
  { id: 'URPA', name: 'Unfunded Risk Participation Agreement', program: 'TFP' },
  { id: 'FRPA', name: 'Funded Risk Participation Agreement', program: 'SCFP' },
  { id: 'PGFA', name: 'Partial Guarantee Facility Agreement', program: 'MFP' }
];

const MOCK_TRANSACTION_TYPES = [
  { id: 'INQUIRY', name: 'Inquiry' },
  { id: 'REQUEST', name: 'Transaction Request' },
  { id: 'AMENDMENT', name: 'Transaction Amendment' },
  { id: 'RDA', name: 'RDA Process' },
  { id: 'CLOSURE', name: 'Transaction Closure' }
];

const ProgramConfig = () => {
  const [selectedChecks, setSelectedChecks] = useState({
    programs: {},
    products: {},
    transactions: {}
  });

  const [customChecks, setCustomChecks] = useState([]);
  const [newCheckName, setNewCheckName] = useState('');

  const handleCheckToggle = (type, id) => {
    setSelectedChecks(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };

  const handleAddCustomCheck = (e) => {
    e.preventDefault();
    if (newCheckName.trim()) {
      setCustomChecks(prev => [...prev, {
        id: Date.now(),
        name: newCheckName.trim()
      }]);
      setNewCheckName('');
    }
  };

  const handleDeleteCustomCheck = (id) => {
    setCustomChecks(prev => prev.filter(check => check.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Programs Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Programs</h4>
        <div className="space-y-2">
          {MOCK_PROGRAMS.map(program => (
            <div key={program.id} className="flex items-center">
              <input
                type="checkbox"
                id={`program-${program.id}`}
                checked={selectedChecks.programs[program.id] || false}
                onChange={() => handleCheckToggle('programs', program.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`program-${program.id}`} className="ml-2 block text-sm text-gray-700">
                {program.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Products</h4>
        <div className="space-y-2">
          {MOCK_PRODUCTS.map(product => (
            <div key={product.id} className="flex items-center">
              <input
                type="checkbox"
                id={`product-${product.id}`}
                checked={selectedChecks.products[product.id] || false}
                onChange={() => handleCheckToggle('products', product.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`product-${product.id}`} className="ml-2 block text-sm text-gray-700">
                {product.name} ({product.program})
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Types Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Transaction Types</h4>
        <div className="space-y-2">
          {MOCK_TRANSACTION_TYPES.map(type => (
            <div key={type.id} className="flex items-center">
              <input
                type="checkbox"
                id={`transaction-${type.id}`}
                checked={selectedChecks.transactions[type.id] || false}
                onChange={() => handleCheckToggle('transactions', type.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`transaction-${type.id}`} className="ml-2 block text-sm text-gray-700">
                {type.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Checks Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Custom Checks</h4>
        <form onSubmit={handleAddCustomCheck} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCheckName}
            onChange={(e) => setNewCheckName(e.target.value)}
            placeholder="Enter check name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add
          </button>
        </form>
        <div className="space-y-2">
          {customChecks.map(check => (
            <div key={check.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <span className="text-sm text-gray-700">{check.name}</span>
              <button
                onClick={() => handleDeleteCustomCheck(check.id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramConfig; 