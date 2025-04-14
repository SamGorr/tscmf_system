import axios from 'axios';

// Dashboard data service
const DashboardService = {
  // Get API URL from environment or default to localhost
  getApiUrl: () => process.env.REACT_APP_API_URL || 'http://localhost:5000',

  // Fetch dashboard data
  fetchDashboardData: async () => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      
      // Fetch data from the API endpoints
      const [dashboardStatsRes, eventsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/dashboard/stats`),
        axios.get(`${apiUrl}/api/events`)
      ]);
      
      // Extract dashboard stats
      const dashboardStats = dashboardStatsRes.data;
      
      // Extract and process transactions from events data
      const transactionsData = [];
      const processedTransactionIds = new Set();
      
      eventsRes.data.forEach(event => {
        if (event.transaction_id && event.transaction && !processedTransactionIds.has(event.transaction_id)) {
          const transaction = event.transaction;
          processedTransactionIds.add(event.transaction_id);
          
          transactionsData.push({
            transaction_id: transaction.transaction_id,
            created_at: event.created_at,
            status: event.status,
            type: event.type,
            source: event.source,
            country: transaction.country,
            issuing_bank: transaction.issuing_bank,
            confirming_bank: transaction.confirming_bank,
            requesting_bank: transaction.requesting_bank,
            face_amount: transaction.face_amount,
            currency: transaction.currency,
            usd_equivalent_amount: transaction.usd_equivalent_amount,
            date_of_issue: transaction.date_of_issue,
            expiry_date: transaction.expiry_date,
            tenor: transaction.tenor,
            adb_guarantee_trn: transaction.adb_guarantee_trn,
            form_of_eligible_instrument: transaction.form_of_eligible_instrument,
          });
        }
      });
      
      // Get 5 most recent transactions
      const recentTransactions = [...transactionsData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      return {
        stats: dashboardStats,
        transactions: recentTransactions
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return empty data on error
      return {
        stats: {
          clients: 0,
          products: 0,
          transactions: {
            total: 0,
            approved: 0,
            processing: 0,
            declined: 0
          }
        },
        transactions: []
      };
    }
  },

  // Prepare data for status chart
  prepareStatusChartData: (transactions) => {
    const statusMap = {};
    
    transactions.forEach(transaction => {
      const status = transaction.status || 'Unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    
    return Object.keys(statusMap).map(key => ({
      name: key,
      value: statusMap[key]
    }));
  },
  
  // Prepare data for type chart
  prepareTypeChartData: (transactions) => {
    const typeMap = {};
    
    transactions.forEach(transaction => {
      const type = transaction.type || 'Unknown';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    
    return Object.keys(typeMap).map(key => ({
      name: key,
      value: typeMap[key]
    }));
  },
  
  // Prepare data for monthly chart
  prepareMonthlyChartData: (transactions) => {
    const monthMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    transactions.forEach(transaction => {
      if (transaction.created_at) {
        const date = new Date(transaction.created_at);
        const monthYearKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
        monthMap[monthYearKey] = (monthMap[monthYearKey] || 0) + 1;
      }
    });
    
    // Sort by date
    const sortedData = Object.keys(monthMap)
      .map(key => ({ name: key, value: monthMap[key] }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.name.split(' ');
        const [bMonth, bYear] = b.name.split(' ');
        
        if (aYear !== bYear) return aYear - bYear;
        return months.indexOf(aMonth) - months.indexOf(bMonth);
      });
    
    return sortedData;
  },
  
  // Fetch transaction details (entities and goods)
  fetchTransactionDetails: async (transactionId) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.get(`${apiUrl}/api/transactions/${transactionId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  },
  
  // Fetch underlying transactions for a transaction
  fetchUnderlyingTransactions: async (transactionId) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.get(`${apiUrl}/api/transactions/${transactionId}/underlying`);
      return response.data;
    } catch (error) {
      console.error('Error fetching underlying transactions:', error);
      throw error;
    }
  },
  
  // Update transaction with new data
  updateTransaction: async (transactionId, transactionData) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.put(`${apiUrl}/api/transactions/${transactionId}`, transactionData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },
  
  // Update transaction trading information
  updateTransactionTrading: async (transactionId, tradingData) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.put(`${apiUrl}/api/transactions/${transactionId}/trading`, tradingData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction trading information:', error);
      throw error;
    }
  },
  
  // Add a new good to a transaction
  addTransactionGood: async (transactionId, goodData) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.post(`${apiUrl}/api/transactions/${transactionId}/goods`, goodData);
      return response.data;
    } catch (error) {
      console.error('Error adding transaction good:', error);
      throw error;
    }
  },
  
  // Update an existing good
  updateTransactionGood: async (transactionId, goodId, goodData) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.put(`${apiUrl}/api/transactions/${transactionId}/goods/${goodId}`, goodData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction good:', error);
      throw error;
    }
  },
  
  // Delete a good from a transaction
  deleteTransactionGood: async (transactionId, goodId) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.delete(`${apiUrl}/api/transactions/${transactionId}/goods/${goodId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction good:', error);
      throw error;
    }
  },
  
  // Entity operations
  
  // Update all entities for a transaction
  updateTransactionEntities: async (transactionId, entities) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.put(`${apiUrl}/api/transactions/${transactionId}/entities`, {
        entities: entities
      });
      return response.data;
    } catch (error) {
      console.error('Error updating transaction entities:', error);
      throw error;
    }
  },
  
  // Add a new entity to a transaction
  addTransactionEntity: async (transactionId, entityData) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.post(`${apiUrl}/api/transactions/${transactionId}/entities`, entityData);
      return response.data;
    } catch (error) {
      console.error('Error adding transaction entity:', error);
      throw error;
    }
  },
  
  // Fetch entity details by name
  fetchEntityByName: async (entityName) => {
    try {
      if (!entityName || entityName === 'Not specified') {
        console.log('No entity name provided or name is "Not specified"');
        return null;
      }
      
      console.log(`=== Starting fetchEntityByName for '${entityName}' ===`);
      
      // Log the request we're about to make
      const apiUrl = DashboardService.getApiUrl();
      const requestUrl = `${apiUrl}/api/entities/by-name/${encodeURIComponent(entityName)}`;
      console.log(`Fetching entity data from: ${requestUrl}`);
      
      // First try to fetch by name from the specific endpoint
      try {
        console.log(`Making API call to entity-by-name endpoint for '${entityName}'...`);
        const startTime = performance.now();
        const response = await axios.get(requestUrl);
        const endTime = performance.now();
        
        console.log(`API call completed in ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`Response status: ${response.status}`);
        console.log(`Successfully fetched entity data for '${entityName}'`, response.data);
        
        // Validate the returned data
        if (response.data && response.data.entity_name) {
          console.log(`Entity data is valid with entity_name: '${response.data.entity_name}'`);
          console.log(`Response contains fields: ${Object.keys(response.data).join(', ')}`);
          return response.data;
        } else {
          console.warn(`Response data invalid or incomplete:`, response.data);
          throw new Error('Invalid entity data returned from API');
        }
      } catch (specificError) {
        console.warn(`Error fetching entity by name endpoint: ${specificError.message}`);
        console.warn(`Status code: ${specificError.response?.status || 'unknown'}`);
        console.warn(`Error details:`, specificError.response?.data || 'No details available');
        
        // If that fails, try to search in all entities
        console.log('Falling back to searching in all entities');
        console.log(`Making API call to get all entities...`);
        
        const startTime = performance.now();
        const allEntitiesResponse = await axios.get(`${apiUrl}/api/entities`);
        const endTime = performance.now();
        
        console.log(`All entities API call completed in ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`Response status: ${allEntitiesResponse.status}`);
        console.log(`Received ${allEntitiesResponse.data?.length || 0} entities from API`);
        
        // Find the entity with matching name
        if (allEntitiesResponse.data && Array.isArray(allEntitiesResponse.data)) {
          console.log(`Searching for '${entityName}' in ${allEntitiesResponse.data.length} entities...`);
          
          // First try exact match
          let entityData = allEntitiesResponse.data.find(entity => 
            entity.entity_name === entityName
          );
          
          // If no exact match, try case-insensitive match
          if (!entityData) {
            console.log(`No exact match found, trying case-insensitive match...`);
            const nameLower = entityName.toLowerCase();
            entityData = allEntitiesResponse.data.find(entity => 
              entity.entity_name.toLowerCase() === nameLower
            );
          }
          
          // If still no match, try partial match
          if (!entityData) {
            console.log(`No case-insensitive match found, trying partial match...`);
            const nameLower = entityName.toLowerCase();
            entityData = allEntitiesResponse.data.find(entity => 
              entity.entity_name.toLowerCase().includes(nameLower) || 
              nameLower.includes(entity.entity_name.toLowerCase())
            );
          }
          
          if (entityData) {
            console.log(`Found entity '${entityName}' in all entities list:`, entityData);
            console.log(`Matched with entity_name: '${entityData.entity_name}'`);
            return entityData;
          } else {
            console.warn(`Entity '${entityName}' not found in all entities list after searching`);
            console.log(`First 5 entities from list:`);
            allEntitiesResponse.data.slice(0, 5).forEach((entity, i) => {
              console.log(`Entity ${i+1}: Name='${entity.entity_name}', Country='${entity.country}'`);
            });
          }
        } else {
          console.warn(`API did not return a valid array of entities:`, allEntitiesResponse.data);
        }
        
        console.warn(`Entity '${entityName}' not found in all entities list either`);
        return null;
      }
    } catch (error) {
      console.error(`Error in fetchEntityByName for '${entityName}':`, error);
      console.error(`Error type: ${error.name}, Message: ${error.message}`);
      if (error.response) {
        console.error(`Response status: ${error.response.status}`);
        console.error(`Response data:`, error.response.data);
      }
      return null;
    }
  },
  
  // Update an existing entity
  updateTransactionEntity: async (transactionId, entityId, entityData) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.put(`${apiUrl}/api/transactions/${transactionId}/entities/${entityId}`, entityData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction entity:', error);
      throw error;
    }
  },
  
  // Delete an entity from a transaction
  deleteTransactionEntity: async (transactionId, entityId) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.delete(`${apiUrl}/api/transactions/${transactionId}/entities/${entityId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction entity:', error);
      throw error;
    }
  },

  // Update verification check statuses
  updateVerificationChecks: async (transactionId, checkData) => {
    try {
      const apiUrl = DashboardService.getApiUrl();
      const response = await axios.put(`${apiUrl}/api/transactions/${transactionId}/verification-checks`, checkData);
      return response.data;
    } catch (error) {
      console.error('Error updating verification checks:', error);
      throw error;
    }
  }
};

export default DashboardService; 