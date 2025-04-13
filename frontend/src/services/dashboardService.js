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
  }
};

export default DashboardService; 