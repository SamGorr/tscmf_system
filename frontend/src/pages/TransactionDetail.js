import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

/**
 * TransactionDetail Component
 * 
 * This component displays detailed information about a transaction.
 * It enables users to view and edit transaction details, entities,
 * trade goods, pricing information, and more.
 */
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

  // Add this to your state declarations at the top of the component
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);

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
    cover: 0,
    guarantee_fee_rate: 0
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
        } catch (apiError) {
          console.error('API Error:', apiError);
          setError(apiError.message);
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

  // =========================================================================
  // Entity Section Handlers
  // =========================================================================
  
  /**
   * Handle entity input changes in the entity form
   */
  const handleEntityInputChange = (e) => {
    const { name, value } = e.target;
    setEntityFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Open modal to add a new entity to the transaction
   */
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

  /**
   * Open modal to edit an existing entity
   * @param {Object} entity - The entity to edit
   */
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

  /**
   * Handle form submission for adding/editing an entity
   */
  const handleEntitySubmit = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingAction(true);
      
      if (currentEntity) {
        // Update existing entity
        if (currentEntity.id && !isNaN(currentEntity.id)) {
          // If the entity has a numeric ID, it's already in the database - update it
          await DashboardService.updateTransactionEntity(
            transaction.transaction_id,
            currentEntity.id,
            entityFormData
          );
        }
        
        // Update local state
        setEntities(prev => 
          prev.map(entity => 
            entity.id === entityFormData.id ? entityFormData : entity
          )
        );
      } else {
        // Add new entity
        const newEntity = await DashboardService.addTransactionEntity(
          transaction.transaction_id,
          entityFormData
        );
        
        // Add the returned entity (with ID) to local state
        setEntities(prev => [...prev, newEntity]);
      }
      
      setShowEntityModal(false);
    } catch (error) {
      console.error('Error saving entity:', error);
      alert('Error saving entity. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  /**
   * Submit entity section changes to the API
   */
  const handleSubmitEntitySection = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setProcessingAction(true);
      
      // Update entities via API service
      const result = await DashboardService.updateTransactionEntities(
        transaction.transaction_id, 
        entities
      );
      
      if (result) {
        console.log('Entities updated successfully:', result);
        
        // Update the transaction state with the updated entities
        setTransaction(prev => ({
          ...prev,
          entities: result.entities || entities
        }));
        
        setIsEditingEntity(false);
        
        // Show success message
        alert('Entity information updated successfully');
      }
    } catch (err) {
      console.error('Error updating entities:', err);
      alert('Error updating entities. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  /**
   * Remove an entity from the transaction
   */
  const handleDeleteEntity = async (entityId) => {
    try {
      setProcessingAction(true);
      
      // If the entity has a numeric ID, delete it from the database
      if (!isNaN(entityId)) {
        await DashboardService.deleteTransactionEntity(
          transaction.transaction_id,
          entityId
        );
      }
      
      // Update local state
      setEntities(prev => prev.filter(entity => entity.id !== entityId));
      
    } catch (error) {
      console.error('Error deleting entity:', error);
      alert('Error deleting entity. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // =========================================================================
  // Trading Section Handlers
  // =========================================================================

  /**
   * Handle input changes in the main transaction form
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Submit trading section changes to the API
   */
  const handleSubmitTradingSection = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setProcessingAction(true);
      
      // Prepare trading data to update
      const tradingData = {
        goods: tradeGoods,
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
      
      // Update via API service
      const result = await DashboardService.updateTransactionTrading(transaction.transaction_id, tradingData);
      
      if (result) {
        console.log('Trading information updated successfully:', result);
        
        // Update local transaction state
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
        
        setTransaction(updatedTransaction);
        setIsEditingTrading(false);
        
        // Show success message
        alert('Trading information updated successfully');
      }
    } catch (err) {
      console.error('Error updating trading information:', err);
      alert('Error updating trading information. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // =========================================================================
  // Helper Functions
  // =========================================================================

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

  // =========================================================================
  // TradeGoods Handling Functions
  // =========================================================================

  /**
   * Handle input changes in the trade good form
   */
  const handleTradeGoodInputChange = (e) => {
    const { name, value } = e.target;
    setTradeGoodFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Open modal to add a new trade good
   */
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

  /**
   * Open modal to edit an existing trade good
   * @param {Object} good - The trade good to edit
   * @param {number} index - The index of the trade good in the array
   */
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

  /**
   * Handle form submission for adding/editing a trade good
   */
  const handleTradeGoodSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setProcessingAction(true);
      
      if (currentTradeGoodIndex !== null) {
        // Update existing good
        const goodToUpdate = tradeGoods[currentTradeGoodIndex];
        if (goodToUpdate.id) {
          // If the good has an ID, it's already in the database - update it
          await DashboardService.updateTransactionGood(
            transaction.transaction_id, 
            goodToUpdate.id, 
            tradeGoodFormData
          );
        }
        
        // Update the local state
        setTradeGoods(prev => 
          prev.map((good, index) => 
            index === currentTradeGoodIndex ? tradeGoodFormData : good
          )
        );
      } else {
        // Add new good
        const newGood = await DashboardService.addTransactionGood(
          transaction.transaction_id,
          tradeGoodFormData
        );
        
        // Add the returned good (with ID) to local state
        setTradeGoods(prev => [...prev, {
          ...tradeGoodFormData,
          id: newGood.id
        }]);
      }
      
      // Close the modal
      setShowTradeGoodModal(false);
      
    } catch (error) {
      console.error('Error saving trade good:', error);
      alert('Error saving trade good. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  /**
   * Remove a trade good from the transaction
   * @param {number} index - The index of the trade good to remove
   */
  const handleDeleteTradeGood = async (index) => {
    try {
      setProcessingAction(true);
      
      const goodToDelete = tradeGoods[index];
      
      // If the good has an ID, delete it from the database
      if (goodToDelete.id) {
        await DashboardService.deleteTransactionGood(
          transaction.transaction_id,
          goodToDelete.id
        );
      }
      
      // Update the local state
      setTradeGoods(prevGoods => prevGoods.filter((_, i) => i !== index));
      
    } catch (error) {
      console.error('Error deleting trade good:', error);
      alert('Error deleting trade good. Please try again.');
    } finally {
      setProcessingAction(false);
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
    // Update the transaction status to show checks are in progress
    const updatedTransaction = {
      ...transaction,
      sanctions_check_passed: null,
      eligibility_check_passed: null,
      limits_check_passed: null,
      pricing_completed: null,
      // Add timestamps to show checks are in progress
      sanctions_check_timestamp: new Date().toISOString(),
      eligibility_check_timestamp: new Date().toISOString(),
      limits_check_timestamp: new Date().toISOString(),
      pricing_timestamp: new Date().toISOString()
    };
    
    // Update local state to show checks are in progress
    setTransaction(updatedTransaction);
    
    // Run all checks simultaneously
    runAllChecks(updatedTransaction);
  };
  
  // Function to run all checks simultaneously
  const runAllChecks = async (transactionData) => {
    try {
      // Set a slight delay to simulate processing
      setTimeout(async () => {
        // Simulate API calls for each check
        // In a real implementation, these would be actual API calls
        
        // Mock results - in a real implementation these would come from the backend
        const mockResults = {
          sanctions_check_passed: Math.random() > 0.2, // 80% pass rate
          eligibility_check_passed: Math.random() > 0.3, // 70% pass rate
          limits_check_passed: Math.random() > 0.1, // 90% pass rate
          pricing_completed: true
        };
        
        // Update transaction with results
        const finalResults = {
          ...transactionData,
          ...mockResults,
          // Update timestamps to show when checks completed
          sanctions_check_timestamp: new Date().toISOString(),
          eligibility_check_timestamp: new Date().toISOString(),
          limits_check_timestamp: new Date().toISOString(),
          pricing_timestamp: new Date().toISOString()
        };
        
        // Update transaction state with results
        setTransaction(finalResults);
        
        // Save the results to the backend
        try {
          await DashboardService.updateTransaction(transaction.transaction_id, finalResults);
          console.log('Transaction check results saved to backend');
        } catch (error) {
          console.error('Error saving check results:', error);
        }
      }, 2000); // 2-second delay to simulate processing
    } catch (error) {
      console.error('Error running checks:', error);
      alert('There was an error running the checks. Please try again.');
    }
  };

  // =========================================================================
  // Request Information Handling Functions
  // =========================================================================
  
  /**
   * Handle input changes in the request information form
   */
  const handleRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Submit request information section to the API
   */
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
        cover: parseFloat(requestData.cover) / 100 || 0, // Convert from percentage to decimal
        guarantee_fee_rate: parseFloat(requestData.guarantee_fee_rate) || 0
      };
      
      // Update the transaction using the service
      const result = await DashboardService.updateTransaction(transaction.transaction_id, updatedTransaction);
      
      if (result) {
        console.log('Transaction updated successfully:', result);
        
        // Update the transaction state
        setTransaction(updatedTransaction);
        
        // Exit edit mode
        setIsEditingRequest(false);
        
        // Show success message
        alert('Request information updated successfully');
      }
    } catch (error) {
      console.error('Error updating request information:', error);
      alert('Error updating request information. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Update the useEffect to initialize requestData when transaction changes
  useEffect(() => {
    if (transaction) {    
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
        cover: transaction.cover ? transaction.cover * 100 : 0, // Convert from decimal to percentage
        guarantee_fee_rate: transaction.guarantee_fee_rate || 0
      });
    }
  }, [transaction]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-4 text-gray-600 hover:text-gray-800">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
     
      {/* Add Transaction Step Indicator */}
      {transaction && (
        <TransactionStepIndicator transactionId={id} currentStep="email-extract" transaction={transaction} />
      )}
  
      {/* Add a button at the bottom to navigate to the next step */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={navigateToNextStep}
          className="flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200"
        >
          Confirm Request Information
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </button>
      </div>
      
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
                      <p className="text-base">{getEntityData(activeTab).signing_office_branch || "Not specified"}</p>
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

                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Requested Price</h3>
                    {isEditingRequest ? (
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="guarantee_fee_rate"
                          value={requestData.guarantee_fee_rate}
                          onChange={handleRequestInputChange}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                          step="0.01"
                          min="0"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    ) : (
                      <p className="text-base">
                        {transaction.guarantee_fee_rate ? `${transaction.guarantee_fee_rate * 100}%` : 'Not specified'}
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
          
          {/* Underlying Transactions Information Section */}
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
              
              {/* Transaction Information Section */}
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
                
                {/* Add Industry field right after Form of Eligible Instrument */}
                <div className="flex items-start">
                  <TagIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Industry</h3>
                    {isEditingTrading ? (
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    ) : (
                      <p className="text-base">{transaction.industry || 'Not specified'}</p>
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
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Local Currency Amount</h3>
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
          
          {/* Trade Entity Information Section */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center px-6 py-4">
                <BuildingLibraryIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-800">Relevant Entity Information</h2>
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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        {isEditingEntity && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {entities.map((entity, index) => (
                        <tr key={entity.id || index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entity.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entity.type}</td>
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