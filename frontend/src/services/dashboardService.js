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
      const [dashboardStatsRes, transactionsRes, eventsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/dashboard/stats`),
        axios.get(`${apiUrl}/api/transactions`),
        axios.get(`${apiUrl}/api/events`)
      ]);
      
      // Extract dashboard stats
      const dashboardStats = dashboardStatsRes.data;
      
      // Extract and process transactions
      const transactionsData = transactionsRes.data.map(t => {
        // Associate events with transactions to get status and type
        const transactionEvents = eventsRes.data.filter(e => e.transaction_id === t.transaction_id);
        let status = 'Pending Review'; // Default status
        let type = 'Request'; // Default type
        
        // If there are events for this transaction, use the latest one's status and type
        if (transactionEvents.length > 0) {
          const latestEvent = transactionEvents.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          
          status = latestEvent.status;
          type = latestEvent.type;
        }
        
        return {
          ...t,
          status,
          type,
          source: transactionEvents.length > 0 ? transactionEvents[0].source : 'System',
          goods_list: t.industry ? [t.industry] : [],
        };
      });
      
      // Get 5 most recent transactions
      const recentTransactions = [...transactionsData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      return {
        stats: dashboardStats,
        transactions: transactionsData,
        recentTransactions
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
  
  // Prepare chart data - by status
  prepareStatusChartData: (transactions) => {
    const statusCounts = {};
    transactions.forEach(t => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  },
  
  // Prepare chart data - by type
  prepareTypeChartData: (transactions) => {
    const typeCounts = {};
    transactions.forEach(t => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  },
  
  // Prepare chart data - monthly trend
  prepareMonthlyChartData: (transactions) => {
    const monthlyCounts = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    transactions.forEach(t => {
      const date = new Date(t.created_at);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    });
    
    // Sort by month chronologically
    return Object.entries(monthlyCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.name.split(' ');
        const [bMonth, bYear] = b.name.split(' ');
        return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
      });
  }
};

export default DashboardService; 