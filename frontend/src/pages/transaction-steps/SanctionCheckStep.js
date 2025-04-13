import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import TransactionStepIndicator from '../../components/TransactionStepIndicator';
import { 
  ShieldCheckIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SanctionCheckStep = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sanctionsData, setSanctionsData] = useState([]);
  const [runningCheck, setRunningCheck] = useState(false);
  
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        // Get the API URL from environment variable or default to localhost:5000
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        // Fetch transaction details
        const response = await axios.get(`${apiUrl}/api/transactions/${id}`);
        setTransaction(response.data);
        
        // Fetch sanctions check data if available
        try {
          const sanctionsResponse = await axios.get(`${apiUrl}/api/transactions/${id}/sanctions-check`);
          setSanctionsData(sanctionsResponse.data);
        } catch (sanctionsError) {
          console.error('Error fetching sanctions check data:', sanctionsError);
          // If sanctions data isn't available yet, that's OK
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [id]);

  const runSanctionsCheck = async () => {
    try {
      setRunningCheck(true);
      
      // Get the API URL from environment variable or default to localhost:5000
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Run the sanctions check
      const response = await axios.get(`${apiUrl}/api/transactions/${id}/sanctions-check`);
      setSanctionsData(response.data);
      
      // Refresh transaction data to get updated status
      const transactionResponse = await axios.get(`${apiUrl}/api/transactions/${id}`);
      setTransaction(transactionResponse.data);
      
      setRunningCheck(false);
    } catch (err) {
      console.error('Error running sanctions check:', err);
      setError(err.message);
      setRunningCheck(false);
    }
  };
  
  const handleContinue = () => {
    navigate(`/transactions/${id}/eligibility-check`);
  };
  
  const handleBack = () => {
    navigate(`/transactions/${id}`);
  };

  const getStatusBadge = () => {
    if (!transaction || !transaction.sanction_check_status) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          Not Checked
        </div>
      );
    }

    switch (transaction.sanction_check_status) {
      case 'CLEARED':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Cleared
          </div>
        );
      case 'REVIEW':
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            Requires Review
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {transaction.sanction_check_status}
          </div>
        );
    }
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Transaction Processing</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center">Loading transaction data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Transaction Processing</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Processing</h1>
        <button 
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Transaction Details
        </button>
      </div>
      
      <TransactionStepIndicator transactionId={id} currentStep="sanction-check" transaction={transaction} />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-6 w-6 text-gray-800 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Sanctions Check</h2>
          </div>
          {getStatusBadge()}
        </div>
        
        <p className="text-gray-600 mb-6">
          Review transaction entities against global sanctions lists to identify any potential matches or concerns.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">Entities to Check</h3>
          
          {sanctionsData.length > 0 ? (
            <div className="space-y-3">
              {sanctionsData.map((entity) => (
                <div key={entity.entity_id} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                  <div>
                    <div className="font-medium">{entity.entity_name}</div>
                    <div className="text-sm text-gray-500">{entity.entity_type} | {entity.entity_country}</div>
                  </div>
                  <div>
                    {entity.match_status === 'Cleared' || entity.match_status === 'CLEARED' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Cleared
                      </span>
                    ) : entity.match_status === 'Reviewed' || entity.match_status === 'REVIEW' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                        Review Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not Checked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No entity data available. Run a sanctions check to screen entities.</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <button
            onClick={runSanctionsCheck}
            disabled={runningCheck}
            className={`px-4 py-2 rounded text-white flex items-center justify-center ${
              runningCheck ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {runningCheck ? (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                Running Check...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Run Sanctions Check
              </>
            )}
          </button>
          
          <div className="flex space-x-4">
            <Link
              to={`/transactions/${id}/sanctions-check`}
              className="px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50 flex items-center"
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              View Detailed Results
            </Link>
            
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Continue to Eligibility Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SanctionCheckStep; 