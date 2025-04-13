import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { mockTransactionData, MOCK_TRANSACTION_DATA } from '../data/mockTransactionData';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  ShieldCheckIcon, 
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  DocumentMagnifyingGlassIcon,
  GlobeAltIcon,
  NewspaperIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowPathIcon,
  FlagIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

const SanctionsCheckDetail = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [sanctionsData, setSanctionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [runningCheck, setRunningCheck] = useState(false);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
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
          
          // If there are entities, set the first one as selected
          if (sanctionsResponse.data && sanctionsResponse.data.length > 0) {
            setSelectedEntity(sanctionsResponse.data[0]);
          }
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

    fetchTransactionDetails();
  }, [id]);

  const runSanctionsCheck = async () => {
    try {
      setRunningCheck(true);
      
      // Get the API URL from environment variable or default to localhost:5000
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Run the sanctions check
      const response = await axios.get(`${apiUrl}/api/transactions/${id}/sanctions-check`);
      setSanctionsData(response.data);
      
      // If there are entities, set the first one as selected
      if (response.data && response.data.length > 0) {
        setSelectedEntity(response.data[0]);
      }
      
      setRunningCheck(false);
    } catch (err) {
      console.error('Error running sanctions check:', err);
      setError(err.message);
      setRunningCheck(false);
    }
  };

  const handleEntitySelect = (entity) => {
    setSelectedEntity(entity);
    setActiveTab('summary');
  };

  const getRiskLevel = (score) => {
    if (score < 25) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (score < 50) return { level: 'Low-Medium', color: 'bg-green-100 text-green-800' };
    if (score < 75) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    if (score < 90) return { level: 'Medium-High', color: 'bg-orange-100 text-orange-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Cleared':
      case 'CLEARED':
        return 'bg-green-100 text-green-800';
      case 'MATCH':
      case 'Reviewed':
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTabContent = () => {
    if (!selectedEntity) return null;

    switch (activeTab) {
      case 'summary':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Sanctions Screening Summary</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${getStatusColor(selectedEntity.match_status)}`}>
                {selectedEntity.match_status === 'Cleared' || selectedEntity.match_status === 'CLEARED' ? 
                  <><CheckCircleIcon className="h-4 w-4 mr-1" />Cleared</> : 
                  <><ExclamationCircleIcon className="h-4 w-4 mr-1" />Review Required</>}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Entity Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Name:</span>
                    <span className="text-gray-900 font-medium">{selectedEntity.entity_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Type:</span>
                    <span className="text-gray-900">{selectedEntity.entity_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Country:</span>
                    <span className="text-gray-900">{selectedEntity.entity_country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Address:</span>
                    <span className="text-gray-900 truncate max-w-[300px]">{selectedEntity.entity_address}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Screening Results</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Status:</span>
                    <span className={`font-medium ${selectedEntity.match_status === 'Cleared' || selectedEntity.match_status === 'CLEARED' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedEntity.match_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Potential Matches:</span>
                    <span className="text-gray-900 font-medium">{selectedEntity.matches ? selectedEntity.matches.length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Check Date:</span>
                    <span className="text-gray-900">
                      {new Date(selectedEntity.check_timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedEntity.matches && selectedEntity.matches.length > 0 ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <ShieldExclamationIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-red-800 font-medium">Sanctions Matches Found</h4>
                    <p className="text-red-700 text-sm mt-1 mb-2">
                      This entity matched against {selectedEntity.matches.length} sanction list entries. Review the details in the Matches tab.
                    </p>
                    <button
                      onClick={() => setActiveTab('matches')}
                      className="text-sm text-red-800 hover:text-red-900 font-medium flex items-center"
                    >
                      View matches <EyeIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-green-800 font-medium">No Sanctions Matches</h4>
                    <p className="text-green-700 text-sm mt-1">
                      This entity didn't match against any global sanctions lists or watchlists.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedEntity.adverse_media && selectedEntity.adverse_media.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <NewspaperIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-yellow-800 font-medium">Adverse Media Found</h4>
                    <p className="text-yellow-700 text-sm mt-1 mb-2">
                      {selectedEntity.adverse_media.length} negative news or adverse media references found for this entity.
                    </p>
                    <button
                      onClick={() => setActiveTab('adverse-media')}
                      className="text-sm text-yellow-800 hover:text-yellow-900 font-medium flex items-center"
                    >
                      View adverse media <EyeIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Review and Decision</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <ScaleIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-gray-700 font-medium">Compliance Decision Required</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  Based on the screening results, a compliance review is needed for this entity.
                  Determine if this entity can proceed with the transaction.
                </p>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Request More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'matches':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Sanctions List Matches</h3>
            
            {selectedEntity.matches && selectedEntity.matches.length > 0 ? (
              <div className="space-y-6">
                {selectedEntity.matches.map((match, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-800">
                          {match.match_name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Match Score:</span>
                          <span className={`text-sm font-medium rounded-full px-2 py-0.5 ${
                            match.match_score > 80 ? 'bg-red-100 text-red-800' :
                            match.match_score > 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {match.match_score}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Match Information</h5>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">Name:</span>
                                <span className="text-gray-900">{match.match_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">ID:</span>
                                <span className="text-gray-900">{match.match_id || 'N/A'}</span>
                              </div>
                              {match.match_details?.programs && (
                                <div>
                                  <span className="text-gray-500 text-sm block mb-1">Programs:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {match.match_details.programs.map((program, i) => (
                                      <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                        {program}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Details</h5>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="space-y-2">
                              {match.match_details?.nationalities && (
                                <div>
                                  <span className="text-gray-500 text-sm block mb-1">Nationalities:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {match.match_details.nationalities.map((nationality, i) => (
                                      <span key={i} className="flex items-center bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                                        <FlagIcon className="h-3 w-3 mr-1" />
                                        {nationality}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {match.match_details?.dob && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500 text-sm">Date of Birth:</span>
                                  <span className="text-gray-900">{match.match_details.dob}</span>
                                </div>
                              )}
                              
                              {match.match_details?.addresses && match.match_details.addresses.length > 0 && (
                                <div>
                                  <span className="text-gray-500 text-sm block mb-1">Addresses:</span>
                                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {match.match_details.addresses.map((address, i) => (
                                      <li key={i}>{address}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button className="text-sm text-primary hover:text-primary-dark flex items-center">
                          <DocumentMagnifyingGlassIcon className="h-4 w-4 mr-1" />
                          View Full Record
                        </button>
                        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h4 className="text-gray-800 font-medium mb-1">No Sanctions Matches Found</h4>
                <p className="text-gray-500 text-sm">
                  This entity was screened against global sanctions lists with no matches detected.
                </p>
              </div>
            )}
          </div>
        );
      
      case 'adverse-media':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Adverse Media Findings</h3>
            
            {selectedEntity.adverse_media && selectedEntity.adverse_media.length > 0 ? (
              <div className="space-y-4">
                {selectedEntity.adverse_media.map((article, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-800">
                          {article.title}
                        </h4>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500">{article.date}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Source: {article.source}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-gray-700 mb-3">{article.summary}</p>
                      
                      <div className="flex justify-end">
                        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                          <GlobeAltIcon className="h-4 w-4 mr-1" />
                          View Original Article
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h4 className="text-gray-800 font-medium mb-1">No Adverse Media Found</h4>
                <p className="text-gray-500 text-sm">
                  No negative news or adverse media mentions were found for this entity.
                </p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-center text-red-500">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <Link to={`/transactions/${id}`} className="text-blue-600 hover:text-blue-800 flex items-center">
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              <span>Back to Transaction</span>
            </Link>
            <h1 className="ml-8 text-2xl font-semibold text-gray-900">Sanctions Check</h1>
          </div>
          <button
            onClick={runSanctionsCheck}
            disabled={runningCheck}
            className={`px-4 py-2 rounded text-white flex items-center ${
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
                Run Check
              </>
            )}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Transaction {id} - Sanctions Screening</h2>
          </div>

          {sanctionsData.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sanctions Check Data</h3>
              <p className="text-gray-500 mb-4">Click the "Run Check" button to perform a sanctions check for this transaction.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4">
              <div className="col-span-1 border-r border-gray-200 bg-gray-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">Entities</h3>
                </div>
                <div className="overflow-y-auto max-h-[70vh]">
                  {sanctionsData.map((entity) => (
                    <div 
                      key={entity.entity_id} 
                      className={`p-4 border-b border-gray-200 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                        selectedEntity && selectedEntity.entity_id === entity.entity_id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleEntitySelect(entity)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{entity.entity_name}</div>
                        <div className="text-sm text-gray-500">{entity.entity_type}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(entity.match_status)}`}>
                        {entity.match_status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-3 p-6">
                {selectedEntity ? (
                  <div>
                    <div className="mb-6 flex justify-between items-center">
                      <h3 className="text-xl font-medium text-gray-900">{selectedEntity.entity_name}</h3>
                      <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedEntity.match_status)}`}>
                        {selectedEntity.match_status === 'Cleared' || selectedEntity.match_status === 'CLEARED' ? (
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            <span>Cleared</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            <span>Review Required</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Entity Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Name:</span>
                            <span className="text-gray-900 font-medium">{selectedEntity.entity_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Type:</span>
                            <span className="text-gray-900">{selectedEntity.entity_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Country:</span>
                            <span className="text-gray-900">{selectedEntity.entity_country}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Address:</span>
                            <span className="text-gray-900 truncate max-w-[300px]">{selectedEntity.entity_address}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Screening Results</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Status:</span>
                            <span className={`font-medium ${selectedEntity.match_status === 'Cleared' || selectedEntity.match_status === 'CLEARED' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {selectedEntity.match_status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Potential Matches:</span>
                            <span className="text-gray-900 font-medium">{selectedEntity.matches ? selectedEntity.matches.length : 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Check Date:</span>
                            <span className="text-gray-900">
                              {new Date(selectedEntity.check_timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedEntity.matches && selectedEntity.matches.length > 0 && (
                      <div className="mt-8">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Potential Matches</h4>
                        <div className="space-y-6">
                          {selectedEntity.matches.map((match, index) => (
                            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-4">
                                <span className="font-medium text-gray-900">{match.match_name}</span>
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                  Match Score: {match.match_score}%
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Entity Information</h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Country:</span>
                                      <span className="text-gray-900">{match.country}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">SWIFT:</span>
                                      <span className="text-gray-900">{match.swift_code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Address:</span>
                                      <span className="text-gray-900 truncate max-w-[200px]">{match.full_address}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Sanctions</h5>
                                  {match.sanctions && match.sanctions.length > 0 ? (
                                    <div className="space-y-2">
                                      {match.sanctions.map((sanction, idx) => (
                                        <div key={idx} className="bg-gray-100 p-2 rounded text-sm">
                                          <div className="text-xs font-medium text-gray-900">{sanction.sanction_regime}</div>
                                          <div className="text-xs text-gray-500">Type: {sanction.sanction_type}</div>
                                          <div className="text-xs text-gray-500">Date: {sanction.effective_date}</div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 italic">No sanctions information available</p>
                                  )}
                                </div>
                              </div>
                              
                              {match.adverse_news && match.adverse_news.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Adverse News</h5>
                                  <div className="space-y-2">
                                    {match.adverse_news.map((news, idx) => (
                                      <div key={idx} className="bg-gray-100 p-2 rounded text-sm">
                                        <div className="text-xs font-medium text-gray-900">{news.news_headline}</div>
                                        <div className="text-xs text-gray-500">
                                          {news.source_publication} | {news.publication_date}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-4 flex justify-end">
                                <button
                                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                  onClick={() => window.open(match.url, '_blank')}
                                >
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Select an entity to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SanctionsCheckDetail; 