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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">Transaction not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Details</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate('/transactions')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
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
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${processingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
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
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cancel All
            </button>
          )}
          
          {transaction.status === 'SUBMITTED' && !isEditingEntity && !isEditingTrading && !isEditing && (
            <button
              onClick={handleProcess}
              disabled={processingAction}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${processingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processingAction ? 'Processing...' : 'Process Transaction'}
            </button>
          )}
          
          {transaction.status === 'APPROVED' && !isEditingEntity && !isEditingTrading && !isEditing && (
            <button
              onClick={handleClose}
              disabled={processingAction}
              className={`px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 ${processingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processingAction ? 'Processing...' : 'Close Transaction'}
            </button>
          )}
        </div>
      </div>

      {/* ADB Client Profile Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">ADB Client Profile</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Institution Name</h3>
              <p className="text-base">{transaction.client_name || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Country</h3>
              <p className="text-base">{transaction.client_country || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
              <p className="text-base">{transaction.client_address || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Used Limit</h3>
              <p className="text-base">{transaction.used_limit ? `${transaction.used_limit} ${transaction.currency}` : 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Approved Limit</h3>
              <p className="text-base">{transaction.approved_limit ? `${transaction.approved_limit} ${transaction.currency}` : 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Onboard Date</h3>
              <p className="text-base">{transaction.onboard_date ? new Date(transaction.onboard_date).toLocaleDateString() : 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Client Type</h3>
              <p className="text-base">{transaction.client_type || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Risk Rating</h3>
              <p className="text-base">{transaction.risk_rating || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transaction Overview Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                {transaction.reference_number}
              </h2>
              <p className="text-sm text-gray-500">Created on {formatDate(transaction.created_at, true)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(transaction.status)}`}>
                {transaction.status}
              </span>
              {transaction.source && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Source: {transaction.source || 'Manual'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Event Type</h3>
              <p className="text-base">{transaction.event_type}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
              <p className="text-lg text-gray-800 font-medium">
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Client ID</h3>
              <p className="text-base">{transaction.client_id}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Product ID</h3>
              <p className="text-base">{transaction.product_id}</p>
            </div>
            
            {transaction.counterparty_id && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Counterparty ID</h3>
                <p className="text-base">{transaction.counterparty_id}</p>
              </div>
            )}
            
            {transaction.maturity_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Maturity Date</h3>
                <p className="text-base">{new Date(transaction.maturity_date).toLocaleDateString()}</p>
              </div>
            )}
            
            {transaction.pricing_rate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Pricing Rate</h3>
                <p className="text-base">{transaction.pricing_rate}%</p>
              </div>
            )}
            
            {transaction.inquiry_reference && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Inquiry Reference</h3>
                <p className="text-base">{transaction.inquiry_reference}</p>
              </div>
            )}
          </div>
          
          {transaction.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
              <p className="text-base whitespace-pre-wrap">{transaction.notes}</p>
            </div>
          )}
        </div>
      </div>
      

      
      {/* Trade Entity Information Section */}
      {(!transaction.source || ['Manual', 'Email', 'File'].includes(transaction.source)) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Trade Entity Information</h2>
            <div>
              {!isEditingEntity ? (
                <button
                  onClick={() => setIsEditingEntity(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit Details
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitEntitySection}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEntity(false)}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {entities.length > 0 ? (
            <div className="overflow-x-auto">
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
                    <tr key={entity.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entity.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entity.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entity.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entity.country}</td>
                      {isEditingEntity && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => openEditEntityModal(entity)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteEntity(entity.id || index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No entity information available</p>
          )}
          
          {isEditingEntity && (
            <div className="mt-4">
              <button
                onClick={openAddEntityModal}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Entity
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Trading Information Section */}
      {(!transaction.source || ['Manual', 'Email', 'File'].includes(transaction.source)) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Trading Information</h2>
            <div>
              {!isEditingTrading ? (
                <button
                  onClick={() => setIsEditingTrading(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit Details
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSubmitTradingSection}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTrading(false)}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Industry Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            {isEditingTrading ? (
              <input
                type="text"
                name="industry"
                value={formData.industry || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter industry information"
              />
            ) : (
              <p className="text-gray-700">{transaction.industry || 'Not specified'}</p>
            )}
          </div>
          
          {/* List of Goods as Table */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">List of Goods</label>
            
            {tradeGoods.length > 0 ? (
              <div className="overflow-x-auto">
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
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{good.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{good.quantity || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{good.unit || 'N/A'}</td>
                        {isEditingTrading && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleEditTradeGood(good, index)}
                              className="text-indigo-600 hover:text-indigo-900 mr-2"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteTradeGood(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No goods listed</p>
            )}
            
            {isEditingTrading && (
              <div className="mt-4">
                <button
                  onClick={openAddTradeGoodModal}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Good
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Entity Modal */}
      {showEntityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end space-x-2 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowEntityModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currentEntity ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Trade Good Modal */}
      {showTradeGoodModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    name="unit"
                    value={tradeGoodFormData.unit}
                    onChange={handleTradeGoodInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTradeGoodModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {currentTradeGoodIndex !== null ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Service Checks Result Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Service Check Results</h2>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Sanctions Check</h3>
              {transaction.sanctions_check_passed === null ? (
                <p className="text-base text-gray-500">Not processed</p>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.sanctions_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {transaction.sanctions_check_passed ? 'Passed' : 'Failed'}
                </span>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Eligibility Check</h3>
              {transaction.eligibility_check_passed === null ? (
                <p className="text-base text-gray-500">Not processed</p>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.eligibility_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {transaction.eligibility_check_passed ? 'Passed' : 'Failed'}
                </span>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Limits Check</h3>
              {transaction.limits_check_passed === null ? (
                <p className="text-base text-gray-500">Not processed</p>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.limits_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {transaction.limits_check_passed ? 'Passed' : 'Failed'}
                </span>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Exposure Check</h3>
              {transaction.exposure_check_passed === null ? (
                <p className="text-base text-gray-500">Not processed</p>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.exposure_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {transaction.exposure_check_passed ? 'Passed' : 'Failed'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
     </div>
  );
};

export default TransactionDetail; 