import React, { useState, useEffect } from 'react';
import { AdjustmentsHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import DashboardService from '../services/dashboardService';
import StatsCard from '../components/dashboard/StatsCard';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import TransactionTable from '../components/dashboard/TransactionTable';

const Dashboard = () => {
  // State management
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

  // Transaction types and statuses for filters
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await DashboardService.fetchDashboardData();
        
        setStats(dashboardData.stats);
        setTransactions(dashboardData.transactions);
        setFilteredTransactions(dashboardData.transactions);
        setLoading(false);
      } catch (err) {
        console.error('Error in dashboard:', err);
        setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Apply filters
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

  // Prepare chart data
  const statusChartData = DashboardService.prepareStatusChartData(filteredTransactions);
  const typeChartData = DashboardService.prepareTypeChartData(filteredTransactions);
  const monthlyChartData = DashboardService.prepareMonthlyChartData(filteredTransactions);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
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

  // Dashboard content
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Clients" 
          value={stats.clients}
          bgColor="bg-primary-light"
          icon={
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        
        <StatsCard 
          title="Total Products" 
          value={stats.products}
          bgColor="bg-secondary"
          icon={
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        
        <StatsCard 
          title="Total Transactions" 
          value={stats.transactions.total}
          bgColor="bg-accent"
          icon={
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        
        <StatsCard 
          title="Approved Transactions" 
          value={stats.transactions.approved}
          bgColor="bg-warning"
          icon={
            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
      
      {/* Charts Section */}
      <DashboardCharts 
        statusChartData={statusChartData}
        typeChartData={typeChartData}
        monthlyChartData={monthlyChartData}
      />
      
      {/* Transactions Table */}
      <TransactionTable 
        filteredTransactions={filteredTransactions}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        handleFilterChange={handleFilterChange}
        resetFilters={resetFilters}
        applyFilters={applyFilters}
        transactionTypes={transactionTypes}
        transactionStatuses={transactionStatuses}
      />
    </div>
  );
};

export default Dashboard; 