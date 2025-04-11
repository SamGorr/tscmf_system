/**
 * Utility functions for data handling and normalization
 */

/**
 * Ensures that goods_list is always in the structured array format
 * @param {Array|String} goodsList - The goods list to normalize
 * @returns {Array} Normalized goods list as array of objects
 */
export const normalizeGoodsList = (goodsList) => {
  // If undefined or null, return empty array
  if (!goodsList) return [];
  
  // If already an array, return as is
  if (Array.isArray(goodsList)) return goodsList;
  
  // If string, convert to array of objects
  if (typeof goodsList === 'string') {
    return goodsList.split('\n')
      .filter(item => item.trim().length > 0)
      .map((item, index) => ({
        id: `good-${index + 1}`,
        name: item.trim(),
        quantity: '',
        unit: ''
      }));
  }
  
  // For any other type, return empty array
  return [];
};

/**
 * Normalizes a transaction object to ensure all fields have consistent formats
 * @param {Object} transaction - The transaction to normalize
 * @returns {Object} Normalized transaction
 */
export const normalizeTransaction = (transaction) => {
  if (!transaction) return null;
  
  // Map face_amount to amount for backwards compatibility
  const amount = transaction.face_amount !== undefined ? transaction.face_amount : 
                (transaction.amount !== undefined ? transaction.amount : null);
  
  // Map expiry_date to maturity_date for backwards compatibility
  const maturityDate = transaction.expiry_date || transaction.maturity_date || null;
  
  // Map form_of_eligible_instrument to product_name for backwards compatibility
  const productName = transaction.form_of_eligible_instrument || transaction.product_name || null;
  
  return {
    ...transaction,
    // Original fields for backward compatibility
    amount: amount, 
    maturity_date: maturityDate,
    product_name: productName,
    
    // Handle entities and goods lists
    entities: transaction.entities || [],
    goods_list: normalizeGoodsList(transaction.goods_list),
    
    // Sanctions checks fields - keep default values
    sanctions_check_passed: transaction.sanctions_check_passed !== undefined ? transaction.sanctions_check_passed : null,
    sanctions_check_details: transaction.sanctions_check_details || [],
    sanctions_check_timestamp: transaction.sanctions_check_timestamp || null,
    eligibility_check_passed: transaction.eligibility_check_passed !== undefined ? transaction.eligibility_check_passed : null,
    limits_check_passed: transaction.limits_check_passed !== undefined ? transaction.limits_check_passed : null,
    exposure_check_passed: transaction.exposure_check_passed !== undefined ? transaction.exposure_check_passed : null
  };
};

/**
 * Formats a goods list to a human-readable string
 * @param {Array|String} goodsList - The goods list to format
 * @returns {String} Formatted string representation
 */
export const formatGoodsList = (goodsList) => {
  if (!goodsList) return 'No goods specified';
  
  // If it's an array of objects (new format)
  if (Array.isArray(goodsList)) {
    if (goodsList.length === 0) return 'No goods specified';
    
    if (goodsList.length === 1) {
      return `${goodsList[0].name} ${goodsList[0].quantity ? `(${goodsList[0].quantity} ${goodsList[0].unit || ''})` : ''}`.trim();
    }
    
    return `${goodsList[0].name} and ${goodsList.length - 1} more item${goodsList.length > 2 ? 's' : ''}`;
  }
  
  // For backwards compatibility with string format
  if (typeof goodsList === 'string') {
    const items = goodsList.split('\n').filter(item => item.trim());
    if (items.length === 0) return 'No goods specified';
    
    if (items.length === 1) return items[0];
    
    return `${items[0]} and ${items.length - 1} more item${items.length > 2 ? 's' : ''}`;
  }
  
  return 'Invalid goods list format';
};

/**
 * Formats currency amount for display
 * @param {Number|String} amount - The amount to format
 * @param {String} currency - The currency code (USD, EUR, etc.)
 * @returns {String} Formatted currency amount
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '-';
  
  // Convert amount to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with appropriate currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

/**
 * Formats a date for display
 * @param {String|Date} date - The date to format
 * @param {Boolean} includeTime - Whether to include time in the format
 * @returns {String} Formatted date string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}; 