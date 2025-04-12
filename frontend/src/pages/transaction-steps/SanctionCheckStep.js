import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionStepIndicator from '../../components/TransactionStepIndicator';

const SanctionCheckStep = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const handleContinue = () => {
    navigate(`/transactions/${id}/eligibility-check`);
  };
  
  const handleBack = () => {
    navigate(`/transactions/${id}`);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaction Processing</h1>
        <button 
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Email Extract
        </button>
      </div>
      
      <TransactionStepIndicator transactionId={id} currentStep="sanction-check" />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sanction Check</h2>
        <p className="text-gray-600 mb-8">This is a placeholder for the Sanction Check step implementation.</p>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Continue to Eligibility Check
          </button>
        </div>
      </div>
    </div>
  );
};

export default SanctionCheckStep; 