import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dataUtils';
import TransactionTooltip from './TransactionTooltip';

const TransactionRow = ({ transaction }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <tr 
      className="hover:bg-gray-50"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative">
        <div className="relative">
          {transaction.reference_number}
          {showTooltip && <TransactionTooltip transaction={transaction} />}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.source}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.client_name || transaction.client_id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.type}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Number(transaction.amount).toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.currency}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${transaction.status.includes('Success') || transaction.status.includes('Booked') ? 'bg-green-100 text-green-800' : 
            transaction.status.includes('Pending') ? 'bg-blue-100 text-blue-800' : 
            transaction.status.includes('Failed') || transaction.status.includes('Rejected') ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'}`}>
          {transaction.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(transaction.created_at)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link to={`/transactions/${transaction.id}`} className="text-primary hover:text-primary-dark">View</Link>
      </td>
    </tr>
  );
};

export default TransactionRow; 