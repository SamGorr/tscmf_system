import axios from 'axios';

// Entity data service
const EntityService = {
  // Get API URL from environment or default to localhost
  getApiUrl: () => process.env.REACT_APP_API_URL || 'http://localhost:8000',

  // Fetch all entities
  fetchEntities: async () => {
    try {
      const apiUrl = EntityService.getApiUrl();
      const response = await axios.get(`${apiUrl}/api/entities`);
      return response.data;
    } catch (error) {
      console.error('Error fetching entities:', error);
      throw error;
    }
  },

  // Fetch entity limits
  fetchEntityLimits: async () => {
    try {
      const apiUrl = EntityService.getApiUrl();
      const response = await axios.get(`${apiUrl}/api/entity-limits`);
      return response.data;
    } catch (error) {
      console.error('Error fetching entity limits:', error);
      throw error;
    }
  },

  // Fetch entity by name with limits
  fetchEntityByName: async (entityName) => {
    try {
      const apiUrl = EntityService.getApiUrl();
      const response = await axios.get(`${apiUrl}/api/entities/${encodeURIComponent(entityName)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching entity ${entityName}:`, error);
      throw error;
    }
  },

  // Fetch country limits
  fetchCountryLimits: async (country) => {
    try {
      const apiUrl = EntityService.getApiUrl();
      const response = await axios.get(`${apiUrl}/api/country-limits/${encodeURIComponent(country)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching country limits for ${country}:`, error);
      throw error;
    }
  },

  // Fetch program limits
  fetchProgramLimits: async () => {
    try {
      const apiUrl = EntityService.getApiUrl();
      const response = await axios.get(`${apiUrl}/api/program-limits`);
      return response.data;
    } catch (error) {
      console.error('Error fetching program limits:', error);
      throw error;
    }
  },

  // Format currency values for display
  formatCurrency: (value) => {
    if (value === null || value === undefined) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
};

export default EntityService; 