import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_TRANSACTION_DATA } from '../data/mockTransactionData';
import DashboardService from '../services/dashboardService';
import TransactionStepIndicator from '../components/TransactionStepIndicator';
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
  TruckIcon,
  CalculatorIcon,
  InformationCircleIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  ArrowRightIcon
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
    industry: '',
    form_of_eligible_instrument: '',
    date_of_issue: '',
    expiry_date: '',
    terms_of_payment: '',
    currency: '',
    local_currency_amount: '',
    value_date_of_adb_guarantee: '',
    end_of_risk_period: '',
    tenor: '',
    expiry_date_of_adb_guarantee: '',
    tenor_of_adb_guarantee: ''
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
    unit: '',
    goods_classification: '',
    price: ''
  });

  // Add state for entity search modal
  const [showEntitySearchModal, setShowEntitySearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // First add a new state for the trading information modal
  const [showTradeInfoModal, setShowTradeInfoModal] = useState(false);

  // Add this to your state declarations at the top of the component
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);

  // Add new state for pricing information section
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [pricingData, setPricingData] = useState({
    country: '',
    location: '',
    bank: '',
    beneficiary: '',
    product: '',
    tenor: '',
    paymentFrequency: 'Monthly',
    localCurrency: '',
    requestedPrice: 0
  });
  const [pricingResult, setPricingResult] = useState(null);
  const [checkingPrice, setCheckingPrice] = useState(false);

  // Add state for Request Information editing
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [requestData, setRequestData] = useState({
    sub_limit_type: '',
    form_of_eligible_instrument: '',
    adb_guarantee_trn: '',
    confirming_bank_reference_trn: '',
    issuing_bank_reference_trn: '',
    face_amount: 0,
    currency: '',
    usd_equivalent_amount: 0,
    usd_equivalent_amount_cover: 0,
    cover: 0
  });

  // Add this to the state declarations inside the TransactionDetail component
  const [checkingStatus, setCheckingStatus] = useState({
    sanctions: false,
    eligibility: false,
    limits: false,
    exposure: false
  });

  const [activeTab, setActiveTab] = useState('issuing'); // New state for tabs
  
  // Add state for Trading Section tab
  const [tradingTab, setTradingTab] = useState('goods'); // 'goods' or 'transactions'
  const [underlyingTransactions, setUnderlyingTransactions] = useState([]);
  const [loadingUnderlyingTransactions, setLoadingUnderlyingTransactions] = useState(false);
  
  // Local formatDate function to ensure consistent date formatting
  const formatDateLocal = (dateString, includeTime = false) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const options = includeTime 
        ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };
  
  // Add useEffect to handle transaction changes
  useEffect(() => {
    console.log("Transaction state changed:", transaction);
  }, [transaction]);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        
        // Get the API URL from environment variable or default to localhost:5000
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        try {
          // Fetch transaction from the API
          const response = await axios.get(`${apiUrl}/api/transactions/${id}`);
          const data = response.data;
          
          // Normalize the transaction data
          const normalizedData = normalizeTransaction(data);
          setTransaction(normalizedData);
          
          // Fetch additional transaction details (entities and goods)
          try {
            const transactionDetails = await DashboardService.fetchTransactionDetails(id);
            
            // Set real entities from API response if available
            if (transactionDetails.entities && transactionDetails.entities.length > 0) {
              setEntities(transactionDetails.entities);
            } else {
              // Fall back to entities from the transaction response
              setEntities(normalizedData.entities || []);
            }
            
            // Set real trade goods from API response if available
            if (transactionDetails.goods && transactionDetails.goods.length > 0) {
              setTradeGoods(transactionDetails.goods);
            } else {
              // Fall back to goods from the transaction response
              setTradeGoods(normalizedData.goods_list || []);
            }
            
            // Fetch underlying transactions
            try {
              setLoadingUnderlyingTransactions(true);
              const underlyingData = await DashboardService.fetchUnderlyingTransactions(id);
              if (underlyingData && underlyingData.underlying_transactions) {
                setUnderlyingTransactions(underlyingData.underlying_transactions);
              }
            } catch (underlyingError) {
              console.error('Error fetching underlying transactions:', underlyingError);
              // Fall back to empty array
              setUnderlyingTransactions([]);
            } finally {
              setLoadingUnderlyingTransactions(false);
            }
            
          } catch (detailsError) {
            console.error('Error fetching transaction details:', detailsError);
            // Fall back to entities from the transaction response
            setEntities(normalizedData.entities || []);
            // Fall back to goods from the transaction response
            setTradeGoods(normalizedData.goods_list || []);
          }
          
          // Initialize form data from transaction
          if (normalizedData) {
            setFormData({
              goodsList: normalizedData.goods_list,
              industry: normalizedData.industry || '',
              form_of_eligible_instrument: normalizedData.form_of_eligible_instrument || '',
              date_of_issue: normalizedData.date_of_issue || '',
              expiry_date: normalizedData.expiry_date || '',
              terms_of_payment: normalizedData.terms_of_payment || '',
              currency: normalizedData.currency || '',
              local_currency_amount: normalizedData.local_currency_amount || '',
              value_date_of_adb_guarantee: normalizedData.value_date_of_adb_guarantee || '',
              end_of_risk_period: normalizedData.end_of_risk_period || '',
              tenor: normalizedData.tenor || '',
              expiry_date_of_adb_guarantee: normalizedData.expiry_date_of_adb_guarantee || '',
              tenor_of_adb_guarantee: normalizedData.tenor_of_adb_guarantee || ''
            });
          }
          
          // Initialize pricing data from transaction
          if (normalizedData) {
            // Extract pricing-related data from the transaction
            setPricingData({
              country: normalizedData.country || normalizedData.client_country || '',
              location: normalizedData.location || normalizedData.client_location || '',
              bank: normalizedData.issuing_bank || normalizedData.bank || normalizedData.client_name || '',
              beneficiary: normalizedData.requesting_bank || normalizedData.beneficiary || '',
              product: normalizedData.form_of_eligible_instrument || normalizedData.product_name || '',
              tenor: normalizedData.tenor || '',
              paymentFrequency: normalizedData.payment_frequency || normalizedData.terms_of_payment || '',
            });
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          setError(apiError.message);
          
          // Fallback to mock data for development/testing
          console.log('Falling back to mock data');
          const mockData = MOCK_TRANSACTION_DATA.find(t => t.id.toString() === id.toString()) || MOCK_TRANSACTION_DATA[0];
          const normalizedMockData = normalizeTransaction(mockData);
          setTransaction(normalizedMockData);
          
          // Set entities from mock data
          setEntities(normalizedMockData.entities || []);
          
          // Set trade goods from mock data
          setTradeGoods(normalizedMockData.goods_list || []);
          
          // Initialize form data from mock data
          if (normalizedMockData) {
            setFormData({
              goodsList: normalizedMockData.goods_list,
              industry: normalizedMockData.industry || '',
              form_of_eligible_instrument: normalizedMockData.form_of_eligible_instrument || '',
              date_of_issue: normalizedMockData.date_of_issue || '',
              expiry_date: normalizedMockData.expiry_date || '',
              terms_of_payment: normalizedMockData.terms_of_payment || '',
              currency: normalizedMockData.currency || '',
              local_currency_amount: normalizedMockData.local_currency_amount || '',
              value_date_of_adb_guarantee: normalizedMockData.value_date_of_adb_guarantee || '',
              end_of_risk_period: normalizedMockData.end_of_risk_period || '',
              tenor: normalizedMockData.tenor || '',
              expiry_date_of_adb_guarantee: normalizedMockData.expiry_date_of_adb_guarantee || '',
              tenor_of_adb_guarantee: normalizedMockData.tenor_of_adb_guarantee || ''
            });
          }
        }
      } catch (err) {
        console.error('General Error:', err);
        setError(err.message);
      } finally {
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
    if (e) e.preventDefault();
    
    try {
      setProcessingAction(true);
      
      // In a real application, you would send this data to the backend
      // For now, we'll just update the local state
      console.log('Updating transaction entities:', entities);
      
      // In a real implementation, you would call an API endpoint
      // await axios.put(`${apiUrl}/api/transactions/${transaction.transaction_id}/entities`, { entities });
      
      // For now, update the transaction object to include updated entities
      setTransaction(prev => ({
        ...prev,
        entities: entities
      }));
      
      setIsEditingEntity(false);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error updating entities:', err);
      setProcessingAction(false);
    }
  };
  
  const handleSubmitTradingSection = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setProcessingAction(true);
      
      // In a real application, you would send this data to the backend
      // Using the tradeGoods array directly now
      console.log('Updating trading information:', tradeGoods);
      
      // Update transaction with all form data fields
      const updatedTransaction = {
        ...transaction,
        goods_list: tradeGoods,
        industry: formData.industry,
        form_of_eligible_instrument: formData.form_of_eligible_instrument,
        date_of_issue: formData.date_of_issue,
        expiry_date: formData.expiry_date,
        terms_of_payment: formData.terms_of_payment,
        currency: formData.currency,
        local_currency_amount: formData.local_currency_amount,
        value_date_of_adb_guarantee: formData.value_date_of_adb_guarantee,
        end_of_risk_period: formData.end_of_risk_period,
        tenor: formData.tenor,
        expiry_date_of_adb_guarantee: formData.expiry_date_of_adb_guarantee,
        tenor_of_adb_guarantee: formData.tenor_of_adb_guarantee
      };
      
      // In a real implementation, you would call an API endpoint
      // await axios.put(`${apiUrl}/api/transactions/${transaction.transaction_id}/goods`, { 
      //   goods: tradeGoods, 
      //   industry: formData.industry,
      //   form_of_eligible_instrument: formData.form_of_eligible_instrument,
      //   date_of_issue: formData.date_of_issue,
      //   expiry_date: formData.expiry_date,
      //   terms_of_payment: formData.terms_of_payment,
      //   currency: formData.currency,
      //   local_currency_amount: formData.local_currency_amount,
      //   value_date_of_adb_guarantee: formData.value_date_of_adb_guarantee,
      //   end_of_risk_period: formData.end_of_risk_period,
      //   tenor: formData.tenor,
      //   expiry_date_of_adb_guarantee: formData.expiry_date_of_adb_guarantee,
      //   tenor_of_adb_guarantee: formData.tenor_of_adb_guarantee
      // });
      
      setTransaction(updatedTransaction);
      setIsEditingTrading(false);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error updating trading information:', err);
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
      unit: '',
      goods_classification: '',
      price: ''
    });
    setShowTradeGoodModal(true);
  };

  const handleEditTradeGood = (good, index) => {
    setTradeGoodFormData({
      name: good.name,
      quantity: good.quantity || '',
      unit: good.unit || '',
      goods_classification: good.goods_classification || '',
      price: good.price || ''
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

  // Add a function to handle pricing input changes
  const handlePricingInputChange = (e) => {
    const { name, value } = e.target;
    setPricingData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a function to handle saving pricing data
  const handleSubmitPricingSection = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingAction(true);
      
      // Create updated transaction data
      const updatedTransaction = {
        ...transaction,
        country: pricingData.country,
        location: pricingData.location,
        bank: pricingData.bank,
        beneficiary: pricingData.beneficiary,
        product: pricingData.product,
        tenor: pricingData.tenor,
        paymentFrequency: pricingData.paymentFrequency,
        localCurrency: pricingData.localCurrency,
        requestedPrice: pricingData.requestedPrice
      };
      
      // Update the transaction
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.put(`${apiUrl}/api/transactions/${transaction.transaction_id}`, updatedTransaction);
      
      // Update the transaction state
      setTransaction(updatedTransaction);
      
      // Exit edit mode
      setIsEditingPricing(false);
      
      // Show success message
      alert('Pricing information updated successfully');
    } catch (error) {
      console.error('Error updating pricing information:', error);
      alert('Error updating pricing information. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Add a function to check pricing against matrix
  const handleCheckPricing = () => {
    setCheckingPrice(true);
    
    // In a real application, this would make an API call to the pricing service
    // For demo purposes, simulate a pricing check result after a delay
    setTimeout(() => {
      // If no requested price is set, show appropriate message
      if (!pricingData.requestedPrice) {
        setPricingResult({
          status: 'info',
          message: 'No pricing information available from transaction data',
          indicativePrice: '0.00',
          requestedPrice: '0.00',
          difference: 0,
          priceRange: { min: '0.00', max: '0.00' },
          appliedRules: []
        });
        setCheckingPrice(false);
        return;
      }
      
      // Simulate calling the pricing matrix API
      // These would normally come from the Pricing Matrix configuration
      const mockPricingMatrix = {
        // Define some country-based pricing
        countries: {
          'USA': { baseRate: 3.5, range: 0.25 },
          'UK': { baseRate: 3.75, range: 0.3 },
          'Germany': { baseRate: 3.6, range: 0.2 },
          'France': { baseRate: 3.65, range: 0.25 },
          'Japan': { baseRate: 3.45, range: 0.15 },
          'China': { baseRate: 4.0, range: 0.35 },
          'India': { baseRate: 4.2, range: 0.4 },
          'Brazil': { baseRate: 4.5, range: 0.5 },
          'Australia': { baseRate: 3.55, range: 0.25 },
          'Canada': { baseRate: 3.5, range: 0.2 },
          // Default for other countries
          'default': { baseRate: 4.0, range: 0.3 }
        },
        
        // Define product-based adjustments
        products: {
          'Invoice Financing': -0.1,
          'Warehouse Receipt Financing': 0.2,
          'Export Credit Insurance': 0.15,
          'Import Loan': 0.25,
          'Supply Chain Finance': -0.15,
          'Letter of Credit': 0,
          'Bank Guarantee': 0.1,
          'default': 0
        },
        
        // Define tenor-based adjustments
        tenors: {
          '30 days': -0.15,
          '60 days': -0.05,
          '90 days': 0,
          '180 days': 0.15,
          '270 days': 0.3,
          '365 days': 0.45,
          'default': 0
        },
        
        // Business rules
        businessRules: [
          {
            // Example rule for high-value deals
            condition: { field: 'amount', operator: '>', value: 1000000 },
            adjustment: -0.2,
            name: 'Large Transaction Discount'
          },
          {
            // Example rule for specific beneficiary
            condition: { field: 'beneficiary', operator: '==', value: 'Premium Client' },
            adjustment: -0.15,
            name: 'Premium Client Discount'
          }
        ]
      };
      
      // Extract the country data or use default
      const countryData = pricingData.country && mockPricingMatrix.countries[pricingData.country] 
                          ? mockPricingMatrix.countries[pricingData.country] 
                          : mockPricingMatrix.countries['default'];
      
      // Get base rate from matrix
      let matrixRate = countryData.baseRate;
      
      // Apply product adjustment if it exists
      const productAdjustment = pricingData.product && mockPricingMatrix.products[pricingData.product] 
                                ? mockPricingMatrix.products[pricingData.product] 
                                : mockPricingMatrix.products['default'];
      matrixRate += productAdjustment;
      
      // Apply tenor adjustment if it exists
      const tenorAdjustment = pricingData.tenor && mockPricingMatrix.tenors[pricingData.tenor] 
                              ? mockPricingMatrix.tenors[pricingData.tenor] 
                              : mockPricingMatrix.tenors['default'];
      matrixRate += tenorAdjustment;
      
      // Apply any business rules
      const appliedRules = [];
      
      mockPricingMatrix.businessRules.forEach(rule => {
        let shouldApply = false;
        
        // Simplified rule evaluation logic
        if (rule.condition.field === 'amount' && 
            rule.condition.operator === '>' && 
            transaction.amount > rule.condition.value) {
          shouldApply = true;
        }
        
        if (rule.condition.field === 'beneficiary' && 
            rule.condition.operator === '==' && 
            pricingData.beneficiary === rule.condition.value) {
          shouldApply = true;
        }
        
        if (shouldApply) {
          matrixRate += rule.adjustment;
          appliedRules.push({
            name: rule.name,
            adjustment: rule.adjustment
          });
        }
      });
      
      // Calculate acceptable range
      const priceRange = {
        min: (matrixRate - countryData.range).toFixed(2),
        max: (matrixRate + countryData.range).toFixed(2)
      };
      
      // Calculate the difference between requested and matrix price
      const requestedPrice = parseFloat(pricingData.requestedPrice) || 0;
      const priceDiff = requestedPrice - matrixRate;
      
      // Create result based on comparison
      if (requestedPrice >= parseFloat(priceRange.min) && 
          requestedPrice <= parseFloat(priceRange.max)) {
        // Within range - success
        setPricingResult({
          status: 'success',
          message: 'Requested price matches the indicative price range',
          indicativePrice: matrixRate.toFixed(2),
          requestedPrice: requestedPrice.toFixed(2),
          difference: 0,
          priceRange,
          appliedRules
        });
      } else if (priceDiff > 0) {
        // Above range - warning
        setPricingResult({
          status: 'warning',
          message: 'Requested price exceeds the indicative price range',
          indicativePrice: matrixRate.toFixed(2),
          requestedPrice: requestedPrice.toFixed(2),
          difference: priceDiff.toFixed(2),
          priceRange,
          appliedRules
        });
      } else {
        // Below range - info
        setPricingResult({
          status: 'info',
          message: 'Requested price is below the indicative price range',
          indicativePrice: matrixRate.toFixed(2),
          requestedPrice: requestedPrice.toFixed(2),
          difference: priceDiff.toFixed(2),
          priceRange,
          appliedRules
        });
      }
      
      setCheckingPrice(false);
    }, 1000);
  };

  // Add this function before the return statement
  const handleRunSanctionsCheck = async () => {
    try {
      setCheckingStatus(prev => ({ ...prev, sanctions: true }));
      
      // In a real implementation, this would make an API call
      // Simulate API call with a timeout
      setTimeout(async () => {
        try {
          // Make sure we have entities to check, if not, create a placeholder
          const entitiesToCheck = entities && entities.length > 0 ? entities : [
            { name: 'Unknown Entity', type: 'Unknown Type' }
          ];
          
          // Simulate an API response
          const mockResponse = {
            passed: Math.random() > 0.3, // Random result, 70% chance of passing
            details: entitiesToCheck.map((entity, index) => ({
              entity_name: entity.name || 'Unknown Entity',
              entity_type: entity.type || 'Unknown Type',
              status: Math.random() > 0.3 ? 'CLEAR' : 'MATCH',
              matches: Math.random() > 0.3 ? [] : [
                {
                  list_name: 'OFAC SDN',
                  match_score: Math.floor(Math.random() * 30) + 70,
                  match_name: entity.name || 'Unknown Entity'
                }
              ],
              pep_status: Math.random() > 0.8 ? 'PEP' : 'NON-PEP',
              adverse_media: Math.random() > 0.7 ? [
                {
                  source: 'Reuters',
                  date: '2022-05-15',
                  title: 'Company linked to fraud investigation',
                  summary: 'The entity was mentioned in connection with an ongoing fraud investigation in Eastern Europe.'
                }
              ] : [],
              risk_score: Math.floor(Math.random() * 100),
              check_timestamp: new Date().toISOString()
            })),
            check_timestamp: new Date().toISOString()
          };
          
          // Update the transaction with the sanctions check result
          setTransaction(prev => ({
            ...prev,
            sanctions_check_passed: mockResponse.passed,
            sanctions_check_details: mockResponse.details,
            sanctions_check_timestamp: mockResponse.check_timestamp
          }));
          
          setCheckingStatus(prev => ({ ...prev, sanctions: false }));
        } catch (error) {
          console.error('Error processing sanctions check:', error);
          setCheckingStatus(prev => ({ ...prev, sanctions: false }));
        }
      }, 2000); // Simulate a 2-second API call
    } catch (error) {
      console.error('Error initiating sanctions check:', error);
      setCheckingStatus(prev => ({ ...prev, sanctions: false }));
    }
  };

  // Function to get entity data based on type
  const getEntityData = (type) => {
    console.log("Getting entity data for type:", type);
    console.log("Current transaction state:", transaction);
    
    let result;
    
    // Safely access fields with nullish coalescing operator
    try {
      switch(type) {
        case 'issuing':
          result = {
            name: transaction?.issuing_bank ?? 'Not specified',
            country: transaction?.issuing_bank_country ?? transaction?.country ?? 'Not specified',
            address: transaction?.issuing_bank_entity_address ?? transaction?.entity_address ?? 'Not specified',
            swift: transaction?.issuing_bank_swift ?? transaction?.swift ?? 'Not specified',
            signing_office_branch: transaction?.issuing_bank_signing_office_branch ?? transaction?.signing_office_branch ?? 'Not specified',
            agreement_date: transaction?.issuing_bank_agreement_date ? formatDateLocal(transaction.issuing_bank_agreement_date) : 'Not specified'
          };
          break;
        case 'confirming':
          result = {
            name: transaction?.confirming_bank ?? 'Not specified',
            country: transaction?.confirming_bank_country ?? transaction?.country ?? 'Not specified',
            address: transaction?.confirming_bank_entity_address ?? transaction?.entity_address ?? 'Not specified',
            swift: transaction?.confirming_bank_swift ?? transaction?.swift ?? 'Not specified',
            signing_office_branch: transaction?.confirming_bank_signing_office_branch ?? transaction?.signing_office_branch ?? 'Not specified',
            agreement_date: transaction?.confirming_bank_agreement_date ? formatDateLocal(transaction.confirming_bank_agreement_date) : 'Not specified'
          };
          break;
        case 'requesting':
          result = {
            name: transaction?.requesting_bank ?? 'Not specified',
            country: transaction?.requesting_bank_country ?? transaction?.country ?? 'Not specified',
            address: transaction?.requesting_bank_entity_address ?? transaction?.entity_address ?? 'Not specified',
            swift: transaction?.requesting_bank_swift ?? transaction?.swift ?? 'Not specified',
            signing_office_branch: transaction?.requesting_bank_signing_office_branch ?? transaction?.signing_office_branch ?? 'Not specified',
            agreement_date: transaction?.requesting_bank_agreement_date ? formatDateLocal(transaction.requesting_bank_agreement_date) : 'Not specified'
          };
          break;
        default:
          result = {
            name: 'Not specified',
            country: 'Not specified',
            address: 'Not specified',
            swift: 'Not specified',
            signing_office_branch: 'Not specified',
            agreement_date: 'Not specified'
          };
      }
    } catch (error) {
      console.error(`Error getting entity data for type ${type}:`, error);
      // Provide default values in case of error
      result = {
        name: 'Error retrieving data',
        country: 'Not available',
        address: 'Not available',
        swift: 'Not available',
        signing_office_branch: 'Not available',
        agreement_date: 'Not available'
      };
    }
    
    console.log("Returning entity data:", result);
    return result;
  };

  // Handle opening the entity search modal based on active tab
  const openEntitySearchModal = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setShowEntitySearchModal(true);
  };

  // Handle search query input change
  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    
    // Auto-search after a short delay when typing
    if (e.target.value.trim().length >= 2) {
      // Clear any existing timeout
      if (window.searchTimeout) {
        clearTimeout(window.searchTimeout);
      }
      
      // Set a new timeout to search after typing stops
      window.searchTimeout = setTimeout(() => {
        searchEntities();
      }, 300); // 300ms delay
    }
  };

  // Search entities based on user input
  const searchEntities = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchLoading(true);
      setSearchError(null);
      
      // Get the API URL from environment variable or default to localhost:5000
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Fetch entities from the API
      const response = await axios.get(`${apiUrl}/api/entities`);
      console.log("All entities from API:", response.data.length);
      
      // Improved search: Case-insensitive search across multiple fields
      const searchLower = searchQuery.toLowerCase();
      const filteredResults = response.data.filter(entity => {
        // Check if any of these fields match the search query
        return (
          // Use optional chaining and ensure strings for comparison
          String(entity.entity_name || '').toLowerCase().includes(searchLower) ||
          String(entity.country || '').toLowerCase().includes(searchLower) ||
          String(entity.swift || '').toLowerCase().includes(searchLower)
        );
      });
      
      console.log(`Found ${filteredResults.length} entities matching "${searchQuery}"`);
      
      // Add unique keys if missing
      const resultsWithKeys = filteredResults.map((entity, index) => {
        if (!entity.entity_id) {
          return { ...entity, entity_id: `temp-id-${index}` };
        }
        return entity;
      });
      
      setSearchResults(resultsWithKeys);
      
      if (filteredResults.length === 0) {
        setSearchError(`No entities found matching "${searchQuery}"`);
      }
    } catch (error) {
      console.error("Error searching entities:", error);
      setSearchError(`Failed to search entities: ${error.message || 'Unknown error'}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle entity selection from search results
  const handleEntitySelect = (entity) => {
    if (!entity) {
      console.error("No entity selected");
      return;
    }
    
    console.log("Entity selected:", entity);
    console.log("Entity name length:", entity.entity_name?.length || 0);
    console.log("Current tab:", activeTab);
    
    try {
      // Create a copy of the transaction object
      const updatedTransaction = { ...transaction };
      
      // Ensure all entity fields exist, even if empty - prevent undefined errors
      const safeEntity = {
        entity_name: entity.entity_name || '',
        country: entity.country || '',
        entity_address: entity.entity_address || '',
        swift: entity.swift || '',
        signing_office_branch: entity.signing_office_branch || '',
        agreement_date: entity.agreement_date || null
      };
      
      // Update the appropriate fields based on the active tab
      if (activeTab === 'issuing') {
        updatedTransaction.issuing_bank = safeEntity.entity_name;
        updatedTransaction.issuing_bank_country = safeEntity.country;
        updatedTransaction.issuing_bank_entity_address = safeEntity.entity_address;
        updatedTransaction.issuing_bank_swift = safeEntity.swift;
        updatedTransaction.issuing_bank_signing_office_branch = safeEntity.signing_office_branch;
        updatedTransaction.issuing_bank_agreement_date = safeEntity.agreement_date;
      } else if (activeTab === 'confirming') {
        updatedTransaction.confirming_bank = safeEntity.entity_name;
        updatedTransaction.confirming_bank_country = safeEntity.country;
        updatedTransaction.confirming_bank_entity_address = safeEntity.entity_address;
        updatedTransaction.confirming_bank_swift = safeEntity.swift;
        updatedTransaction.confirming_bank_signing_office_branch = safeEntity.signing_office_branch;
        updatedTransaction.confirming_bank_agreement_date = safeEntity.agreement_date;
      } else if (activeTab === 'requesting') {
        updatedTransaction.requesting_bank = safeEntity.entity_name;
        updatedTransaction.requesting_bank_country = safeEntity.country;
        updatedTransaction.requesting_bank_entity_address = safeEntity.entity_address;
        updatedTransaction.requesting_bank_swift = safeEntity.swift;
        updatedTransaction.requesting_bank_signing_office_branch = safeEntity.signing_office_branch;
        updatedTransaction.requesting_bank_agreement_date = safeEntity.agreement_date;
      } else {
        console.error("Invalid active tab:", activeTab);
        return;
      }
      
      console.log("About to update transaction state");
      
      // Update the transaction state with a reliable functional update pattern
      setTransaction(prevTransaction => {
        console.log("Previous transaction state:", prevTransaction);
        const newState = { ...prevTransaction, ...updatedTransaction };
        console.log("New transaction state:", newState);
        return newState;
      });
      
      // Close the search modal first to prevent any UI conflicts
      setShowEntitySearchModal(false);
      
      // Wait a moment before forcing re-render to ensure state has updated
      setTimeout(() => {
        // Force a re-render of the tab content by toggling the activeTab
        const currentTab = activeTab;
        console.log("About to reset tab, currently:", currentTab);
        
        // First clear the tab to force re-render
        setActiveTab('');
        
        // Then set it back after a short delay
        setTimeout(() => {
          setActiveTab(currentTab);
          console.log("Reset tab to:", currentTab);
        }, 100);
      }, 100);
    } catch (error) {
      console.error("Error updating entity data:", error);
      alert("There was an error selecting this entity. Please try again.");
    }
  };

  // Add a function to navigate to the next step
  const navigateToNextStep = () => {
    navigate(`/transactions/${id}/sanction-check`);
  };

  // Add handler for Request Information input changes
  const handleRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Add handler for Request Information submission
  const handleSubmitRequestSection = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingAction(true);
      
      // Create updated transaction data
      const updatedTransaction = {
        ...transaction,
        sub_limit_type: requestData.sub_limit_type,
        form_of_eligible_instrument: requestData.form_of_eligible_instrument,
        adb_guarantee_trn: requestData.adb_guarantee_trn,
        confirming_bank_reference_trn: requestData.confirming_bank_reference_trn,
        issuing_bank_reference_trn: requestData.issuing_bank_reference_trn,
        face_amount: parseFloat(requestData.face_amount) || 0,
        currency: requestData.currency,
        usd_equivalent_amount: parseFloat(requestData.usd_equivalent_amount) || 0,
        usd_equivalent_amount_cover: parseFloat(requestData.usd_equivalent_amount_cover) || 0,
        cover: parseFloat(requestData.cover) / 100 || 0 // Convert from percentage to decimal
      };
      
      // Update the transaction
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.put(`${apiUrl}/api/transactions/${transaction.transaction_id}`, updatedTransaction);
      
      // Update the transaction state
      setTransaction(updatedTransaction);
      
      // Exit edit mode
      setIsEditingRequest(false);
      
      // Show success message
      alert('Request information updated successfully');
    } catch (error) {
      console.error('Error updating request information:', error);
      alert('Error updating request information. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Update the useEffect to initialize both pricingData and requestData when transaction changes
  useEffect(() => {
    if (transaction) {
      // Initialize pricing data
      setPricingData({
        country: transaction.country || '',
        location: transaction.location || '',
        bank: transaction.issuing_bank || transaction.bank || transaction.client_name || '',
        beneficiary: transaction.requesting_bank || transaction.beneficiary || '',
        product: transaction.form_of_eligible_instrument || transaction.product_name || '',
        tenor: transaction.tenor || '',
        paymentFrequency: transaction.payment_frequency || 'Monthly',
        localCurrency: transaction.currency || '',
        requestedPrice: transaction.guarantee_fee_rate || 0
      });
      
      // Initialize request data
      setRequestData({
        sub_limit_type: transaction.sub_limit_type || '',
        form_of_eligible_instrument: transaction.form_of_eligible_instrument || '',
        adb_guarantee_trn: transaction.adb_guarantee_trn || '',
        confirming_bank_reference_trn: transaction.confirming_bank_reference_trn || '',
        issuing_bank_reference_trn: transaction.issuing_bank_reference_trn || '',
        face_amount: transaction.face_amount || 0,
        currency: transaction.currency || '',
        usd_equivalent_amount: transaction.usd_equivalent_amount || 0,
        usd_equivalent_amount_cover: transaction.usd_equivalent_amount_cover || 0,
        cover: transaction.cover ? transaction.cover * 100 : 0 // Convert from decimal to percentage
      });
    }
  }, [transaction]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/transactions" className="flex items-center mr-4 text-gray-600 hover:text-gray-800">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>Back to Transactions</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Transaction Details</h1>
          {transaction && (
            <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(transaction.status)}`}>
              {transaction.status}
            </span>
          )}
        </div>
        
        {transaction && (
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close Transaction
            </button>
            <button
              onClick={handleProcess}
              className="px-4 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary-dark"
              disabled={processingAction}
            >
              {processingAction ? 'Processing...' : 'Process Transaction'}
            </button>
          </div>
        )}
      </div>
      
      {/* Add Transaction Step Indicator */}
      {transaction && (
        <TransactionStepIndicator transactionId={id} currentStep="email-extract" />
      )}
      
      {/* Error and loading states */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading transaction</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : transaction ? (
        <>
          {/* ADB Client Profile Section */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center px-6 py-4">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-800">ADB Client Profile</h2>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('issuing')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'issuing'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Issuing Bank
              </button>
              <button
                onClick={() => setActiveTab('confirming')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'confirming'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Confirming Bank
              </button>
              <button
                onClick={() => setActiveTab('requesting')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  activeTab === 'requesting'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Requesting Bank
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="px-6 py-4">
              {activeTab && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" key={`${activeTab}-${transaction?.transaction_id || ''}-${Date.now()}`}>
                  <div className="flex items-start">
                    <UserIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Institution Name</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-base font-medium">{getEntityData(activeTab).name}</p>
                        <button 
                          onClick={openEntitySearchModal}
                          type="button"
                          className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <GlobeAmericasIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Country</h3>
                      <p className="text-base">{getEntityData(activeTab).country}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                      <p className="text-base">{getEntityData(activeTab).address}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <IdentificationIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Swift Code</h3>
                      <p className="text-base">{getEntityData(activeTab).swift}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <InformationCircleIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Signing Office Branch</h3>
                      <p className="text-base">{getEntityData(activeTab).signing_office_branch}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Agreement Date</h3>
                      <p className="text-base">{getEntityData(activeTab).agreement_date}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Request Information Section */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-800">Request Information</h2>
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
              <div className="flex justify-between items-center mb-4">
                <div>
                  {!isEditingRequest ? (
                    <button
                      onClick={() => setIsEditingRequest(true)}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <PencilSquareIcon className="h-4 w-4 mr-1" />
                      Edit Details
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSubmitRequestSection}
                        className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingRequest(false)}
                        className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <TagIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Product</h3>
                    {isEditingRequest ? (
                      <input
                        type="text"
                        name="sub_limit_type"
                        value={requestData.sub_limit_type}
                        onChange={handleRequestInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.sub_limit_type || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                               
                <div className="flex items-start">
                  <IdentificationIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">ADB Guarantee/ TRN</h3>
                    {isEditingRequest ? (
                      <input
                        type="text"
                        name="adb_guarantee_trn"
                        value={requestData.adb_guarantee_trn}
                        onChange={handleRequestInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.adb_guarantee_trn || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <IdentificationIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Confirming Bank Reference / TRN</h3>
                    {isEditingRequest ? (
                      <input
                        type="text"
                        name="confirming_bank_reference_trn"
                        value={requestData.confirming_bank_reference_trn}
                        onChange={handleRequestInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.confirming_bank_reference_trn || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <IdentificationIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Issuing Bank Reference / TRN</h3>
                    {isEditingRequest ? (
                      <input
                        type="text"
                        name="issuing_bank_reference_trn"
                        value={requestData.issuing_bank_reference_trn}
                        onChange={handleRequestInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.issuing_bank_reference_trn || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Local Amount</h3>
                    {isEditingRequest ? (
                      <input
                        type="number"
                        name="face_amount"
                        value={requestData.face_amount}
                        onChange={handleRequestInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <p className="text-base">
                        {formatCurrency(transaction.face_amount || 0, transaction.currency)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Currency</h3>
                    {isEditingRequest ? (
                      <input
                        type="text"
                        name="currency"
                        value={requestData.currency}
                        onChange={handleRequestInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        placeholder="e.g. USD"
                      />
                    ) : (
                      <p className="text-base">
                        {`${transaction.currency}`}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">USD Amount</h3>
                    {isEditingRequest ? (
                      <input
                        type="number"
                        name="usd_equivalent_amount"
                        value={requestData.usd_equivalent_amount}
                        onChange={handleRequestInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <p className="text-base">
                        {formatCurrency(transaction.usd_equivalent_amount || 0, 'USD')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">ADB Covered Amount (USD)</h3>
                    {isEditingRequest ? (
                      <input
                        type="number"
                        name="usd_equivalent_amount_cover"
                        value={requestData.usd_equivalent_amount_cover}
                        onChange={handleRequestInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <p className="text-base">
                        {formatCurrency(transaction.usd_equivalent_amount_cover || 0, 'USD')}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Risk Coverage</h3>
                    {isEditingRequest ? (
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="cover"
                          value={requestData.cover}
                          onChange={handleRequestInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          step="0.01"
                          min="0"
                          max="100"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    ) : (
                      <p className="text-base">
                        {transaction.cover ? `${transaction.cover * 100}%` : 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

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
          
          {/* Underlying Transactions Information Section - Moved above Pricing Information */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center px-6 py-4">
                <TruckIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-800">Underlying Transactions</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-4">
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
              
              {/* Transaction Information Section - Updated to match Pricing Information section styling */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Column 1 */}
                <div className="flex items-start">
                  <DocumentTextIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Form of Eligible Instrument</h3>
                    {isEditingTrading ? (
                      <input
                        type="text"
                        name="form_of_eligible_instrument"
                        value={formData.form_of_eligible_instrument || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">
                        {transaction.form_of_eligible_instrument ? 
                          transaction.form_of_eligible_instrument
                            .replace(/\s*(?:REF|Ref|ref).*$/g, '')           // Remove everything from "REF" (and variations) to the end
                            .replace(/\b(?:\w+-\d+|\d+)\b/g, '')           // Remove remaining word-number or just number patterns
                            .replace(/^\s*-\s*|\s*-\s*$/g, '')             // Remove dashes at start or end
                            .replace(/\s{2,}/g, ' ')                       // Replace multiple spaces with a single space
                            .trim() : 
                          'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Issue</h3>
                    {isEditingTrading ? (
                      <input
                        type="date"
                        name="date_of_issue"
                        value={formData.date_of_issue ? new Date(formData.date_of_issue).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.date_of_issue ? formatDateLocal(transaction.date_of_issue) : 'Not specified'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Expiry Date</h3>
                    {isEditingTrading ? (
                      <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.expiry_date ? formatDateLocal(transaction.expiry_date) : 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                {/* Column 2 */}
                <div className="flex items-start">
                  <DocumentTextIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Terms of Payment</h3>
                    {isEditingTrading ? (
                      <input
                        type="text"
                        name="terms_of_payment"
                        value={formData.terms_of_payment || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.terms_of_payment || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Currency & Amount</h3>
                    {isEditingTrading ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          name="currency"
                          value={formData.currency || ''}
                          onChange={handleInputChange}
                          placeholder="Currency"
                          className="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        />
                        <input
                          type="text"
                          name="local_currency_amount"
                          value={formData.local_currency_amount || ''}
                          onChange={handleInputChange}
                          placeholder="Amount"
                          className="w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        />
                      </div>
                    ) : (
                      <p className="text-base">
                        {transaction.currency ? `${transaction.currency} ${transaction.local_currency_amount || ''}` : 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Value Date of ADB Guarantee</h3>
                    {isEditingTrading ? (
                      <input
                        type="date"
                        name="value_date_of_adb_guarantee"
                        value={formData.value_date_of_adb_guarantee ? new Date(formData.value_date_of_adb_guarantee).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.value_date_of_adb_guarantee ? formatDateLocal(transaction.value_date_of_adb_guarantee) : 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                {/* Column 3 */}
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">End of Risk Period</h3>
                    {isEditingTrading ? (
                      <input
                        type="date"
                        name="end_of_risk_period"
                        value={formData.end_of_risk_period ? new Date(formData.end_of_risk_period).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.end_of_risk_period ? formatDateLocal(transaction.end_of_risk_period) : 'Not specified'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tenor</h3>
                    {isEditingTrading ? (
                      <input
                        type="text"
                        name="tenor"
                        value={formData.tenor || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.tenor || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Expiry Date of ADB Guarantee</h3>
                    {isEditingTrading ? (
                      <input
                        type="date"
                        name="expiry_date_of_adb_guarantee"
                        value={formData.expiry_date_of_adb_guarantee ? new Date(formData.expiry_date_of_adb_guarantee).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.expiry_date_of_adb_guarantee ? formatDateLocal(transaction.expiry_date_of_adb_guarantee) : 'Not specified'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tenor of ADB Guarantee</h3>
                    {isEditingTrading ? (
                      <input
                        type="text"
                        name="tenor_of_adb_guarantee"
                        value={formData.tenor_of_adb_guarantee || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.tenor_of_adb_guarantee || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setTradingTab('goods')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    tradingTab === 'goods'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  List of Goods
                </button>
                <button
                  onClick={() => setTradingTab('transactions')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    tradingTab === 'transactions'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Transaction Details
                </button>
              </div>
              
              {/* List of Goods Tab Content */}
              {tradingTab === 'goods' && (
                <div>                  
                  {tradeGoods.length > 0 ? (
                    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            {isEditingTrading && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tradeGoods.map((good, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{good.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{good.goods_classification || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{good.quantity || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{good.unit || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{good.price ? `${good.price}` : 'N/A'}</td>
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
                      <p className="text-gray-500 italic">No goods information available</p>
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
              )}
              
              {/* Transaction Details Tab Content */}
              {tradingTab === 'transactions' && (
                <div>                 
                  {loadingUnderlyingTransactions ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : underlyingTransactions.length > 0 ? (
                    <div className="space-y-6">
                      {underlyingTransactions.map((ut, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <h3 className="text-base font-medium text-gray-800">Transaction #{ut.sequence_no} - {ut.transaction_ref_no}</h3>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Reference Information</h4>
                                <div className="space-y-2">
                                  <p className="text-sm"><span className="font-medium">Issuing Bank:</span> {ut.issuing_bank || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Reference Number:</span> {ut.transaction_ref_no || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Issue Date:</span> {ut.issue_date ? formatDateLocal(ut.issue_date) : 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Maturity Date:</span> {ut.maturity_date ? formatDateLocal(ut.maturity_date) : 'N/A'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Financial Details</h4>
                                <div className="space-y-2">
                                  <p className="text-sm"><span className="font-medium">Currency:</span> {ut.currency || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Amount in Local Currency:</span> {ut.amount_in_local_currency || 'N/A'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Applicant Information</h4>
                                <div className="space-y-2">
                                  <p className="text-sm"><span className="font-medium">Name:</span> {ut.applicant_name || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Address:</span> {ut.applicant_address || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Country:</span> {ut.applicant_country || 'N/A'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Beneficiary Information</h4>
                                <div className="space-y-2">
                                  <p className="text-sm"><span className="font-medium">Name:</span> {ut.beneficiary_name || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Address:</span> {ut.beneficiary_address || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Country:</span> {ut.beneficiary_country || 'N/A'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Details</h4>
                                <div className="space-y-2">
                                  <p className="text-sm"><span className="font-medium">Loading Port:</span> {ut.loading_port || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Discharging Port:</span> {ut.discharging_port || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Country of Origin:</span> {ut.country_of_origin || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Country of Final Destination:</span> {ut.country_of_final_destination || 'N/A'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Goods Information</h4>
                                <div className="space-y-2">
                                  <p className="text-sm"><span className="font-medium">Goods Description:</span> {ut.goods || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Classification:</span> {ut.goods_classification || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">Eligibility:</span> {ut.goods_eligible || 'N/A'}</p>
                                  <p className="text-sm"><span className="font-medium">ES Classification:</span> {ut.es_classification || 'N/A'}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Compliance Flags</h4>
                                <div className="space-y-2">
                                  <p className="text-sm">
                                    <span className="font-medium">Capital Goods:</span> 
                                    {ut.capital_goods ? (
                                      <span className="text-green-600 ml-1">Yes</span>
                                    ) : (
                                      <span className="text-red-600 ml-1">No</span>
                                    )}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Equipment Replacement:</span> 
                                    {ut.ee_replacement_of_an_old_equipment ? (
                                      <span className="text-green-600 ml-1">Yes</span>
                                    ) : (
                                      <span className="text-red-600 ml-1">No</span>
                                    )}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Sustainable Goods:</span> 
                                    {ut.sustainable_goods ? (
                                      <span className="text-green-600 ml-1">Yes</span>
                                    ) : (
                                      <span className="text-red-600 ml-1">No</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-500 italic">No underlying transaction information available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Pricing Information Section */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center px-6 py-4">
                <CalculatorIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-800">Pricing Information</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  {!isEditingPricing ? (
                    <button
                      onClick={() => setIsEditingPricing(true)}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <PencilSquareIcon className="h-4 w-4 mr-1" />
                      Edit Pricing
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSubmitPricingSection}
                        className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingPricing(false)}
                        className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start">
                  <GlobeAmericasIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Country</h3>
                    {isEditingPricing ? (
                      <input
                        type="text"
                        name="country"
                        value={pricingData.country}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{pricingData.country || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    {isEditingPricing ? (
                      <input
                        type="text"
                        name="location"
                        value={pricingData.location}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        placeholder="Enter 'ALL' for all locations"
                      />
                    ) : (
                      <p className="text-base">{pricingData.location || 'ALL'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BuildingLibraryIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Bank</h3>
                    {isEditingPricing ? (
                      <input
                        type="text"
                        name="bank"
                        value={pricingData.bank}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{pricingData.bank || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Beneficiary</h3>
                    {isEditingPricing ? (
                      <input
                        type="text"
                        name="beneficiary"
                        value={pricingData.beneficiary}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        placeholder="Enter 'ALL' for all beneficiaries"
                      />
                    ) : (
                      <p className="text-base">{pricingData.beneficiary || 'ALL'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <DocumentTextIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Product</h3>
                    {isEditingPricing ? (
                      <input
                        type="text"
                        name="product"
                        value={pricingData.product}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{pricingData.product || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tenor</h3>
                    {isEditingPricing ? (
                      <select
                        name="tenor"
                        value={pricingData.tenor}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        <option value="">Select Tenor</option>
                        <option value="30 days">30 days</option>
                        <option value="60 days">60 days</option>
                        <option value="90 days">90 days</option>
                        <option value="180 days">180 days</option>
                        <option value="270 days">270 days</option>
                        <option value="365 days">365 days</option>
                      </select>
                    ) : (
                      <p className="text-base">{pricingData.tenor || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Requested Price (%)</h3>
                    {isEditingPricing ? (
                      <input
                        type="number"
                        name="requestedPrice"
                        value={pricingData.requestedPrice}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <p className="text-base">{pricingData.requestedPrice ? `${pricingData.requestedPrice}%` : 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Frequency</h3>
                    {isEditingPricing ? (
                      <select
                        name="paymentFrequency"
                        value={pricingData.paymentFrequency}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        <option value="">Select Frequency</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                        <option value="At Maturity">At Maturity</option>
                      </select>
                    ) : (
                      <p className="text-base">{pricingData.paymentFrequency || 'Not specified'}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BuildingLibraryIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Local Currency</h3>
                    {isEditingPricing ? (
                      <input
                        type="text"
                        name="localCurrency"
                        value={pricingData.localCurrency}
                        onChange={handlePricingInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        placeholder="e.g. USD"
                      />
                    ) : (
                      <p className="text-base">{pricingData.localCurrency || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleCheckPricing}
                  disabled={checkingPrice}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 mr-2"
                >
                  {checkingPrice ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    <>
                      <CalculatorIcon className="h-4 w-4 mr-2" />
                      Check Pricing
                    </>
                  )}
                </button>
              </div>
              
              {/* Pricing Result */}
              {pricingResult && (
                <div className={`p-4 rounded-lg mb-4 animate-fadeIn ${
                  pricingResult.status === 'success' ? 'bg-green-50 border border-green-200' : 
                  pricingResult.status === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-start">
                    {pricingResult.status === 'success' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    ) : pricingResult.status === 'warning' ? (
                      <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    ) : (
                      <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    )}
                    <div className="w-full">
                      <h3 className={`text-base font-medium ${
                        pricingResult.status === 'success' ? 'text-green-800' : 
                        pricingResult.status === 'warning' ? 'text-yellow-800' : 
                        'text-blue-800'
                      }`}>
                        {pricingResult.message}
                      </h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-600">Indicative Price Range:</p>
                          <p className="text-base font-medium">{pricingResult.priceRange.min}% - {pricingResult.priceRange.max}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Requested Price:</p>
                          <p className="text-base font-medium">{pricingResult.requestedPrice}%</p>
                        </div>
                        {pricingResult.status !== 'success' && (
                          <div>
                            <p className="text-sm text-gray-600">Price Difference:</p>
                            <p className={`text-base font-medium ${
                              pricingResult.status === 'warning' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {pricingResult.difference > 0 ? '+' : ''}{pricingResult.difference}%
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Display applied business rules if any */}
                      {pricingResult.appliedRules && pricingResult.appliedRules.length > 0 && (
                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Applied Business Rules:</p>
                          <ul className="space-y-1">
                            {pricingResult.appliedRules.map((rule, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                                <span>{rule.name}</span>
                                <span className="ml-1 text-gray-500">
                                  ({rule.adjustment > 0 ? '+' : ''}{rule.adjustment}%)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Trade Entity Information Section */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center px-6 py-4">
                <BuildingLibraryIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-800">Trade Entity Information</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-4">
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
          </div>
          
          {/* Service Checks Result Section */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center px-6 py-4">
                <ShieldCheckIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-800">Service Check Results</h2>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleRunSanctionsCheck}
                  disabled={checkingStatus.sanctions}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 mr-2"
                >
                  {checkingStatus.sanctions ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running Checks...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Run Service Checks
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Sanctions Check</h3>
                      {transaction.sanctions_check_timestamp && transaction.sanctions_check_details && transaction.sanctions_check_details.length > 0 && (
                        <Link 
                          to={`/sanctions-check/${id}`} 
                          className="text-primary hover:text-primary-dark text-xs flex items-center"
                        >
                          <span>View Details</span>
                          <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                        </Link>
                      )}
                    </div>
                    {checkingStatus.sanctions ? (
                      <div className="flex items-center justify-center py-2">
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : transaction.sanctions_check_passed === null ? (
                      <p className="text-base text-gray-500 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1 text-gray-400" />
                        Not processed
                      </p>
                    ) : (
                      <>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${transaction.sanctions_check_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {transaction.sanctions_check_passed ? 
                            <><CheckCircleIcon className="h-4 w-4 mr-1" />Passed</> : 
                            <><XCircleIcon className="h-4 w-4 mr-1" />Failed</>}
                        </span>
                        {transaction.sanctions_check_timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last checked: {new Date(transaction.sanctions_check_timestamp).toLocaleString()}
                          </p>
                        )}
                      </>
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
          
          {/* Add a button at the bottom to navigate to the next step */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={navigateToNextStep}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200"
            >
              Continue to Sanction Check
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500">Transaction not found</p>
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                  <select
                    name="goods_classification"
                    value={tradeGoodFormData.goods_classification}
                    onChange={handleTradeGoodInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                  >
                    <option value="">Select Classification</option>
                    <option value="Capital Goods">Capital Goods</option>
                    <option value="Consumer Goods">Consumer Goods</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Intermediate Goods">Intermediate Goods</option>
                    <option value="Services">Services</option>
                    <option value="Sustainable Goods">Sustainable Goods</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Agricultural Products">Agricultural Products</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Energy Products">Energy Products</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    name="price"
                    value={tradeGoodFormData.price}
                    onChange={handleTradeGoodInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                    placeholder="Enter price"
                  />
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
                  <div className="col-span-10">{formatDateLocal(transaction.created_at, true)}</div>
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
                    {formatDateLocal(transaction.created_at, true)}
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
good_name,good_quantity,good_unit,good_classification,good_price
${Array.isArray(transaction.goods_list) ? 
  transaction.goods_list.map(good => 
    `${good.name},${good.quantity || 'N/A'},${good.unit || 'N/A'},${good.goods_classification || 'N/A'},${good.price || 'N/A'}`
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

      {/* Entity Search Modal */}
      {showEntitySearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Search Entities</h3>
              <button
                onClick={() => setShowEntitySearchModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              <div className="mb-4">
                <label htmlFor="entity-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Institution Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="entity-search"
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        searchEntities();
                      }
                    }}
                    className="flex-grow shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter institution name"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={searchEntities}
                    disabled={searchLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {searchLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
              
              {searchError && (
                <div className="bg-red-50 p-4 rounded-md mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{searchError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-auto">
                {searchResults.length > 0 ? (
                  <div className="border border-gray-200 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                            Institution Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                            Country
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                            SWIFT Code
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {searchResults.map((entity) => (
                          <tr key={entity.entity_id || Math.random().toString()} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                              {entity.entity_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {entity.country}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {entity.swift || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <button
                                onClick={() => handleEntitySelect(entity)}
                                className="bg-primary text-white hover:bg-blue-700 px-3 py-1 rounded-md transition-colors duration-200"
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : searchQuery && !searchLoading ? (
                  <div className="text-center py-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No results found. Try a different search term.</p>
                  </div>
                ) : !searchQuery ? (
                  <div className="text-center py-6 text-gray-500">
                    Enter a search term to find entities
                  </div>
                ) : null}
              </div>
            </div>
            
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowEntitySearchModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail; 