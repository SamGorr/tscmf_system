import React, { useState, useEffect } from 'react';
import { 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  WrenchScrewdriverIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';

// Mock data for pricing matrix
const MOCK_PRICING_MATRICES = [
  {
    id: 1,
    name: 'Trade Finance Pricing',
    businessArea: 'Trade Finance',
    isActive: true,
    entries: [
      {
        id: 1,
        country: 'USA',
        location: 'ALL',
        bank: 'Citibank',
        beneficiary: 'ALL',
        product: 'Letter of Credit',
        tenor: '90 days',
        price100: 2.75,
        priceN: 1.85,
        riskCoverage: 65,
        isActive: true
      },
      {
        id: 2,
        country: 'USA',
        location: 'ALL',
        bank: 'JP Morgan',
        beneficiary: 'ALL',
        product: 'Letter of Credit',
        tenor: '180 days',
        price100: 3.25,
        priceN: 2.10,
        riskCoverage: 65,
        isActive: true
      },
      {
        id: 3,
        country: 'Germany',
        location: 'Frankfurt',
        bank: 'Deutsche Bank',
        beneficiary: 'BMW',
        product: 'Bank Guarantee',
        tenor: '90 days',
        price100: 2.50,
        priceN: 1.60,
        riskCoverage: 65,
        isActive: true
      }
    ]
  },
  {
    id: 2,
    name: 'Supply Chain Pricing',
    businessArea: 'Supply Chain',
    isActive: true,
    entries: [
      {
        id: 4,
        country: 'Singapore',
        location: 'ALL',
        bank: 'DBS Bank',
        beneficiary: 'ALL',
        product: 'Supplier Financing',
        tenor: '60 days',
        price100: 3.00,
        priceN: 1.95,
        riskCoverage: 65,
        isActive: true
      },
      {
        id: 5,
        country: 'China',
        location: 'Shanghai',
        bank: 'Bank of China',
        beneficiary: 'ALL',
        product: 'Distributor Financing',
        tenor: '90 days',
        price100: 3.50,
        priceN: 2.30,
        riskCoverage: 65,
        isActive: false
      }
    ]
  },
  {
    id: 3,
    name: 'Micro Finance Pricing',
    businessArea: 'Micro Finance',
    isActive: true,
    entries: [
      {
        id: 6,
        country: 'Kenya',
        location: 'ALL',
        bank: 'ALL',
        beneficiary: 'ALL',
        product: 'Micro Loan',
        tenor: '30 days',
        price100: 4.00,
        priceN: 2.60,
        riskCoverage: 65,
        isActive: true
      },
      {
        id: 7,
        country: 'India',
        location: 'Mumbai',
        bank: 'ALL',
        beneficiary: 'ALL',
        product: 'Group Financing',
        tenor: '90 days',
        price100: 4.25,
        priceN: 2.75,
        riskCoverage: 65,
        isActive: true
      }
    ]
  }
];

// Mock data for business rules
const MOCK_BUSINESS_RULES = [
  {
    id: 1,
    name: 'High Value Discount',
    description: 'Apply 0.25% discount for deals over $1,000,000',
    criteria: {
      type: 'deal_value',
      threshold: 1000000,
      operator: '>='
    },
    action: {
      type: 'discount',
      value: 0.25
    },
    isActive: true
  },
  {
    id: 2,
    name: 'Premium for A-Rated Obligors',
    description: 'Apply 0.15% premium for A-rated obligors',
    criteria: {
      type: 'obligor_rating',
      value: 'A',
      operator: '='
    },
    action: {
      type: 'premium',
      value: 0.15
    },
    isActive: true
  },
  {
    id: 3,
    name: 'Extended Tenor Surcharge',
    description: 'Apply 0.5% surcharge for tenors > 180 days',
    criteria: {
      type: 'tenor',
      threshold: 180,
      operator: '>'
    },
    action: {
      type: 'premium',
      value: 0.5
    },
    isActive: false
  }
];

// Business areas for dropdown options
const BUSINESS_AREAS = ['Trade Finance', 'Supply Chain', 'Micro Finance'];

const PricingMatrix = () => {
  // State for the pricing matrices and business rules
  const [pricingMatrices, setPricingMatrices] = useState(MOCK_PRICING_MATRICES);
  const [businessRules, setBusinessRules] = useState(MOCK_BUSINESS_RULES);
  
  // State for selected matrix and current view
  const [selectedMatrixId, setSelectedMatrixId] = useState(1);
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' or 'rules'
  
  // State for matrix entries table
  const [expandedEntry, setExpandedEntry] = useState(null);
  
  // State for dialog modals
  const [showMatrixDialog, setShowMatrixDialog] = useState(false);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null });
  
  // Form data states
  const [matrixFormData, setMatrixFormData] = useState({
    id: null,
    name: '',
    businessArea: '',
    isActive: true
  });
  
  const [entryFormData, setEntryFormData] = useState({
    id: null,
    country: '',
    location: '',
    bank: '',
    beneficiary: '',
    product: '',
    tenor: '',
    price100: 0,
    priceN: 0,
    riskCoverage: 65,
    isActive: true
  });
  
  const [ruleFormData, setRuleFormData] = useState({
    id: null,
    name: '',
    description: '',
    criteria: {
      type: 'deal_value',
      threshold: 0,
      operator: '>='
    },
    action: {
      type: 'discount',
      value: 0
    },
    isActive: true
  });
  
  // Get the currently selected matrix
  const selectedMatrix = pricingMatrices.find(m => m.id === selectedMatrixId) || pricingMatrices[0];

  // Handle opening the matrix dialog for adding or editing
  const handleOpenMatrixDialog = (matrix = null) => {
    if (matrix) {
      setMatrixFormData({
        id: matrix.id,
        name: matrix.name,
        businessArea: matrix.businessArea,
        isActive: matrix.isActive
      });
    } else {
      setMatrixFormData({
        id: null,
        name: '',
        businessArea: BUSINESS_AREAS[0],
        isActive: true
      });
    }
    setShowMatrixDialog(true);
  };

  // Handle opening the entry dialog for adding or editing
  const handleOpenEntryDialog = (entry = null) => {
    if (entry) {
      setEntryFormData({
        ...entry
      });
    } else {
      setEntryFormData({
        id: null,
        country: '',
        location: '',
        bank: '',
        beneficiary: '',
        product: '',
        tenor: '',
        price100: 0,
        priceN: 0,
        riskCoverage: 65,
        isActive: true
      });
    }
    setShowEntryDialog(true);
  };

  // Handle opening the rule dialog for adding or editing
  const handleOpenRuleDialog = (rule = null) => {
    if (rule) {
      setRuleFormData({
        ...rule
      });
    } else {
      setRuleFormData({
        id: null,
        name: '',
        description: '',
        criteria: {
          type: 'deal_value',
          threshold: 0,
          operator: '>='
        },
        action: {
          type: 'discount',
          value: 0
        },
        isActive: true
      });
    }
    setShowRuleDialog(true);
  };

  // Handle saving a pricing matrix
  const handleSaveMatrix = () => {
    if (matrixFormData.id) {
      // Update existing matrix
      setPricingMatrices(prevMatrices => 
        prevMatrices.map(matrix => 
          matrix.id === matrixFormData.id ? { ...matrix, ...matrixFormData } : matrix
        )
      );
    } else {
      // Add new matrix
      const newMatrix = {
        ...matrixFormData,
        id: Math.max(0, ...pricingMatrices.map(m => m.id)) + 1,
        entries: []
      };
      setPricingMatrices(prevMatrices => [...prevMatrices, newMatrix]);
      setSelectedMatrixId(newMatrix.id);
    }
    setShowMatrixDialog(false);
  };

  // Handle saving a matrix entry
  const handleSaveEntry = () => {
    if (entryFormData.id) {
      // Update existing entry
      setPricingMatrices(prevMatrices => 
        prevMatrices.map(matrix => {
          if (matrix.id === selectedMatrixId) {
            return {
              ...matrix,
              entries: matrix.entries.map(entry => 
                entry.id === entryFormData.id ? { ...entryFormData } : entry
              )
            };
          }
          return matrix;
        })
      );
    } else {
      // Add new entry
      const newEntry = {
        ...entryFormData,
        id: Math.max(0, ...selectedMatrix.entries.map(e => e.id), ...pricingMatrices.flatMap(m => m.entries.map(e => e.id))) + 1
      };
      setPricingMatrices(prevMatrices => 
        prevMatrices.map(matrix => {
          if (matrix.id === selectedMatrixId) {
            return {
              ...matrix,
              entries: [...matrix.entries, newEntry]
            };
          }
          return matrix;
        })
      );
    }
    setShowEntryDialog(false);
  };

  // Handle saving a business rule
  const handleSaveRule = () => {
    if (ruleFormData.id) {
      // Update existing rule
      setBusinessRules(prevRules => 
        prevRules.map(rule => 
          rule.id === ruleFormData.id ? { ...ruleFormData } : rule
        )
      );
    } else {
      // Add new rule
      const newRule = {
        ...ruleFormData,
        id: Math.max(0, ...businessRules.map(r => r.id)) + 1
      };
      setBusinessRules(prevRules => [...prevRules, newRule]);
    }
    setShowRuleDialog(false);
  };

  // Handle confirming deletion
  const handleConfirmDelete = () => {
    if (deleteTarget.type === 'matrix') {
      setPricingMatrices(prevMatrices => prevMatrices.filter(m => m.id !== deleteTarget.id));
      if (selectedMatrixId === deleteTarget.id && pricingMatrices.length > 1) {
        setSelectedMatrixId(pricingMatrices.find(m => m.id !== deleteTarget.id)?.id);
      }
    } else if (deleteTarget.type === 'entry') {
      setPricingMatrices(prevMatrices => 
        prevMatrices.map(matrix => {
          if (matrix.id === selectedMatrixId) {
            return {
              ...matrix,
              entries: matrix.entries.filter(entry => entry.id !== deleteTarget.id)
            };
          }
          return matrix;
        })
      );
    } else if (deleteTarget.type === 'rule') {
      setBusinessRules(prevRules => prevRules.filter(rule => rule.id !== deleteTarget.id));
    }
    setShowDeleteConfirmation(false);
    setDeleteTarget({ type: '', id: null });
  };

  // Handle toggling the active status of an entry
  const handleToggleEntryStatus = (entryId) => {
    setPricingMatrices(prevMatrices => 
      prevMatrices.map(matrix => {
        if (matrix.id === selectedMatrixId) {
          return {
            ...matrix,
            entries: matrix.entries.map(entry => {
              if (entry.id === entryId) {
                return { ...entry, isActive: !entry.isActive };
              }
              return entry;
            })
          };
        }
        return matrix;
      })
    );
  };

  // Handle toggling the active status of a rule
  const handleToggleRuleStatus = (ruleId) => {
    setBusinessRules(prevRules => 
      prevRules.map(rule => {
        if (rule.id === ruleId) {
          return { ...rule, isActive: !rule.isActive };
        }
        return rule;
      })
    );
  };

  // Handle input change for matrix form
  const handleMatrixInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMatrixFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle input change for entry form
  const handleEntryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For numeric fields, convert to number
    if (name === 'price100' || name === 'priceN' || name === 'riskCoverage') {
      setEntryFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : Number(value)
      }));
    } else {
      setEntryFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle input change for rule form
  const handleRuleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (criteria.type, criteria.threshold, etc.)
      const [parent, child] = name.split('.');
      setRuleFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : 
                  (child === 'threshold' || child === 'value') ? Number(value) : value
        }
      }));
    } else {
      setRuleFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Function to render the pricing matrix tab
  const renderPricingMatrixTab = () => {
    return (
      <div>
        {/* Matrix selector and actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <label htmlFor="matrix-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Pricing Matrix
            </label>
            <div className="flex items-center">
              <select
                id="matrix-select"
                className="mr-2 block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                value={selectedMatrixId}
                onChange={(e) => setSelectedMatrixId(Number(e.target.value))}
              >
                {pricingMatrices.map(matrix => (
                  <option key={matrix.id} value={matrix.id}>
                    {matrix.name} ({matrix.businessArea})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleOpenMatrixDialog(selectedMatrix)}
                className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-full"
                title="Edit matrix"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setDeleteTarget({ type: 'matrix', id: selectedMatrixId });
                  setShowDeleteConfirmation(true);
                }}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full ml-1"
                title="Delete matrix"
                disabled={pricingMatrices.length <= 1}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <button
              onClick={() => handleOpenMatrixDialog()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add New Matrix
            </button>
          </div>
        </div>

        {/* Selected matrix details */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                {selectedMatrix.name}
              </h2>
              <p className="text-sm text-gray-500">
                Business Area: {selectedMatrix.businessArea} | Status: {selectedMatrix.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <button
              onClick={() => handleOpenEntryDialog()}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Matrix Entry
            </button>
          </div>

          {/* Matrix entries table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beneficiary
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (100%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price (N%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedMatrix.entries.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                      No entries found. Add a new entry to get started.
                    </td>
                  </tr>
                ) : (
                  selectedMatrix.entries.map(entry => (
                    <tr key={entry.id} className={!entry.isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.bank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.beneficiary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.tenor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.price100}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.priceN}% ({entry.riskCoverage}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {entry.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenEntryDialog(entry)}
                          className="text-primary hover:text-primary-dark mr-3"
                        >
                          <PencilSquareIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleToggleEntryStatus(entry.id)}
                          className={`${entry.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} mr-3`}
                        >
                          {entry.isActive ? <LockOpenIcon className="h-4 w-4 inline" /> : <LockClosedIcon className="h-4 w-4 inline" />}
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget({ type: 'entry', id: entry.id });
                            setShowDeleteConfirmation(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  // Function to render the business rules tab
  const renderBusinessRulesTab = () => {
    // Will implement in the next part
    return (
      <div>
        <div className="flex justify-end mb-6">
          <button
            onClick={() => handleOpenRuleDialog()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Business Rule
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-800">
              Business Rules
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {businessRules.length === 0 ? (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                No business rules found. Add a new rule to get started.
              </div>
            ) : (
              businessRules.map(rule => (
                <div key={rule.id} className={`px-6 py-4 ${!rule.isActive ? 'bg-gray-50' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                      
                      <div className="mt-3 bg-gray-50 rounded-md p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Criteria</p>
                            <div className="flex items-center">
                              <WrenchScrewdriverIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm">
                                {rule.criteria.type === 'deal_value' && (
                                  <>Deal value {rule.criteria.operator} ${rule.criteria.threshold.toLocaleString()}</>
                                )}
                                {rule.criteria.type === 'obligor_rating' && (
                                  <>Obligor rating {rule.criteria.operator} {rule.criteria.value}</>
                                )}
                                {rule.criteria.type === 'tenor' && (
                                  <>Tenor {rule.criteria.operator} {rule.criteria.threshold} days</>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">Action</p>
                            <div className="flex items-center">
                              <PlusIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm">
                                Apply {rule.action.type === 'discount' ? 'discount' : 'premium'} of {rule.action.value}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <button
                        onClick={() => handleOpenRuleDialog(rule)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilSquareIcon className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleToggleRuleStatus(rule.id)}
                        className={`inline-flex items-center px-2 py-1 border rounded-md text-xs font-medium ${rule.isActive ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-green-300 text-green-700 hover:bg-green-50'}`}
                      >
                        {rule.isActive ? (
                          <>
                            <LockOpenIcon className="h-3 w-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <LockClosedIcon className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setDeleteTarget({ type: 'rule', id: rule.id });
                          setShowDeleteConfirmation(true);
                        }}
                        className="inline-flex items-center px-2 py-1 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50"
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pricing Matrix Configuration</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'matrix' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('matrix')}
        >
          Pricing Matrix
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'rules' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('rules')}
        >
          Business Rules
        </button>
      </div>
      
      {/* Content for the active tab */}
      {activeTab === 'matrix' ? renderPricingMatrixTab() : renderBusinessRulesTab()}
      
      {/* Matrix Dialog */}
      {showMatrixDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">
                {matrixFormData.id ? 'Edit Pricing Matrix' : 'Add New Pricing Matrix'}
              </h3>
              <button
                onClick={() => setShowMatrixDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveMatrix(); }}>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Matrix Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={matrixFormData.name}
                    onChange={handleMatrixInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="businessArea" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Area
                  </label>
                  <select
                    id="businessArea"
                    name="businessArea"
                    value={matrixFormData.businessArea}
                    onChange={handleMatrixInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    required
                  >
                    {BUSINESS_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={matrixFormData.isActive}
                    onChange={handleMatrixInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <button
                  type="button"
                  onClick={() => setShowMatrixDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {matrixFormData.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entry Dialog */}
      {showEntryDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">
                {entryFormData.id ? 'Edit Matrix Entry' : 'Add New Matrix Entry'}
              </h3>
              <button
                onClick={() => setShowEntryDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEntry(); }}>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={entryFormData.country}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={entryFormData.location}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="Enter 'ALL' to default for all locations"
                    />
                  </div>
                  <div>
                    <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-1">
                      Bank
                    </label>
                    <input
                      type="text"
                      id="bank"
                      name="bank"
                      value={entryFormData.bank}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="Enter 'ALL' to default for all banks"
                    />
                  </div>
                  <div>
                    <label htmlFor="beneficiary" className="block text-sm font-medium text-gray-700 mb-1">
                      Beneficiary
                    </label>
                    <input
                      type="text"
                      id="beneficiary"
                      name="beneficiary"
                      value={entryFormData.beneficiary}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="Enter 'ALL' to default for all beneficiaries"
                    />
                  </div>
                  <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <input
                      type="text"
                      id="product"
                      name="product"
                      value={entryFormData.product}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="tenor" className="block text-sm font-medium text-gray-700 mb-1">
                      Tenor
                    </label>
                    <input
                      type="text"
                      id="tenor"
                      name="tenor"
                      value={entryFormData.tenor}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="price100" className="block text-sm font-medium text-gray-700 mb-1">
                      Price for 100% Risk (%)
                    </label>
                    <input
                      type="number"
                      id="price100"
                      name="price100"
                      value={entryFormData.price100}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="priceN" className="block text-sm font-medium text-gray-700 mb-1">
                      Price for N% Risk (%)
                    </label>
                    <input
                      type="number"
                      id="priceN"
                      name="priceN"
                      value={entryFormData.priceN}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="riskCoverage" className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Coverage (N%)
                    </label>
                    <input
                      type="number"
                      id="riskCoverage"
                      name="riskCoverage"
                      value={entryFormData.riskCoverage}
                      onChange={handleEntryInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      step="1"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="entryIsActive"
                    name="isActive"
                    checked={entryFormData.isActive}
                    onChange={handleEntryInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="entryIsActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <button
                  type="button"
                  onClick={() => setShowEntryDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {entryFormData.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Rule Dialog */}
      {showRuleDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">
                {ruleFormData.id ? 'Edit Business Rule' : 'Add New Business Rule'}
              </h3>
              <button
                onClick={() => setShowRuleDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveRule(); }}>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label htmlFor="ruleName" className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    id="ruleName"
                    name="name"
                    value={ruleFormData.name}
                    onChange={handleRuleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={ruleFormData.description}
                    onChange={handleRuleInputChange}
                    rows="2"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Criteria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                    <div>
                      <label htmlFor="criteriaType" className="block text-xs font-medium text-gray-500 mb-1">
                        Type
                      </label>
                      <select
                        id="criteriaType"
                        name="criteria.type"
                        value={ruleFormData.criteria.type}
                        onChange={handleRuleInputChange}
                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      >
                        <option value="deal_value">Deal Value</option>
                        <option value="obligor_rating">Obligor Rating</option>
                        <option value="tenor">Tenor</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="criteriaOperator" className="block text-xs font-medium text-gray-500 mb-1">
                        Operator
                      </label>
                      <select
                        id="criteriaOperator"
                        name="criteria.operator"
                        value={ruleFormData.criteria.operator}
                        onChange={handleRuleInputChange}
                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      >
                        <option value="=">Equals (=)</option>
                        <option value=">">Greater Than (&gt;)</option>
                        <option value=">=">Greater Than or Equal (&gt;=)</option>
                        <option value="<">Less Than (&lt;)</option>
                        <option value="<=">Less Than or Equal (&lt;=)</option>
                      </select>
                    </div>
                    {ruleFormData.criteria.type === 'obligor_rating' ? (
                      <div>
                        <label htmlFor="criteriaValue" className="block text-xs font-medium text-gray-500 mb-1">
                          Rating
                        </label>
                        <select
                          id="criteriaValue"
                          name="criteria.value"
                          value={ruleFormData.criteria.value}
                          onChange={handleRuleInputChange}
                          className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        >
                          <option value="AAA">AAA</option>
                          <option value="AA">AA</option>
                          <option value="A">A</option>
                          <option value="BBB">BBB</option>
                          <option value="BB">BB</option>
                          <option value="B">B</option>
                          <option value="CCC">CCC</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="criteriaThreshold" className="block text-xs font-medium text-gray-500 mb-1">
                          {ruleFormData.criteria.type === 'deal_value' ? 'Amount' : 'Days'}
                        </label>
                        <input
                          type="number"
                          id="criteriaThreshold"
                          name="criteria.threshold"
                          value={ruleFormData.criteria.threshold}
                          onChange={handleRuleInputChange}
                          className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                          min="0"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Action</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="actionType" className="block text-xs font-medium text-gray-500 mb-1">
                        Type
                      </label>
                      <select
                        id="actionType"
                        name="action.type"
                        value={ruleFormData.action.type}
                        onChange={handleRuleInputChange}
                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      >
                        <option value="discount">Discount</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="actionValue" className="block text-xs font-medium text-gray-500 mb-1">
                        Value (%)
                      </label>
                      <input
                        type="number"
                        id="actionValue"
                        name="action.value"
                        value={ruleFormData.action.value}
                        onChange={handleRuleInputChange}
                        className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ruleIsActive"
                    name="isActive"
                    checked={ruleFormData.isActive}
                    onChange={handleRuleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="ruleIsActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <button
                  type="button"
                  onClick={() => setShowRuleDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {ruleFormData.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-800">
                Confirm Deletion
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-700">
                {deleteTarget.type === 'matrix' && 'Are you sure you want to delete this pricing matrix? This will remove all associated entries and cannot be undone.'}
                {deleteTarget.type === 'entry' && 'Are you sure you want to delete this entry? This action cannot be undone.'}
                {deleteTarget.type === 'rule' && 'Are you sure you want to delete this business rule? This action cannot be undone.'}
              </p>
            </div>
            <div className="px-6 py-3 bg-gray-50 text-right">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default PricingMatrix; 