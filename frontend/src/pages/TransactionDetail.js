import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { mockTransactionData, MOCK_TRANSACTION_DATA } from '../data/mockTransactionData';
import { 
  normalizeTransaction, 
  normalizeGoodsList, 
  formatCurrency, 
  formatDate
} from '../utils/dataUtils';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  EnvelopeIcon,
  DocumentIcon,
  TagIcon,
  GlobeAmericasIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CalendarIcon,
  IdentificationIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

// Add some CSS for animations
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 125, 183, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 125, 183, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 125, 183, 0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out forwards;
}

.hover-lift {
  transition: transform 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-3px);
}

.pulse {
  animation: pulse 2s infinite;
}
`;

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  
  // Entity table state
  const [entities, setEntities] = useState([]);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [entityFormData, setEntityFormData] = useState({
    id: '',
    type: '',
    name: '',
    country: '',
    address: ''
  });
  
  // Other form state
  const [formData, setFormData] = useState({
    goodsList: '',
    industry: ''
  });
  
  // Separate edit states for different sections
  const [isEditingEntity, setIsEditingEntity] = useState(false);
  const [isEditingTrading, setIsEditingTrading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Keep for backward compatibility

  // Add state for managing trading goods as an array
  const [tradeGoods, setTradeGoods] = useState([]);
  const [showTradeGoodModal, setShowTradeGoodModal] = useState(false);
  const [currentTradeGoodIndex, setCurrentTradeGoodIndex] = useState(null);
  const [tradeGoodFormData, setTradeGoodFormData] = useState({
    id: '',
    name: '',
    quantity: '',
    unit: ''
  });

  // First add a new state for the trading information modal
  const [showTradeInfoModal, setShowTradeInfoModal] = useState(false);

  // Add this to your state declarations at the top of the component
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        // First attempt to fetch from API
        const response = await axios.get(`http://localhost:8000/api/transactions/${id}`);
        const normalizedData = normalizeTransaction(response.data);
        setTransaction(normalizedData);
        
        // Set entities from normalized response
        setEntities(normalizedData.entities);
        
        // Set trade goods from normalized response
        setTradeGoods(normalizedData.goods_list);
        
        // Initialize form data from transaction
        if (normalizedData) {
          setFormData({
            goodsList: normalizedData.goods_list,
            industry: normalizedData.industry || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        
        // If API fails, use mock data instead of showing error
        console.log('Using mock data for demonstration');
        
        // First try to find the transaction in our MOCK_TRANSACTION_DATA array
        const foundTransaction = MOCK_TRANSACTION_DATA.find(t => t.id.toString() === id);
        
        // If found, use that transaction data, otherwise use the default mockTransactionData with updated ID
        const mockData = foundTransaction || {...mockTransactionData, id};
        const normalizedData = normalizeTransaction(mockData);
        
        setTransaction(normalizedData);
        setEntities(normalizedData.entities);
        setTradeGoods(normalizedData.goods_list);
        
        // Initialize form data from mock transaction
        setFormData({
          goodsList: normalizedData.goods_list,
          industry: normalizedData.industry || ''
        });
        
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEntityInputChange = (e) => {
    const { name, value } = e.target;
    setEntityFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddEntityModal = () => {
    setCurrentEntity(null);
    setEntityFormData({
      id: Date.now(),
      type: '',
      name: '',
      country: '',
      address: ''
    });
    setShowEntityModal(true);
  };

  const openEditEntityModal = (entity) => {
    setCurrentEntity(entity);
    setEntityFormData({
      id: entity.id,
      type: entity.type || '',
      name: entity.name || '',
      country: entity.country || '',
      address: entity.address || ''
    });
    setShowEntityModal(true);
  };

  const handleEntitySubmit = (e) => {
    e.preventDefault();
    
    if (currentEntity) {
      // Update existing entity
      setEntities(prev => 
        prev.map(entity => 
          entity.id === entityFormData.id ? entityFormData : entity
        )
      );
    } else {
      // Add new entity
      setEntities(prev => [...prev, entityFormData]);
    }
    
    setShowEntityModal(false);
  };

  const handleSubmitEntitySection = async (e) => {
    e.preventDefault();
    try {
      setProcessingAction(true);
      
      const response = await axios.put(`http://localhost:8000/api/transactions/${id}`, {
        entities: entities
      });
      
      setTransaction(response.data);
      setIsEditingEntity(false);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error updating entities:', err);
      
      setTransaction(prev => ({
        ...prev,
        entities: entities
      }));
      setIsEditingEntity(false);
      setProcessingAction(false);
    }
  };
  
  const handleSubmitTradingSection = async (e) => {
    e.preventDefault();
    try {
      setProcessingAction(true);
      
      // Using the tradeGoods array directly now
      const response = await axios.put(`http://localhost:8000/api/transactions/${id}`, {
        goods_list: tradeGoods,
        industry: formData.industry
      });
      
      setTransaction(response.data);
      setIsEditingTrading(false);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error updating trading information:', err);
      
      // Update local transaction state with form data
      setTransaction(prev => ({
        ...prev,
        goods_list: tradeGoods,
        industry: formData.industry
      }));
      setIsEditingTrading(false);
      setProcessingAction(false);
    }
  };

  const handleDeleteEntity = (entityId) => {
    setEntities(prev => prev.filter(entity => entity.id !== entityId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessingAction(true);
      
      const response = await axios.put(`http://localhost:8000/api/transactions/${id}`, {
        entities: entities,
        goods_list: tradeGoods,
        industry: formData.industry
      });
      
      setTransaction(response.data);
      setIsEditing(false);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error updating transaction:', err);
      
      // If API fails, update local state with form data
      console.log('Using mock data for demonstration');
      
      setTransaction(prev => ({
        ...prev,
        entities: entities,
        goods_list: tradeGoods,
        industry: formData.industry
      }));
      setIsEditing(false);
      setProcessingAction(false);
    }
  };

  const handleProcess = async () => {
    try {
      setProcessingAction(true);
      const response = await axios.post(`http://localhost:8000/api/transactions/${id}/process`);
      setTransaction(response.data);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error processing transaction:', err);
      
      // If API fails, update mock data state
      console.log('Using mock data for processing transaction');
      setTransaction(prev => ({
        ...prev,
        status: 'PROCESSING',
        sanctions_check_passed: true,
        eligibility_check_passed: true
      }));
      setProcessingAction(false);
    }
  };

  const handleClose = async () => {
    try {
      setProcessingAction(true);
      const response = await axios.put(`http://localhost:8000/api/transactions/${id}`, {
        status: 'COMPLETED'
      });
      setTransaction(response.data);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error closing transaction:', err);
      
      // If API fails, update mock data state
      console.log('Using mock data for closing transaction');
      setTransaction(prev => ({
        ...prev,
        status: 'COMPLETED',
        completion_date: new Date().toISOString()
      }));
      setProcessingAction(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add handlers for trade goods
  const handleTradeGoodInputChange = (e) => {
    const { name, value } = e.target;
    setTradeGoodFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddTradeGoodModal = () => {
    setCurrentTradeGoodIndex(null);
    setTradeGoodFormData({
      name: '',
      quantity: '',
      unit: ''
    });
    setShowTradeGoodModal(true);
  };

  const handleEditTradeGood = (good, index) => {
    setTradeGoodFormData({
      name: good.name,
      quantity: good.quantity || '',
      unit: good.unit || ''
    });
    setCurrentTradeGoodIndex(index);
    setShowTradeGoodModal(true);
  };

  const handleTradeGoodSubmit = (e) => {
    e.preventDefault();
    
    if (currentTradeGoodIndex !== null) {
      // Update existing good
      setTradeGoods(prev => 
        prev.map((good, index) => 
          index === currentTradeGoodIndex ? tradeGoodFormData : good
        )
      );
    } else {
      // Add new good
      setTradeGoods(prev => [...prev, tradeGoodFormData]);
    }
    
    setShowTradeGoodModal(false);
  };

  const handleDeleteTradeGood = (index) => {
    setTradeGoods(prevGoods => prevGoods.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 animate-fadeIn">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-gray-600 font-medium">Loading transaction details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-md animate-fadeIn">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error Loading Transaction</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => navigate('/transactions')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Return to Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg shadow-md animate-fadeIn">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">Transaction Not Found</h3>
            <p className="mt-2 text-sm text-yellow-700">The requested transaction could not be found. It may have been deleted or you may not have permission to view it.</p>
            <div className="mt-4">
              <button
                onClick={() => navigate('/transactions')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Return to Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-800">Transaction Details</h1>
          <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate('/transactions')}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to List
          </button>
          
          {(isEditingEntity || isEditingTrading || isEditing) && (
            <button
              onClick={() => {
                handleSubmit();
                setIsEditingEntity(false);
                setIsEditingTrading(false);
                setIsEditing(false);
              }}
              disabled={processingAction}
              className={`flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 ${processingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              {processingAction ? 'Saving...' : 'Save All Changes'}
            </button>
          )}
          
          {(isEditingEntity || isEditingTrading || isEditing) && (
            <button
              onClick={() => {
                setIsEditingEntity(false);
                setIsEditingTrading(false);
                setIsEditing(false);
              }}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
            >
              <XCircleIcon className="h-4 w-4 mr-1" />
              Cancel All
            </button>
          )}
          
          {transaction.status === 'SUBMITTED' && !isEditingEntity && !isEditingTrading && !isEditing && (
            <button
              onClick={handleProcess}
              disabled={processingAction}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 ${processingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              {processingAction ? 'Processing...' : 'Process Transaction'}
            </button>
          )}
          
          {transaction.status === 'APPROVED' && !isEditingEntity && !isEditingTrading && !isEditing && (
            <button
              onClick={handleClose}
              disabled={processingAction}
              className={`flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 ${processingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ClockIcon className="h-4 w-4 mr-1" />
              {processingAction ? 'Processing...' : 'Close Transaction'}
            </button>
          )}
        </div>
      </div>

      {/* ADB Client Profile Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-800">ADB Client Profile</h2>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <UserIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Institution Name</h3>
                <p className="text-base font-medium">{transaction.client_name || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <GlobeAmericasIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Country</h3>
                <p className="text-base">{transaction.client_country || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPinIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                <p className="text-base">{transaction.client_address || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Used Limit</h3>
                <p className="text-base">{transaction.used_limit ? `${transaction.used_limit} ${transaction.currency}` : 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <BanknotesIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Approved Limit</h3>
                <p className="text-base">{transaction.approved_limit ? `${transaction.approved_limit} ${transaction.currency}` : 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Onboard Date</h3>
                <p className="text-base">{transaction.onboard_date ? new Date(transaction.onboard_date).toLocaleDateString() : 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <IdentificationIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Client Type</h3>
                <p className="text-base">{transaction.client_type || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Risk Rating</h3>
                <p className="text-base">{transaction.risk_rating || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction Overview Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <h2 className="text-lg font-medium text-gray-800">
                  {transaction.reference_number}
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Created on {formatDate(transaction.created_at, true)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusClass(transaction.status)}`}>
                {transaction.status === 'APPROVED' ? <CheckCircleIcon className="h-4 w-4 mr-1" /> : 
                 transaction.status === 'PROCESSING' ? <ClockIcon className="h-4 w-4 mr-1" /> : 
                 transaction.status === 'DECLINED' ? <XCircleIcon className="h-4 w-4 mr-1" /> : 
                 transaction.status === 'COMPLETED' ? <CheckIcon className="h-4 w-4 mr-1" /> : 
                 <ExclamationCircleIcon className="h-4 w-4 mr-1" />}
                {transaction.status}
              </span>
              {transaction.source && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center">
                  {transaction.source === 'Email' ? <EnvelopeIcon className="h-4 w-4 mr-1" /> : 
                   transaction.source === 'File' ? <DocumentIcon className="h-4 w-4 mr-1" /> : 
                   <PencilSquareIcon className="h-4 w-4 mr-1" />}
                  Source: {transaction.source || 'Manual'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <TagIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Event Type</h3>
                <p className="text-base font-medium">{transaction.event_type}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <BanknotesIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
                <p className="text-lg text-gray-800 font-semibold">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <BuildingOfficeIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Client ID</h3>
                <p className="text-base">{transaction.client_id}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <DocumentTextIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Product ID</h3>
                <p className="text-base">{transaction.product_id}</p>
              </div>
            </div>
            
            {transaction.counterparty_id && (
              <div className="flex items-start">
                <BuildingLibraryIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Counterparty ID</h3>
                  <p className="text-base">{transaction.counterparty_id}</p>
                </div>
              </div>
            )}
            
            {transaction.maturity_date && (
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Maturity Date</h3>
                  <p className="text-base">{new Date(transaction.maturity_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            
            {transaction.pricing_rate && (
              <div className="flex items-start">
                <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Pricing Rate</h3>
                  <p className="text-base">{transaction.pricing_rate}%</p>
                </div>
              </div>
            )}
            
            {transaction.inquiry_reference && (
              <div className="flex items-start">
                <DocumentTextIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Inquiry Reference</h3>
                  <p className="text-base">{transaction.inquiry_reference}</p>
                </div>
              </div>
            )}
          </div>
          
          {transaction.notes && (
            <div className="flex items-start mt-6 p-4 bg-gray-50 rounded-lg">
              <DocumentTextIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                <p className="text-base whitespace-pre-wrap">{transaction.notes}</p>
              </div>
            </div>
          )}

          {/* View Source Email Button - Only for Email sourced transactions */}
          {transaction.source === 'Email' && (
            <div className="mt-6 flex justify-start">
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                View Source Email
              </button>
            </div>
          )}

          {/* View Source File Button - Only for File sourced transactions */}
          {transaction.source === 'File' && (
            <div className="mt-6 flex justify-start">
              <button
                onClick={() => setShowFileModal(true)}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <DocumentIcon className="h-5 w-5 mr-2" />
                View Source File
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Trade Entity Information Section */}
      {(!transaction.source || ['Manual', 'Email', 'File'].includes(transaction.source)) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <BuildingLibraryIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Trade Entity Information</h2>
            </div>
            <div>
              {!isEditingEntity ? (
                <button
                  onClick={() => setIsEditingEntity(true)}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <PencilSquareIcon className="h-4 w-4 mr-1" />
                  Edit Details
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitEntitySection}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEntity(false)}
                    className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {entities.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    {isEditingEntity && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entities.map((entity, index) => (
                    <tr key={entity.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entity.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entity.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entity.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entity.country}</td>
                      {isEditingEntity && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => openEditEntityModal(entity)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <PencilSquareIcon className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteEntity(entity.id || index)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 italic">No entity information available</p>
            </div>
          )}
          
          {isEditingEntity && (
            <div className="mt-4">
              <button
                onClick={openAddEntityModal}
                className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Entity
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Trading Information Section */}
      {(!transaction.source || ['Manual', 'Email', 'File'].includes(transaction.source)) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <TruckIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Trading Information</h2>
            </div>
            <div>
              {!isEditingTrading ? (
                <button
                  onClick={() => setIsEditingTrading(true)}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <PencilSquareIcon className="h-4 w-4 mr-1" />
                  Edit Details
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitTradingSection}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTrading(false)}
                    className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Industry Field */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <BuildingOfficeIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                {isEditingTrading ? (
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter industry information"
                  />
                ) : (
                  <p className="text-gray-700 font-medium">{transaction.industry || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* List of Goods as Table */}
          <div>
            <div className="flex items-center mb-2">
              <TagIcon className="h-5 w-5 text-primary mr-2" />
              <label className="block text-sm font-medium text-gray-700">List of Goods</label>
            </div>
            
            {tradeGoods.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      {isEditingTrading && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tradeGoods.map((good, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{good.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{good.quantity || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{good.unit || 'N/A'}</td>
                        {isEditingTrading && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button 
                                onClick={() => handleEditTradeGood(good, index)}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              >
                                <PencilSquareIcon className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteTradeGood(index)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500 italic">No goods listed</p>
              </div>
            )}
            
            {isEditingTrading && (
              <div className="mt-4">
                <button
                  onClick={openAddTradeGoodModal}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Good
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Entity Modal */}
      {showEntityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-slideIn">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <BuildingLibraryIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">
                {currentEntity ? 'Edit Entity' : 'Add New Entity'}
              </h3>
            </div>
            <form onSubmit={handleEntitySubmit}>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                  <select
                    name="type"
                    value={entityFormData.type}
                    onChange={handleEntityInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                    required
                  >
                    <option value="">Select Entity Type</option>
                    <option value="Issuing Bank">Issuing Bank</option>
                    <option value="Confirming Bank">Confirming Bank</option>
                    <option value="Importer">Importer</option>
                    <option value="Supplier">Supplier</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={entityFormData.name}
                    onChange={handleEntityInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={entityFormData.country}
                    onChange={handleEntityInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={entityFormData.address}
                    onChange={handleEntityInputChange}
                    rows="3"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowEntityModal(false)}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {currentEntity ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Trade Good Modal */}
      {showTradeGoodModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-slideIn">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center">
              <TagIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-800">
                {currentTradeGoodIndex !== null ? 'Edit Trade Good' : 'Add New Trade Good'}
              </h3>
            </div>
            <form onSubmit={handleTradeGoodSubmit}>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    value={tradeGoodFormData.name}
                    onChange={handleTradeGoodInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={tradeGoodFormData.quantity}
                    onChange={handleTradeGoodInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    name="unit"
                    value={tradeGoodFormData.unit}
                    onChange={handleTradeGoodInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                  >
                    <option value="">Select Unit</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="units">Units</option>
                    <option value="tonnes">Tonnes</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="litres">Litres</option>
                    <option value="gallons">Gallons</option>
                    <option value="barrels">Barrels</option>
                    <option value="m">Meters (m)</option>
                    <option value="ft">Feet (ft)</option>
                    <option value="sqm">Square Meters (sqm)</option>
                    <option value="MCF">Thousand Cubic Feet (MCF)</option>
                    <option value="lot">Lot</option>
                    <option value="package">Package</option>
                    <option value="container">Container</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowTradeGoodModal(false)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {currentTradeGoodIndex !== null ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Service Checks Result Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-800">Service Check Results</h2>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Sanctions Check</h3>
                {transaction.sanctions_check_passed === null ? (
                  <p className="text-base text-gray-500 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Not processed
                  </p>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${transaction.sanctions_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {transaction.sanctions_check_passed ? 
                      <><CheckCircleIcon className="h-4 w-4 mr-1" />Passed</> : 
                      <><XCircleIcon className="h-4 w-4 mr-1" />Failed</>}
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg flex items-start">
              <DocumentTextIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Eligibility Check</h3>
                {transaction.eligibility_check_passed === null ? (
                  <p className="text-base text-gray-500 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Not processed
                  </p>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${transaction.eligibility_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {transaction.eligibility_check_passed ? 
                      <><CheckCircleIcon className="h-4 w-4 mr-1" />Passed</> : 
                      <><XCircleIcon className="h-4 w-4 mr-1" />Failed</>}
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg flex items-start">
              <BanknotesIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Limits Check</h3>
                {transaction.limits_check_passed === null ? (
                  <p className="text-base text-gray-500 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Not processed
                  </p>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${transaction.limits_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {transaction.limits_check_passed ? 
                      <><CheckCircleIcon className="h-4 w-4 mr-1" />Passed</> : 
                      <><XCircleIcon className="h-4 w-4 mr-1" />Failed</>}
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg flex items-start">
              <ShieldExclamationIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Exposure Check</h3>
                {transaction.exposure_check_passed === null ? (
                  <p className="text-base text-gray-500 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1 text-gray-400" />
                    Not processed
                  </p>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${transaction.exposure_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {transaction.exposure_check_passed ? 
                      <><CheckCircleIcon className="h-4 w-4 mr-1" />Passed</> : 
                      <><XCircleIcon className="h-4 w-4 mr-1" />Failed</>}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 h-3/4 flex flex-col animate-slideIn">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">
                  Source Email
                </h3>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="mb-6 border-b pb-4 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2 text-gray-500 font-medium">From:</div>
                  <div className="col-span-10">{transaction.client_name} &lt;finance@{transaction.client_name?.toLowerCase().replace(/\s+/g, '')}example.com&gt;</div>
                  
                  <div className="col-span-2 text-gray-500 font-medium">To:</div>
                  <div className="col-span-10">transactions@adbtradeportal.com</div>
                  
                  <div className="col-span-2 text-gray-500 font-medium">Subject:</div>
                  <div className="col-span-10 font-semibold">Transaction Request: {transaction.reference_number}</div>
                  
                  <div className="col-span-2 text-gray-500 font-medium">Date:</div>
                  <div className="col-span-10">{formatDate(transaction.created_at, true)}</div>
                </div>
              </div>
              
              <div className="email-body p-4 border border-gray-100 rounded-lg shadow-sm">
                <p className="mb-4">Dear ADB Trade Portal Team,</p>
                
                <p className="mb-4">I would like to submit a new transaction request with the following details:</p>
                
                <div className="bg-gray-50 p-4 rounded-md mb-4 border-l-4 border-primary">
                  <p className="mb-2"><strong>Transaction Reference:</strong> {transaction.reference_number}</p>
                  <p className="mb-2"><strong>Amount:</strong> {formatCurrency(transaction.amount, transaction.currency)}</p>
                  <p className="mb-2"><strong>Event Type:</strong> {transaction.event_type}</p>
                  <p className="mb-2"><strong>Product:</strong> {transaction.product_name || 'Not specified'}</p>
                  <p className="mb-2"><strong>Industry:</strong> {transaction.industry}</p>
                  
                  <p className="mt-3 mb-1"><strong>Goods:</strong></p>
                  <ul className="list-disc pl-5 mt-1 mb-3">
                    {Array.isArray(transaction.goods_list) ? 
                      transaction.goods_list.map((good, index) => (
                        <li key={index}>{good.name} - {good.quantity} {good.unit}</li>
                      )) : 
                      <li>Goods list not available</li>
                    }
                  </ul>
                  
                  <p className="mt-3 mb-1"><strong>Entities:</strong></p>
                  <ul className="list-disc pl-5 mt-1">
                    {transaction.entities && transaction.entities.map((entity, index) => (
                      <li key={index}>{entity.type}: {entity.name}, {entity.country}</li>
                    ))}
                  </ul>
                </div>
                
                <p className="mb-4">Please process this transaction at your earliest convenience. If you need any further information, please let me know.</p>
                
                <p className="mb-4">Thank you for your assistance.</p>
                
                <p className="mb-2">Best regards,</p>
                <p className="mb-1">{transaction.client_name ? transaction.client_name.split(' ')[0] : 'Contact'} {transaction.client_name ? transaction.client_name.split(' ').slice(1).join(' ') : 'Person'}</p>
                <p className="text-gray-600">{transaction.client_name}</p>
                <p className="text-gray-600">{transaction.client_address}</p>
                <p className="text-gray-600">Tel: +{Math.floor(Math.random() * 9) + 1}-{Math.floor(Math.random() * 900) + 100}-{Math.floor(Math.random() * 900) + 100}-{Math.floor(Math.random() * 9000) + 1000}</p>
                <p className="text-gray-600">Email: finance@{transaction.client_name?.toLowerCase().replace(/\s+/g, '')}example.com</p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 h-3/4 flex flex-col animate-slideIn">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center">
                <DocumentIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-800">
                  Source File Content
                </h3>
              </div>
              <button
                onClick={() => setShowFileModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-3 text-gray-500 font-medium">File Name:</div>
                  <div className="col-span-9 flex items-center">
                    <DocumentIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {transaction.reference_number.toLowerCase().replace(/-/g, '_')}.csv
                  </div>
                  
                  <div className="col-span-3 text-gray-500 font-medium">File Type:</div>
                  <div className="col-span-9">CSV (Comma Separated Values)</div>
                  
                  <div className="col-span-3 text-gray-500 font-medium">Uploaded:</div>
                  <div className="col-span-9 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {formatDate(transaction.created_at, true)}
                  </div>
                  
                  <div className="col-span-3 text-gray-500 font-medium">Size:</div>
                  <div className="col-span-9">{Math.floor(Math.random() * 10) + 2} KB</div>
                </div>
              </div>
              
              <div className="file-content font-mono text-sm bg-gray-50 p-4 rounded-md overflow-x-auto border border-gray-200 shadow-inner">
                <pre className="whitespace-pre-wrap">
{`transaction_id,${transaction.reference_number}
client_id,${transaction.client_id}
client_name,${transaction.client_name}
product_id,${transaction.product_id}
product_name,${transaction.product_name || 'Not specified'}
event_type,${transaction.event_type}
currency,${transaction.currency}
amount,${transaction.amount}
industry,${transaction.industry || 'Not specified'}

# Entities
entity_type,entity_name,entity_country,entity_address
${transaction.entities && transaction.entities.map(entity => 
  `${entity.type},${entity.name},${entity.country},${entity.address}`
).join('\n')}

# Goods List
good_name,good_quantity,good_unit
${Array.isArray(transaction.goods_list) ? 
  transaction.goods_list.map(good => 
    `${good.name},${good.quantity || 'N/A'},${good.unit || 'N/A'}`
  ).join('\n') : 
  '# No goods specified'
}

# Additional Information
maturity_date,${transaction.maturity_date ? new Date(transaction.maturity_date).toISOString().split('T')[0] : 'N/A'}
pricing_rate,${transaction.pricing_rate || 'N/A'}
notes,${transaction.notes ? transaction.notes.replace(/\n/g, ' ') : 'N/A'}
`}
                </pre>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowFileModal(false)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Close
              </button>
              <button
                onClick={() => {
                  alert('Download functionality would be implemented here in a production environment.');
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail; 