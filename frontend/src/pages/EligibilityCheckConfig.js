import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  DocumentTextIcon, 
  ShoppingBagIcon, 
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Mock data for goods lists
const MOCK_GOODS_LISTS = {
  excludedGoods: [
    { id: 1, name: 'Weapons and Ammunition', category: 'Military', description: 'Any type of weapons, ammunition, or military equipment' },
    { id: 2, name: 'Tobacco Products', category: 'Controlled Substances', description: 'Cigarettes, cigars, and other tobacco products' },
    { id: 3, name: 'Radioactive Materials', category: 'Hazardous', description: 'Any materials containing radioactive substances' }
  ],
  esgExclusion: [
    { id: 1, name: 'Coal Mining Operations', category: 'Environmental', description: 'Activities related to coal extraction and processing' },
    { id: 2, name: 'Forced Labor Products', category: 'Social', description: 'Products manufactured using forced or child labor' },
    { id: 3, name: 'Illegal Logging', category: 'Environmental', description: 'Products from illegal deforestation activities' }
  ],
  sustainableGoods: [
    { id: 1, name: 'Solar Panels', category: 'Renewable Energy', description: 'Photovoltaic panels for solar energy generation' },
    { id: 2, name: 'Organic Fertilizers', category: 'Agriculture', description: 'Natural and organic fertilizer products' },
    { id: 3, name: 'Electric Vehicles', category: 'Transportation', description: 'Electric cars and related components' }
  ],
  industrialMachinery: [
    { id: 1, name: 'CNC Machines', category: 'Manufacturing', description: 'Computer Numerical Control manufacturing equipment' },
    { id: 2, name: 'Industrial Robots', category: 'Automation', description: 'Robotic systems for industrial automation' },
    { id: 3, name: 'Packaging Equipment', category: 'Processing', description: 'Industrial packaging and labeling machines' }
  ],
  esmsList: [
    { id: 1, name: 'Waste Treatment Plants', category: 'Environmental', description: 'Facilities for processing industrial waste' },
    { id: 2, name: 'Air Quality Monitors', category: 'Monitoring', description: 'Equipment for monitoring air pollution levels' },
    { id: 3, name: 'Water Filtration Systems', category: 'Water Management', description: 'Industrial water treatment and filtration systems' }
  ]
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const GoodsList = ({ title, items, onUpload, onAdd, onUpdate, onDelete }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      onUpdate({ ...editingItem, ...formData });
    } else {
      onAdd({ id: Date.now(), ...formData });
    }
    setFormData({ name: '', category: '', description: '' });
    setEditingItem(null);
    setIsAddModalOpen(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex justify-end space-x-2">
          <button
            onClick={onUpload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Upload
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({ name: '', category: '', description: '' });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>

        {/* Items List */}
        <div className="mt-4">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.category}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">{item.description}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EligibilityCheckConfig = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  
  // State for Eligibility Checks Configuration
  const [programConfig, setProgramConfig] = useState({
    programs: [],
    products: [],
    transactions: []
  });
  const [matchingCriteria, setMatchingCriteria] = useState({
    fuzzyMatchSensitivity: 0.8,
    enablePartialMatch: true
  });
  const [termsConditions, setTermsConditions] = useState([]);
  const [guidelines, setGuidelines] = useState([]);

  // State for Goods List Management
  const [goodsLists, setGoodsLists] = useState(MOCK_GOODS_LISTS);

  // State for Other List Management
  const [otherLists, setOtherLists] = useState({
    eligibleDMCs: [],
    eligibleInstruments: []
  });

  const handleFileUpload = (listType) => {
    // Implement file upload logic
    console.log(`Uploading file for ${listType}`);
  };

  const handleAddItem = (listType, newItem) => {
    setGoodsLists(prev => ({
      ...prev,
      [listType]: [...prev[listType], newItem]
    }));
  };

  const handleUpdateItem = (listType, updatedItem) => {
    setGoodsLists(prev => ({
      ...prev,
      [listType]: prev[listType].map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    }));
  };

  const handleDeleteItem = (listType, itemId) => {
    setGoodsLists(prev => ({
      ...prev,
      [listType]: prev[listType].filter(item => item.id !== itemId)
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Eligibility Check Configuration</h1>
      
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            <div className="flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Eligibility Checks
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            <div className="flex items-center justify-center">
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Goods Lists
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                selected
                  ? 'bg-white text-blue-700 shadow'
                  : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
              )
            }
          >
            <div className="flex items-center justify-center">
              <GlobeAltIcon className="h-5 w-5 mr-2" />
              Other Lists
            </div>
          </Tab>
        </Tab.List>
        
        <Tab.Panels className="mt-6">
          {/* Eligibility Checks Configuration Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Program, Products, and Transactions Configuration */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Program & Product Configuration</h3>
                <div className="space-y-4">
                  {/* Add configuration form fields here */}
                </div>
              </div>

              {/* Matching Criteria Configuration */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Matching Criteria</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fuzzy Matching Sensitivity
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={matchingCriteria.fuzzyMatchSensitivity}
                      onChange={(e) => setMatchingCriteria({
                        ...matchingCriteria,
                        fuzzyMatchSensitivity: parseFloat(e.target.value)
                      })}
                      className="mt-1 w-full"
                    />
                    <span className="text-sm text-gray-500">
                      {matchingCriteria.fuzzyMatchSensitivity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Configuration */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                <div className="space-y-4">
                  {/* Add terms & conditions configuration here */}
                </div>
              </div>

              {/* Transaction Check Guidelines */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Check Guidelines</h3>
                <div className="space-y-4">
                  {/* Add guidelines management here */}
                </div>
              </div>
            </div>
          </Tab.Panel>

          {/* Goods List Management Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              <GoodsList
                title="Excluded Goods Checklist"
                items={goodsLists.excludedGoods}
                onUpload={() => handleFileUpload('excludedGoods')}
                onAdd={(item) => handleAddItem('excludedGoods', item)}
                onUpdate={(item) => handleUpdateItem('excludedGoods', item)}
                onDelete={(id) => handleDeleteItem('excludedGoods', id)}
              />
              <GoodsList
                title="ESG Exclusion List"
                items={goodsLists.esgExclusion}
                onUpload={() => handleFileUpload('esgExclusion')}
                onAdd={(item) => handleAddItem('esgExclusion', item)}
                onUpdate={(item) => handleUpdateItem('esgExclusion', item)}
                onDelete={(id) => handleDeleteItem('esgExclusion', id)}
              />
              <GoodsList
                title="Sustainable Goods List"
                items={goodsLists.sustainableGoods}
                onUpload={() => handleFileUpload('sustainableGoods')}
                onAdd={(item) => handleAddItem('sustainableGoods', item)}
                onUpdate={(item) => handleUpdateItem('sustainableGoods', item)}
                onDelete={(id) => handleDeleteItem('sustainableGoods', id)}
              />
              <GoodsList
                title="Industrial Machinery and Capital Goods List"
                items={goodsLists.industrialMachinery}
                onUpload={() => handleFileUpload('industrialMachinery')}
                onAdd={(item) => handleAddItem('industrialMachinery', item)}
                onUpdate={(item) => handleUpdateItem('industrialMachinery', item)}
                onDelete={(id) => handleDeleteItem('industrialMachinery', id)}
              />
              <GoodsList
                title="ESMS (Environmental and Social Management System) List"
                items={goodsLists.esmsList}
                onUpload={() => handleFileUpload('esmsList')}
                onAdd={(item) => handleAddItem('esmsList', item)}
                onUpdate={(item) => handleUpdateItem('esmsList', item)}
                onDelete={(id) => handleDeleteItem('esmsList', id)}
              />
            </div>
          </Tab.Panel>

          {/* Other List Management Panel */}
          <Tab.Panel>
            <div className="space-y-6">
              {/* Eligible DMCs List */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Eligible DMCs List</h3>
                <div className="space-y-4">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleFileUpload('eligibleDMCs')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={() => handleAddItem('eligibleDMCs')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Country
                    </button>
                  </div>
                  {/* Add list display and management here */}
                </div>
              </div>

              {/* Eligible Instrument Types List */}
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Eligible Instrument Types</h3>
                <div className="space-y-4">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleFileUpload('eligibleInstruments')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={() => handleAddItem('eligibleInstruments')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Instrument
                    </button>
                  </div>
                  {/* Add list display and management here */}
                </div>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default EligibilityCheckConfig; 