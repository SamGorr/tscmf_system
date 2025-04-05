import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AdjustmentsHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  AreaChart, Area
} from 'recharts';
import { formatGoodsList, formatCurrency, formatDate } from '../utils/dataUtils';

// Set this to false to use the API instead of mock data
const FORCE_MOCK_DATA = false;

// Mock data for testing when API is not available
const MOCK_DATA = {
  clients: [
    { id: 1, name: 'Global Traders Inc.', code: 'GTI', client_type: 'CORPORATE', country: 'USA' },
    { id: 2, name: 'Eastern Suppliers Ltd.', code: 'ESL', client_type: 'CORPORATE', country: 'China' },
    { id: 3, name: 'African Farmers Cooperative', code: 'AFC', client_type: 'SME', country: 'Kenya' },
    { id: 4, name: 'South American Exporters', code: 'SAE', client_type: 'CORPORATE', country: 'Brazil' },
    { id: 5, name: 'European Distribution Network', code: 'EDN', client_type: 'CORPORATE', country: 'Germany' }
  ],
  products: [
    { id: 1, name: 'Invoice Financing', code: 'IF', category: 'FINANCING', interest_rate: 5.75 },
    { id: 2, name: 'Warehouse Receipt Financing', code: 'WRF', category: 'FINANCING', interest_rate: 6.25 },
    { id: 3, name: 'Export Credit Insurance', code: 'ECI', category: 'INSURANCE', premium_rate: 2.5 },
    { id: 4, name: 'Import Loan', code: 'IL', category: 'FINANCING', interest_rate: 7.0 },
    { id: 5, name: 'Supply Chain Finance', code: 'SCF', category: 'FINANCING', interest_rate: 5.5 }
  ],
  transactions: [
    {
      id: 10001,
      reference_number: 'TXN-10001',
      client_name: 'Global Traders Inc.',
      client_type: 'CORPORATE',
      type: 'Request',
      amount: 500000,
      currency: 'USD',
      source: 'Email',
      industry: 'Manufacturing',
      goods_list: ['Manufacturing'],
      status: 'Transaction Booked',
      created_at: '2024-04-01T00:00:00Z',
      maturity_date: '2024-06-30T00:00:00Z'
    },
    {
      id: 10002,
      reference_number: 'TXN-10002',
      client_name: 'Eastern Suppliers Ltd.',
      client_type: 'CORPORATE',
      type: 'Inquiry',
      amount: 750000,
      currency: 'EUR',
      source: 'System',
      industry: 'Agriculture',
      goods_list: ['Agriculture'],
      status: 'Pending Review',
      created_at: '2024-04-01T00:00:00Z',
      maturity_date: '2024-07-30T00:00:00Z'
    },
    {
      id: 10003,
      reference_number: 'TXN-10003',
      client_name: 'African Farmers Cooperative',
      client_type: 'SME',
      type: 'Request',
      amount: 1200000,
      currency: 'USD',
      source: 'Email',
      industry: 'Energy',
      goods_list: ['Energy'],
      status: 'Viability Check Failed - Limit',
      created_at: '2024-04-01T00:00:00Z',
      maturity_date: '2024-09-28T00:00:00Z'
    }
  ]
};

// Enhanced tooltip component with better styling
const TransactionTooltip = ({ transaction }) => {
  return (
    <div className="absolute left-0 top-full mt-1 bg-white shadow-xl rounded-lg p-4 z-50 w-80 text-xs border border-gray-200 transform transition-opacity duration-200 opacity-100">
      {/* Tooltip Arrow */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>
      
      {/* Header */}
      <div className="font-medium text-gray-800 text-sm mb-3 pb-2 border-b border-gray-100">
        Transaction Details
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="text-gray-500">Reference:</div>
        <div className="font-medium">{transaction.reference_number}</div>
        
        <div className="text-gray-500">Client:</div>
        <div>{transaction.client_name}</div>
        
        <div className="text-gray-500">Client Type:</div>
        <div>{transaction.client_type || 'Not specified'}</div>
        
        <div className="text-gray-500">Industry:</div>
        <div>{transaction.industry || 'Not specified'}</div>
        
        <div className="text-gray-500">Amount:</div>
        <div className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</div>
        
        <div className="text-gray-500">Product:</div>
        <div>{transaction.product_name || 'Not specified'}</div>
        
        <div className="text-gray-500">Goods:</div>
        <div>{formatGoodsList(transaction.goods_list)}</div>
        
        <div className="text-gray-500">Status:</div>
        <div>
          <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full 
            ${transaction.status.includes('Success') || transaction.status.includes('Booked') ? 'bg-green-100 text-green-800' : 
              transaction.status.includes('Pending') ? 'bg-blue-100 text-blue-800' : 
              transaction.status.includes('Failed') || transaction.status.includes('Rejected') ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'}`}>
            {transaction.status}
          </span>
        </div>
        
        <div className="text-gray-500">Created:</div>
        <div>{formatDate(transaction.created_at, true)}</div>
      </div>
      
      {/* View Details Link */}
      <div className="mt-3 pt-2 border-t border-gray-100 text-right">
        <Link to={`/transactions/${transaction.id}`} className="text-primary hover:text-primary-dark text-xs font-medium">
          View Full Details →
        </Link>
      </div>
    </div>
  );
};

// Transaction row component with improved tooltip positioning
const TransactionRow = ({ transaction }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <tr 
      className="hover:bg-gray-50"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative">
        <div className="relative">
          {transaction.reference_number}
          {showTooltip && <TransactionTooltip transaction={transaction} />}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.source}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.client_name || transaction.client_id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(transaction.amount, transaction.currency)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatGoodsList(transaction.goods_list)}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${transaction.status.includes('Success') || transaction.status.includes('Booked') ? 'bg-green-100 text-green-800' : 
            transaction.status.includes('Pending') ? 'bg-blue-100 text-blue-800' : 
            transaction.status.includes('Failed') || transaction.status.includes('Rejected') ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'}`}>
          {transaction.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(transaction.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link to={`/transactions/${transaction.id}`} className="text-primary hover:text-primary-dark">View</Link>
      </td>
    </tr>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    products: 0,
    transactions: {
      total: 0,
      approved: 0,
      processing: 0,
      declined: 0
    }
  });
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  // Transaction types and statuses
  const transactionTypes = ['Inquiry', 'Request', 'Cancellation', 'Closure'];
  const transactionStatuses = [
    'Pending Review', 
    'Viability Check Successes', 
    'Viability Check Failed - Sanction', 
    'Viability Check Failed - Limit', 
    'Viability Check Failed - Exposure', 
    'Viability Check Failed - Eligibility', 
    'Transaction Booked', 
    'Transaction Rejected'
  ];

  // Chart colors
  const COLORS = ['#007DB7', '#00A5D2', '#00B6C9', '#8DC63F', '#FDB515', '#FF7F50', '#9370DB', '#20B2AA'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the API URL from environment variable or default to localhost
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        try {
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
          
          // Set stats from API
          setStats({
            clients: dashboardStats.clients,
            products: dashboardStats.products,
            transactions: dashboardStats.transactions
          });
          
          setTransactions(transactionsData);
          setFilteredTransactions(transactionsData);
          
          // Get 5 most recent transactions
          const sorted = [...transactionsData].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          ).slice(0, 5);
          
          setRecentTransactions(sorted);
          setLoading(false);
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('Failed to load data from API: ' + (apiError.message || 'Unknown error'));
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in dashboard:', err);
        setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters function
  const applyFilters = () => {
    let result = [...transactions];
    
    if (filters.type) {
      result = result.filter(t => t.type === filters.type);
    }
    
    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(t => new Date(t.created_at) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter(t => new Date(t.created_at) <= toDate);
    }
    
    if (filters.amountMin) {
      result = result.filter(t => parseFloat(t.amount) >= parseFloat(filters.amountMin));
    }
    
    if (filters.amountMax) {
      result = result.filter(t => parseFloat(t.amount) <= parseFloat(filters.amountMax));
    }
    
    setFilteredTransactions(result);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    });
    setFilteredTransactions(transactions);
  };

  // Prepare chart data functions
  const prepareStatusChartData = () => {
    // Group by status
    const statusCounts = {};
    filteredTransactions.forEach(t => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };
  
  const prepareTypeChartData = () => {
    // Group by type
    const typeCounts = {};
    filteredTransactions.forEach(t => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  };
  
  const prepareMonthlyChartData = () => {
    // Group by month for time series data
    const monthlyCounts = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    filteredTransactions.forEach(t => {
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
  };

  const statusChartData = prepareStatusChartData();
  const typeChartData = prepareTypeChartData();
  const monthlyChartData = prepareMonthlyChartData();

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-light p-3 rounded-md">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Clients</h2>
              <p className="text-3xl font-semibold text-gray-800">{stats.clients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-secondary p-3 rounded-md">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Products</h2>
              <p className="text-3xl font-semibold text-gray-800">{stats.products}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-accent p-3 rounded-md">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Transactions</h2>
              <p className="text-3xl font-semibold text-gray-800">{stats.transactions.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-warning p-3 rounded-md">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Approved Transactions</h2>
              <p className="text-3xl font-semibold text-gray-800">{stats.transactions.approved}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Visualization - All charts side by side */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Transaction Analytics</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status Donut Chart */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">By Status</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Transaction Type Bar Chart */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">By Type</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={typeChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Transactions" 
                    fill="#8DC63F" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Monthly Area Chart */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Trend</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Transactions" 
                    stroke="#007DB7" 
                    fill="#007DB7" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions Table with Filters */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Transactions</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button 
              onClick={resetFilters}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Reset
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        {showFilters && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="">All Types</option>
                  {transactionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  {transactionStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  name="amountMin"
                  value={filters.amountMin}
                  onChange={handleFilterChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  name="amountMax"
                  value={filters.amountMax}
                  onChange={handleFilterChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goods</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length ? (
                filteredTransactions.slice(0, 10).map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-700">
            Showing {Math.min(10, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </span>
          <Link to="/transactions" className="text-sm font-medium text-primary hover:text-primary-dark">
            View all transactions →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 