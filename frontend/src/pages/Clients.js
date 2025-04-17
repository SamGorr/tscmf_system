import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EntityService from '../services/entityService';

const Clients = () => {
  const [entities, setEntities] = useState([]);
  const [entityLimits, setEntityLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: '',
  });
  const [programLimits, setProgramLimits] = useState(null);
  
  const navigate = useNavigate();

  // Get unique countries from entities for filter options
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(entities.map(entity => entity.country).filter(Boolean))];
    return uniqueCountries.sort();
  }, [entities]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [entitiesData, limitsData, programLimitsData] = await Promise.all([
          EntityService.fetchEntities(),
          EntityService.fetchEntityLimits(),
          EntityService.fetchProgramLimits()
        ]);
        
        setEntities(entitiesData);
        setEntityLimits(limitsData);
        setProgramLimits(programLimitsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine entity and limit data
  const entitiesWithLimits = useMemo(() => {
    return entities.map(entity => {
      const entityName = entity.entity_name;
      const limits = entityLimits.filter(limit => limit.entity_name === entityName);
      
      // Calculate total approved limit for this entity
      const totalApprovedLimit = limits.reduce((sum, limit) => sum + (limit.approved_limit || 0), 0);
      
      return {
        ...entity,
        totalApprovedLimit,
        limits
      };
    });
  }, [entities, entityLimits]);

  // Filter and search entities
  const filteredEntities = useMemo(() => {
    return entitiesWithLimits.filter(entity => {
      // Apply text search
      const matchesSearch = searchTerm === '' || 
        (entity.entity_name && entity.entity_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entity.country && entity.country.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply country filter
      const matchesCountry = filters.country === '' || entity.country === filters.country;
      
      return matchesSearch && matchesCountry;
    });
  }, [entitiesWithLimits, searchTerm, filters]);

  const handleViewEntityDetails = (entityName) => {
    navigate(`/clients/${encodeURIComponent(entityName)}`);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
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
          
          {/* Progress bar for utilization */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Utilization</span>
              <span>{programLimits.utilization_percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${Math.min(programLimits.utilization_percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and Filter Controls */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Box */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Search by entity name, country, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Country Filter */}
          <div>
            <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              id="country-filter"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilters({country: ''});
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Entities Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SWIFT
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Approved Limit
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntities.length ? (
              filteredEntities.map((entity) => (
                <tr key={entity.entity_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewEntityDetails(entity.entity_name)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entity.entity_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.swift || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {EntityService.formatCurrency(entity.totalApprovedLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-primary hover:text-primary-dark"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEntityDetails(entity.entity_name);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No entities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients; 