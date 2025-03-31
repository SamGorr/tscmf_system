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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        // Try fetching from API first
        const response = await axios.get(`http://localhost:8000/api/transactions/${id}`);
        setTransaction(response.data);
        
        // If there are entities, set the first one as selected
        if (response.data.sanctions_check_details && response.data.sanctions_check_details.length > 0) {
          setSelectedEntity(response.data.sanctions_check_details[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        
        // Fallback to mock data
        console.log('Using mock data for demonstration');
        
        // Try to find the transaction in our mock data
        const foundTransaction = MOCK_TRANSACTION_DATA.find(t => t.id.toString() === id) || 
                                { ...mockTransactionData, id };
        
        // Add mock sanctions check details if they don't exist
        if (!foundTransaction.sanctions_check_details) {
          const entities = foundTransaction.entities || [];
          
          foundTransaction.sanctions_check_details = entities.map(entity => ({
            entity_name: entity.name,
            entity_type: entity.type,
            status: Math.random() > 0.7 ? 'MATCH' : 'CLEAR',
            matches: Math.random() > 0.7 ? [
              {
                list_name: 'OFAC SDN',
                match_score: Math.floor(Math.random() * 20) + 70,
                match_name: entity.name,
                match_id: '12345',
                match_details: {
                  programs: ['UKRAINE-EO13662', 'RUSSIA-EO14024'],
                  nationalities: ['Russia', 'Ukraine'],
                  dob: '1975-03-12',
                  addresses: ['123 Main St, Moscow, Russia']
                }
              },
              {
                list_name: 'EU Consolidated',
                match_score: Math.floor(Math.random() * 20) + 60,
                match_name: entity.name,
                match_id: '54321',
                match_details: {
                  programs: ['EU_RUSSIA', 'EU_UKRAINE'],
                  nationalities: ['Russia'],
                  dob: '1975-03-15',
                  addresses: ['456 Center St, Moscow, Russia']
                }
              }
            ] : [],
            pep_status: Math.random() > 0.8 ? 'PEP' : 'NON-PEP',
            adverse_media: Math.random() > 0.7 ? [
              {
                source: 'Reuters',
                date: '2022-05-15',
                title: 'Company linked to fraud investigation',
                summary: 'The entity was mentioned in connection with an ongoing fraud investigation in Eastern Europe.'
              },
              {
                source: 'Financial Times',
                date: '2021-11-03',
                title: 'Regulatory scrutiny increases for sector',
                summary: 'The sector in which the entity operates is facing increased regulatory scrutiny due to compliance concerns.'
              }
            ] : [],
            risk_score: Math.floor(Math.random() * 100),
            check_timestamp: new Date().toISOString()
          }));
        }
        
        setTransaction(foundTransaction);
        
        // If there are entities, set the first one as selected
        if (foundTransaction.sanctions_check_details && foundTransaction.sanctions_check_details.length > 0) {
          setSelectedEntity(foundTransaction.sanctions_check_details[0]);
        }
        
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [id]);

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
      case 'CLEAR':
        return 'bg-green-100 text-green-800';
      case 'MATCH':
        return 'bg-red-100 text-red-800';
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${getStatusColor(selectedEntity.status)}`}>
                {selectedEntity.status === 'CLEAR' ? 
                  <><CheckCircleIcon className="h-4 w-4 mr-1" />Clear</> : 
                  <><ExclamationCircleIcon className="h-4 w-4 mr-1" />Match Found</>}
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
                    <span className="text-gray-500 text-sm">PEP Status:</span>
                    <span className={selectedEntity.pep_status === 'PEP' ? 'text-yellow-600 font-medium' : 'text-gray-900'}>
                      {selectedEntity.pep_status || 'Not Checked'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Assessment</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Overall Risk Score:</span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          selectedEntity.risk_score < 25 ? 'bg-green-500' :
                          selectedEntity.risk_score < 50 ? 'bg-green-600' :
                          selectedEntity.risk_score < 75 ? 'bg-yellow-500' :
                          selectedEntity.risk_score < 90 ? 'bg-orange-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${selectedEntity.risk_score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">0</span>
                      <span className="text-xs font-medium">{selectedEntity.risk_score}/100</span>
                      <span className="text-xs text-gray-500">100</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-gray-500 text-sm">Risk Level:</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getRiskLevel(selectedEntity.risk_score).color}`}>
                      {getRiskLevel(selectedEntity.risk_score).level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Checked On:</span>
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
                          {match.list_name}
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
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-6 rounded-lg shadow">
            <h2 className="text-red-800 font-medium text-lg mb-2">Error Loading Data</h2>
            <p className="text-red-700">{error || 'Transaction not found'}</p>
            <Link to="/transactions" className="mt-4 inline-flex items-center text-red-600 hover:text-red-800">
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-6 w-6 text-primary mr-2" />
                <div>
                  <h1 className="text-xl font-medium text-gray-900">
                    Sanctions Check - Transaction #{transaction.reference_number}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {transaction.sanctions_check_timestamp 
                      ? `Last checked: ${new Date(transaction.sanctions_check_timestamp).toLocaleString()}`
                      : 'Not checked yet'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link 
                  to={`/transactions/${id}`}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  Back to Transaction
                </Link>
                <button 
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Recheck
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700">Transaction Status:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                  transaction.sanctions_check_passed === true ? 'bg-green-100 text-green-800' : 
                  transaction.sanctions_check_passed === false ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {transaction.sanctions_check_passed === true ? 
                    <><CheckCircleIcon className="h-4 w-4 mr-1" />All Checks Passed</> : 
                    transaction.sanctions_check_passed === false ?
                    <><XCircleIcon className="h-4 w-4 mr-1" />Sanctions Check Failed</> :
                    <><ExclamationCircleIcon className="h-4 w-4 mr-1" />Pending Review</>}
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                <span>Transaction Amount:</span>
                <span className="font-medium ml-1">{transaction.currency} {transaction.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with entities list */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-md font-medium text-gray-800">Entities</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {transaction.sanctions_check_details && transaction.sanctions_check_details.map((entity, index) => (
                  <button
                    key={index}
                    onClick={() => handleEntitySelect(entity)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                      selectedEntity === entity ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-sm ${selectedEntity === entity ? 'font-medium text-blue-700' : 'text-gray-900'}`}>
                          {entity.entity_name || 'Unknown Entity'}
                        </span>
                        <p className="text-xs text-gray-500">{entity.entity_type || 'Unknown Type'}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(entity.status)}`}>
                        {entity.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main content area with tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'summary'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'matches'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Sanctions Matches
                  </button>
                  <button
                    onClick={() => setActiveTab('adverse-media')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'adverse-media'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Adverse Media
                  </button>
                </nav>
              </div>
            </div>
            
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SanctionsCheckDetail; 