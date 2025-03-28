import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/transactions/${id}`);
        setTransaction(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError('Failed to load transaction details');
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const handleProcess = async () => {
    try {
      setProcessingAction(true);
      const response = await axios.post(`http://localhost:8000/api/transactions/${id}/process`);
      setTransaction(response.data);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error processing transaction:', err);
      setError('Failed to process transaction');
      setProcessingAction(false);
    }
  };

  const handleClose = async () => {
    // In a real implementation, this would call a dedicated endpoint
    // For now, it just updates the status locally
    try {
      setProcessingAction(true);
      const response = await axios.put(`http://localhost:8000/api/transactions/${id}`, {
        status: 'COMPLETED'
      });
      setTransaction(response.data);
      setProcessingAction(false);
    } catch (err) {
      console.error('Error closing transaction:', err);
      setError('Failed to close transaction');
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Details</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate('/transactions')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Back to List
          </button>
          
          {transaction.status === 'SUBMITTED' && (
            <button
              onClick={handleProcess}
              disabled={processingAction}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${processingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processingAction ? 'Processing...' : 'Process Transaction'}
            </button>
          )}
          
          {transaction.status === 'APPROVED' && (
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
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-800">
                {transaction.reference_number}
              </h2>
              <p className="text-sm text-gray-500">Created on {new Date(transaction.created_at).toLocaleString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(transaction.status)}`}>
              {transaction.status}
            </span>
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
              <p className="text-base">{transaction.amount} {transaction.currency}</p>
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
      
      {/* Tracking Dates Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Tracking Information</h2>
        </div>
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Request Date</h3>
              <p className="text-base">{new Date(transaction.request_date).toLocaleString()}</p>
            </div>
            
            {transaction.approval_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Approval Date</h3>
                <p className="text-base">{new Date(transaction.approval_date).toLocaleString()}</p>
              </div>
            )}
            
            {transaction.completion_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Completion Date</h3>
                <p className="text-base">{new Date(transaction.completion_date).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail; 