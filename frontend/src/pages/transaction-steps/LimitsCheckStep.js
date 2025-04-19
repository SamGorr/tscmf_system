import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TransactionStepIndicator from '../../components/TransactionStepIndicator';
import { 
  ScaleIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  GlobeAsiaAustraliaIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const LimitsCheckStep = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [limitsData, setLimitsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningCheck, setRunningCheck] = useState(false);
  
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/transactions/${id}`);
        setTransaction(response.data);
        
        try {
          await runLimitsCheck();
        } catch (limitsError) {
          console.error('Error fetching limits check data:', limitsError);
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

  const runLimitsCheck = async () => {
    try {
      setRunningCheck(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/transactions/${id}/limit-check`);
      setLimitsData(response.data);
      
      const transactionResponse = await axios.get(`${apiUrl}/api/transactions/${id}`);
      setTransaction(transactionResponse.data);
      
      setRunningCheck(false);
      return response.data;
    } catch (err) {
      console.error('Error running limits check:', err);
      setError(err.message);
      setRunningCheck(false);
      throw err;
    }
  };
  
  const handleContinue = () => {
    navigate(`/transactions/${id}/pricing`);
  };
  
  const handleBack = () => {
    navigate(`/transactions/${id}/eligibility-check`);
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper function to format percentages
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%';
    return value.toFixed(2) + '%';
  };

  // Helper function to get status color classes based on status
  const getStatusColorClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toUpperCase()) {
      case 'PASSED':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get utilization color based on percentage
  const getUtilizationColor = (percentage) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Processing</h1>
        <button 
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Eligibility Check
        </button>
      </div>
      
      <TransactionStepIndicator transactionId={id} currentStep="limits-check" transaction={transaction} />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <ScaleIcon className="h-6 w-6 mr-2 text-primary" />
            Limits Check
          </h2>

          <button
            onClick={runLimitsCheck}
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
                Run Limits Check
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {transaction && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Transaction Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-medium">{transaction.transaction_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount (USD)</p>
                    <p className="font-medium">{formatCurrency(transaction.usd_equivalent_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Covered Amount (USD)</p>
                    <p className="font-medium">{formatCurrency(transaction.usd_equivalent_amount_cover)}</p>
                  </div>
                </div>
              </div>
            )}

            {limitsData ? (
              <div className="space-y-6">
                {/* Overall Status */}
                <div className={`p-4 rounded-lg flex items-center justify-between ${
                  limitsData.overall_status === 'PASSED' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <div className="flex items-center">
                    {limitsData.overall_status === 'PASSED' ? (
                      <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                    ) : (
                      <ExclamationCircleIcon className="h-8 w-8 text-yellow-600 mr-3" />
                    )}
                    <div>
                      <h3 className="font-medium text-lg">
                        {limitsData.overall_status === 'PASSED' 
                          ? 'All Limit Checks Passed' 
                          : 'Warning: Some Limit Checks Need Review'}
                      </h3>
                      <p className="text-sm">
                        {limitsData.overall_status === 'PASSED' 
                          ? 'Transaction can proceed based on limit availability.' 
                          : 'One or more limits may be exceeded. Review details below.'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(limitsData.overall_status)}`}>
                    {limitsData.overall_status}
                  </span>
                </div>

                {/* Program Limit Check */}
                {limitsData.program_limit_check && !limitsData.program_limit_check.error && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 flex items-center">
                      <BuildingLibraryIcon className="h-6 w-6 text-primary mr-2" />
                      <h3 className="text-lg font-medium">Program Limit Check</h3>
                      <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(limitsData.program_limit_check.status)}`}>
                        {limitsData.program_limit_check.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Program Limit</p>
                          <p className="font-medium">{formatCurrency(limitsData.program_limit_check.total_program_approved_limit)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Currently Utilized</p>
                          <p className="font-medium">{formatCurrency(limitsData.program_limit_check.total_utilized)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Available</p>
                          <p className="font-medium">{formatCurrency(limitsData.program_limit_check.available_program_limit)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Transaction Amount</p>
                          <p className="font-medium">{formatCurrency(limitsData.program_limit_check.transaction_amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Post-Transaction Utilization</p>
                          <p className="font-medium">{formatCurrency(limitsData.program_limit_check.post_transaction_utilization)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Post-Transaction Available</p>
                          <p className="font-medium">{formatCurrency(limitsData.program_limit_check.post_transaction_available)}</p>
                        </div>
                      </div>
                      
                      {/* Utilization bars */}
                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Utilization</span>
                            <span>{formatPercentage(limitsData.program_limit_check.current_utilization_percentage)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`${getUtilizationColor(limitsData.program_limit_check.current_utilization_percentage)} h-2.5 rounded-full`}
                              style={{ width: `${Math.min(limitsData.program_limit_check.current_utilization_percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Post-Transaction Utilization</span>
                            <span>{formatPercentage(limitsData.program_limit_check.post_transaction_percentage)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`${getUtilizationColor(limitsData.program_limit_check.post_transaction_percentage)} h-2.5 rounded-full`}
                              style={{ width: `${Math.min(limitsData.program_limit_check.post_transaction_percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Country Limit Check */}
                {limitsData.country_limit_check && !limitsData.country_limit_check.error && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 flex items-center">
                      <GlobeAsiaAustraliaIcon className="h-6 w-6 text-primary mr-2" />
                      <h3 className="text-lg font-medium">Country Limit Check - {limitsData.country_limit_check.country}</h3>
                      <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(limitsData.country_limit_check.status)}`}>
                        {limitsData.country_limit_check.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Country Limit</p>
                          <p className="font-medium">{formatCurrency(limitsData.country_limit_check.total_country_approved_limit)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Currently Utilized</p>
                          <p className="font-medium">{formatCurrency(limitsData.country_limit_check.total_utilized)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Available</p>
                          <p className="font-medium">{formatCurrency(limitsData.country_limit_check.available_country_limit)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Transaction Amount</p>
                          <p className="font-medium">{formatCurrency(limitsData.country_limit_check.transaction_amount)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Post-Transaction Utilization</p>
                          <p className="font-medium">{formatCurrency(limitsData.country_limit_check.post_transaction_utilization)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Post-Transaction Available</p>
                          <p className="font-medium">{formatCurrency(limitsData.country_limit_check.post_transaction_available)}</p>
                        </div>
                      </div>
                      
                      {/* Utilization bars */}
                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Utilization</span>
                            <span>{formatPercentage(limitsData.country_limit_check.current_utilization_percentage)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`${getUtilizationColor(limitsData.country_limit_check.current_utilization_percentage)} h-2.5 rounded-full`}
                              style={{ width: `${Math.min(limitsData.country_limit_check.current_utilization_percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Post-Transaction Utilization</span>
                            <span>{formatPercentage(limitsData.country_limit_check.post_transaction_percentage)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`${getUtilizationColor(limitsData.country_limit_check.post_transaction_percentage)} h-2.5 rounded-full`}
                              style={{ width: `${Math.min(limitsData.country_limit_check.post_transaction_percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Entity Limit Checks */}
                {limitsData.entity_limit_checks && limitsData.entity_limit_checks.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <BanknotesIcon className="h-6 w-6 text-primary mr-2" />
                      Entity Limit Checks
                    </h3>
                    
                    {limitsData.entity_limit_checks.map((entityCheck, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 flex items-center">
                          <h4 className="text-md font-medium">
                            {entityCheck.entity_name} ({entityCheck.entity_type})
                          </h4>
                          {entityCheck.overall_status && (
                            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClass(entityCheck.overall_status)}`}>
                              {entityCheck.overall_status}
                            </span>
                          )}
                        </div>
                        
                        {entityCheck.error ? (
                          <div className="p-4 text-red-600">{entityCheck.error}</div>
                        ) : (
                          <div className="p-4">
                            {entityCheck.no_matching_facilities ? (
                              <p className="text-yellow-600">No facility limits found that exactly match the transaction's product type ({transaction.sub_limit_type || 'Not specified'}).</p>
                            ) : (
                              <>
                                {/* Entity Level Summary */}
                                <div className="mb-6">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                      <p className="text-sm text-gray-500">Total Entity Limit</p>
                                      <p className="font-medium">{formatCurrency(entityCheck.total_approved_limit)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Currently Utilized</p>
                                      <p className="font-medium">{formatCurrency(entityCheck.total_utilized)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Available</p>
                                      <p className="font-medium">{formatCurrency(entityCheck.available_limit)}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                      <p className="text-sm text-gray-500">Transaction Amount</p>
                                      <p className="font-medium">{formatCurrency(entityCheck.transaction_amount)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Post-Transaction Utilization</p>
                                      <p className="font-medium">{formatCurrency(entityCheck.post_transaction_utilization)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Post-Transaction Available</p>
                                      <p className="font-medium">{formatCurrency(entityCheck.post_transaction_available)}</p>
                                    </div>
                                  </div>
                                  
                                  {/* Utilization bars */}
                                  <div className="mt-4 space-y-4">
                                    <div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Current Utilization</span>
                                        <span>{formatPercentage(entityCheck.current_utilization_percentage)}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                          className={`${getUtilizationColor(entityCheck.current_utilization_percentage)} h-2.5 rounded-full`}
                                          style={{ width: `${Math.min(entityCheck.current_utilization_percentage, 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>Post-Transaction Utilization</span>
                                        <span>{formatPercentage(entityCheck.post_transaction_percentage)}</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div 
                                          className={`${getUtilizationColor(entityCheck.post_transaction_percentage)} h-2.5 rounded-full`}
                                          style={{ width: `${Math.min(entityCheck.post_transaction_percentage, 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Facility Level Details */}
                                {entityCheck.facility_limit_checks && entityCheck.facility_limit_checks.length > 0 ? (
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">Product Facility Limits</h5>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Facility Limit
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Approved Limit
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Current Utilization
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Available
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Post-Txn Available
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Impact %
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Status
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {entityCheck.facility_limit_checks.map((facilityCheck, i) => (
                                            <tr key={i}>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {facilityCheck.facility_limit}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(facilityCheck.approved_limit)}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                  <span className="mr-2">{formatPercentage(facilityCheck.current_utilization_percentage)}</span>
                                                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                                    <div 
                                                      className={`${getUtilizationColor(facilityCheck.current_utilization_percentage)} h-1.5 rounded-full`}
                                                      style={{ width: `${Math.min(facilityCheck.current_utilization_percentage, 100)}%` }}
                                                    ></div>
                                                  </div>
                                                </div>
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(facilityCheck.net_available_limit)}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(facilityCheck.post_transaction_available)}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatPercentage(facilityCheck.impact_percentage)}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(facilityCheck.status)}`}>
                                                  {facilityCheck.status}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-yellow-600">No facility limits found that exactly match this entity's product type.</p>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex">
                  <ScaleIcon className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">No Limit Check Results</h3>
                    <p className="mt-2 text-sm text-blue-700">
                      Click "Run Limits Check" to assess the transaction's impact on program, country, and entity limits.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Continue to Pricing
          </button>
        </div>
      </div>
    </div>
  );
};

export default LimitsCheckStep; 