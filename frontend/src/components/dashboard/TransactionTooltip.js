import React from 'react';
import { Link } from 'react-router-dom';
import { formatGoodsList, formatDate } from '../../utils/dataUtils';

const TransactionTooltip = ({ transaction }) => {
  return (
    <div className="absolute left-0 top-full mt-1 bg-white shadow-xl rounded-lg p-4 z-50 w-80 text-xs border border-gray-200 transform transition-opacity duration-200 opacity-100">
      {/* Tooltip Arrow */}
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>
      
      {/* Header */}
      <div className="font-medium text-gray-800 text-sm mb-3 pb-2 border-b border-gray-100">
        Transaction Details
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="text-gray-500">Reference:</div>
        <div className="font-medium">{transaction.reference_number}</div>
        
        <div className="text-gray-500">Client:</div>
        <div>{transaction.client_name}</div>
        
        <div className="text-gray-500">Client Type:</div>
        <div>{transaction.client_type || 'Not specified'}</div>
        
        <div className="text-gray-500">Industry:</div>
        <div>{transaction.industry || 'Not specified'}</div>
        
        <div className="text-gray-500">Amount:</div>
        <div className="font-medium">{Number(transaction.amount).toLocaleString()}</div>
        
        <div className="text-gray-500">Currency:</div>
        <div className="font-medium">{transaction.currency}</div>
        
        <div className="text-gray-500">Product:</div>
        <div>{transaction.product_name || 'Not specified'}</div>
        
        <div className="text-gray-500">Goods:</div>
        <div>{formatGoodsList(transaction.goods_list)}</div>
        
        <div className="text-gray-500">Status:</div>
        <div>
          <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full 
            ${transaction.status.includes('Success') || transaction.status.includes('Booked') ? 'bg-green-100 text-green-800' : 
              transaction.status.includes('Pending') ? 'bg-blue-100 text-blue-800' : 
              transaction.status.includes('Failed') || transaction.status.includes('Rejected') ? 'bg-red-100 text-red-800' : 
              'bg-gray-100 text-gray-800'}`}>
            {transaction.status}
          </span>
        </div>
        
        <div className="text-gray-500">Created:</div>
        <div>{formatDate(transaction.created_at, true)}</div>
      </div>
      
      {/* View Details Link */}
      <div className="mt-3 pt-2 border-t border-gray-100 text-right">
        <Link to={`/transactions/${transaction.id}`} className="text-primary hover:text-primary-dark text-xs font-medium">
          View Full Details →
        </Link>
      </div>
    </div>
  );
};

export default TransactionTooltip; 