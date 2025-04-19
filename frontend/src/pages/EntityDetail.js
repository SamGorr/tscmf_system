import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EntityService from '../services/entityService';

// Helper function to determine progress bar color based on utilization percentage
const getUtilizationColor = (percentage) => {
  if (percentage < 50) return 'bg-green-500'; // Green for low utilization
  if (percentage < 85) return 'bg-amber-500'; // Amber/Yellow for moderate utilization
  return 'bg-red-500'; // Red for high utilization
};

const EntityDetail = () => {
  const { entityName } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState(null);
  const [countryLimits, setCountryLimits] = useState(null);
  const [programLimits, setProgramLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [entityData, programLimitsData] = await Promise.all([
          EntityService.fetchEntityByName(entityName),
          EntityService.fetchProgramLimits()
        ]);
        
        // Fetch country limits if entity has country
        if (entityData.country) {
          const countryLimitsData = await EntityService.fetchCountryLimits(entityData.country);
          setCountryLimits(countryLimitsData);
        }
        
        setEntity(entityData);
        setProgramLimits(programLimitsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching entity data:', err);
        setError('Failed to load entity data');
        setLoading(false);
      }
    };

    if (entityName) {
      fetchData();
    }
  }, [entityName]);

  // Group limits by type
  const limitsByType = useMemo(() => {
    if (!entity || !entity.limits) return {};
    
    const grouped = {};
    
    entity.limits.forEach(limit => {
      const type = limit.type || 'Unspecified';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(limit);
    });
    
    return grouped;
  }, [entity]);

  // Calculate subtotals for each group
  const groupSubtotals = useMemo(() => {
    const subtotals = {};
    
    Object.keys(limitsByType).forEach(type => {
      const limits = limitsByType[type];
      
      subtotals[type] = {
        approvedLimit: limits.reduce((sum, limit) => sum + (limit.approved_limit || 0), 0),
        pfiRpaAllocation: limits.reduce((sum, limit) => sum + (limit.pfi_rpa_allocation || 0), 0),
        outstandingExposure: limits.reduce((sum, limit) => sum + (limit.outstanding_exposure || 0), 0),
        earmarkLimit: limits.reduce((sum, limit) => sum + (limit.earmark_limit || 0), 0),
      };
      
      // Calculate available and net available limits
      subtotals[type].availableLimit = 
        subtotals[type].approvedLimit - 
        subtotals[type].pfiRpaAllocation - 
        subtotals[type].outstandingExposure;
      
      subtotals[type].netAvailableLimit = 
        subtotals[type].availableLimit - 
        subtotals[type].earmarkLimit;
    });
    
    return subtotals;
  }, [limitsByType]);

  // Calculate entity total across all facility types
  const entityTotal = useMemo(() => {
    if (!entity || !entity.limits) return null;
    
    const total = {
      approvedLimit: entity.limits.reduce((sum, limit) => sum + (limit.approved_limit || 0), 0),
      pfiRpaAllocation: entity.limits.reduce((sum, limit) => sum + (limit.pfi_rpa_allocation || 0), 0),
      outstandingExposure: entity.limits.reduce((sum, limit) => sum + (limit.outstanding_exposure || 0), 0),
      earmarkLimit: entity.limits.reduce((sum, limit) => sum + (limit.earmark_limit || 0), 0),
    };
    
    total.availableLimit = 
      total.approvedLimit - 
      total.pfiRpaAllocation - 
      total.outstandingExposure;
    
    total.netAvailableLimit = 
      total.availableLimit - 
      total.earmarkLimit;
    
    return total;
  }, [entity]);

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

  if (!entity) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-yellow-800">Entity not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation and Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Clients
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{entity.entity_name}</h1>
      </div>

      {/* Entity Information Card */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Entity Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Entity ID</p>
            <p className="font-medium">{entity.entity_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Country</p>
            <p className="font-medium">{entity.country || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SWIFT</p>
            <p className="font-medium">{entity.swift || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Signing Office/Branch</p>
            <p className="font-medium">{entity.signing_office_branch || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Agreement Date</p>
            <p className="font-medium">
              {entity.agreement_date 
                ? new Date(entity.agreement_date).toLocaleDateString() 
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{entity.entity_address || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Program Limit Utilization */}
      {programLimits && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Program Limit Utilization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Total Program Approved Limit</p>
              <p className="text-xl font-bold text-primary">{EntityService.formatCurrency(programLimits.total_program_approved_limit)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Total Utilized</p>
              <p className="text-xl font-bold text-primary">{EntityService.formatCurrency(programLimits.total_utilized)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Available Program Limit</p>
              <p className="text-xl font-bold text-primary">{EntityService.formatCurrency(programLimits.available_program_limit)}</p>
            </div>
          </div>
          
          {/* Color-coded progress bar for utilization */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Program Utilization</span>
              <span>{programLimits.utilization_percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`${getUtilizationColor(programLimits.utilization_percentage)} h-2.5 rounded-full`}
                style={{ width: `${Math.min(programLimits.utilization_percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Country Limit Utilization */}
      {countryLimits && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Country Limit Utilization - {countryLimits.country}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Total Country Approved Limit</p>
              <p className="text-xl font-bold text-primary">{EntityService.formatCurrency(countryLimits.total_country_approved_limit)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Total Utilized</p>
              <p className="text-xl font-bold text-primary">{EntityService.formatCurrency(countryLimits.total_utilized)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Available Country Limit</p>
              <p className="text-xl font-bold text-primary">{EntityService.formatCurrency(countryLimits.available_country_limit)}</p>
            </div>
          </div>
          
          {/* Color-coded progress bar for utilization */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Country Utilization</span>
              <span>{countryLimits.utilization_percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`${getUtilizationColor(countryLimits.utilization_percentage)} h-2.5 rounded-full`}
                style={{ width: `${Math.min(countryLimits.utilization_percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Entity Utilization (if entity has limits) */}
      {entityTotal && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Entity Limit Utilization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Total Entity Approved Limit</p>
              <p className="text-xl font-bold text-primary">{EntityService.formatCurrency(entityTotal.approvedLimit)}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Total Utilized</p>
              <p className="text-xl font-bold text-primary">
                {EntityService.formatCurrency(entityTotal.approvedLimit - entityTotal.availableLimit)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500">Available Entity Limit</p>
              <p className="text-xl font-bold text-primary">{EntityService.formatCurrency(entityTotal.availableLimit)}</p>
            </div>
          </div>
          
          {/* Color-coded progress bar for utilization */}
          {entityTotal.approvedLimit > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Entity Utilization</span>
                {/* Calculate entity utilization percentage */}
                {(() => {
                  const utilizedAmount = entityTotal.approvedLimit - entityTotal.availableLimit;
                  const utilizationPercentage = (utilizedAmount / entityTotal.approvedLimit) * 100;
                  return <span>{utilizationPercentage.toFixed(1)}%</span>;
                })()}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                {(() => {
                  const utilizedAmount = entityTotal.approvedLimit - entityTotal.availableLimit;
                  const utilizationPercentage = (utilizedAmount / entityTotal.approvedLimit) * 100;
                  return (
                    <div 
                      className={`${getUtilizationColor(utilizationPercentage)} h-2.5 rounded-full`}
                      style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                    ></div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Facility Limits Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Facility Limits</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility Limit
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved Limit
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Tenor
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PFI RPA Allocation
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outstanding Exposure
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earmark Limit
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Limit
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Available Limit
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Group headers and rows */}
              {Object.keys(limitsByType).map(type => (
                <React.Fragment key={type}>
                  {/* Group header */}
                  <tr className="bg-gray-100">
                    <td colSpan="9" className="px-4 py-2 font-medium">
                      {type} Facilities
                    </td>
                  </tr>
                  
                  {/* Limits in this group */}
                  {limitsByType[type].map(limit => {
                    // Calculate utilization percentage for this facility
                    const utilizedAmount = limit.pfi_rpa_allocation + limit.outstanding_exposure;
                    const utilizationPercentage = limit.approved_limit > 0 
                      ? (utilizedAmount / limit.approved_limit) * 100 
                      : 0;
                    
                    return (
                      <tr key={limit.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {limit.facility_limit}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                          {EntityService.formatCurrency(limit.approved_limit)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {limit.max_tenor_of_adb_guarantee || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                          {EntityService.formatCurrency(limit.pfi_rpa_allocation)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                          {EntityService.formatCurrency(limit.outstanding_exposure)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                          {EntityService.formatCurrency(limit.earmark_limit)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                          {EntityService.formatCurrency(limit.available_limit)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                          {EntityService.formatCurrency(limit.net_available_limit)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getUtilizationColor(utilizationPercentage)} h-2 rounded-full`}
                              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">{utilizationPercentage.toFixed(1)}%</span>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Group subtotal */}
                  <tr className="bg-gray-50 border-t border-gray-300">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      {type} Subtotal
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right">
                      {EntityService.formatCurrency(groupSubtotals[type].approvedLimit)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      -
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right">
                      {EntityService.formatCurrency(groupSubtotals[type].pfiRpaAllocation)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right">
                      {EntityService.formatCurrency(groupSubtotals[type].outstandingExposure)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right">
                      {EntityService.formatCurrency(groupSubtotals[type].earmarkLimit)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right">
                      {EntityService.formatCurrency(groupSubtotals[type].availableLimit)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-right">
                      {EntityService.formatCurrency(groupSubtotals[type].netAvailableLimit)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      {(() => {
                        const subtotal = groupSubtotals[type];
                        const utilizedAmount = subtotal.pfiRpaAllocation + subtotal.outstandingExposure;
                        const utilizationPercentage = subtotal.approvedLimit > 0 
                          ? (utilizedAmount / subtotal.approvedLimit) * 100
                          : 0;
                        
                        return (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${getUtilizationColor(utilizationPercentage)} h-2 rounded-full`}
                                style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs mt-1">{utilizationPercentage.toFixed(1)}%</span>
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              
              {/* Overall total row */}
              {entityTotal && (
                <tr className="bg-gray-200 font-semibold border-t-2 border-gray-400">
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Total
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {EntityService.formatCurrency(entityTotal.approvedLimit)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    -
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {EntityService.formatCurrency(entityTotal.pfiRpaAllocation)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {EntityService.formatCurrency(entityTotal.outstandingExposure)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {EntityService.formatCurrency(entityTotal.earmarkLimit)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {EntityService.formatCurrency(entityTotal.availableLimit)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {EntityService.formatCurrency(entityTotal.netAvailableLimit)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {(() => {
                      const utilizedAmount = entityTotal.pfiRpaAllocation + entityTotal.outstandingExposure;
                      const utilizationPercentage = entityTotal.approvedLimit > 0 
                        ? (utilizedAmount / entityTotal.approvedLimit) * 100
                        : 0;
                      
                      return (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getUtilizationColor(utilizationPercentage)} h-2 rounded-full`}
                              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs mt-1">{utilizationPercentage.toFixed(1)}%</span>
                        </>
                      );
                    })()}
                  </td>
                </tr>
              )}
              
              {/* Show message if no limits */}
              {entity.limits.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-4 py-4 text-center text-sm text-gray-500">
                    No facility limits found for this entity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EntityDetail; 