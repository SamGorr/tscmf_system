import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/solid';

const TransactionStepIndicator = ({ transactionId, currentStep }) => {
  const location = useLocation();
  
  // Define all steps in the transaction flow
  const steps = [
    { id: 'email-extract', name: 'Email Extract', path: `/transactions/${transactionId}` },
    { id: 'sanction-check', name: 'Sanction Check', path: `/transactions/${transactionId}/sanction-check` },
    { id: 'eligibility-check', name: 'Eligibility Check', path: `/transactions/${transactionId}/eligibility-check` },
    { id: 'limits-check', name: 'Limits Check', path: `/transactions/${transactionId}/limits-check` },
    { id: 'pricing', name: 'Pricing', path: `/transactions/${transactionId}/pricing` },
    { id: 'earmarking', name: 'Earmarking of Limits', path: `/transactions/${transactionId}/earmarking` },
    { id: 'approval', name: 'Approval', path: `/transactions/${transactionId}/approval` },
    { id: 'booking', name: 'Transaction Booking', path: `/transactions/${transactionId}/booking` },
  ];

  // Find the index of the current step
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className="w-full mb-8">
      <div className="relative">
        {/* Background track */}
        <div className="hidden sm:block absolute inset-0 h-0.5 bg-gray-200 top-1/2 transform -translate-y-1/2 z-0" aria-hidden="true"></div>
        
        {/* Steps */}
        <div className="relative flex justify-between items-center">
          {steps.map((step, index) => {
            // Determine the status of each step
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step circle */}
                <div className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full 
                  ${isComplete ? 'bg-primary' : isCurrent ? 'bg-primary-light border-2 border-primary' : 'bg-gray-200'}
                  transition-colors duration-200 z-10
                `}>
                  {isComplete ? (
                    <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                  ) : (
                    <span className={`text-sm font-medium ${isCurrent ? 'text-primary' : 'text-gray-500'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {/* Step label */}
                <div className="mt-2 text-xs sm:text-sm">
                  <Link 
                    to={isComplete || isCurrent ? step.path : '#'}
                    className={`
                      ${isComplete ? 'text-primary font-medium' : isCurrent ? 'text-primary-dark font-semibold' : 'text-gray-500'}
                      ${isComplete || isCurrent ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none'}
                    `}
                  >
                    {step.name}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransactionStepIndicator; 