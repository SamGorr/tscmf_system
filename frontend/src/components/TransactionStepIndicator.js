import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CheckIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  ScaleIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BookOpenIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

// Add a style block for custom animations
const customStyles = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    }
    70% {
      box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
  }

  @keyframes scaleIn {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slideRight {
    0% {
      transform: translateX(-20px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .step-pulse {
    animation: pulse 2s infinite;
  }

  .scale-in {
    animation: scaleIn 0.3s ease-out forwards;
  }

  .slide-right {
    animation: slideRight 0.5s ease-out forwards;
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .spin {
    animation: spin 1.5s linear infinite;
  }

  .connecting-line {
    height: 3px;
    background: linear-gradient(to right, #ddd, #ddd);
    position: absolute;
    top: 33%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    z-index: 5;
  }

  .connecting-line-progress {
    height: 3px;
    background: linear-gradient(to right, #3B82F6, #3B82F6);
    position: absolute;
    top: 30%;
    left: 0;
    transform: translateY(-50%);
    z-index: 6;
    transition: width 0.5s ease-in-out;
  }

  .step-circle {
    position: relative;
    z-index: 7;
  }

  .step-circle::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    z-index: 7;
  }
`;

const TransactionStepIndicator = ({ transactionId, currentStep, transaction }) => {
  const location = useLocation();
  
  // Define all steps in the transaction flow with icons
  const steps = [
    { id: 'email-extract', name: 'Email Extract', icon: EnvelopeIcon, path: `/transactions/${transactionId}` },
    { id: 'sanction-check', name: 'Sanction Check', icon: ShieldCheckIcon, path: `/transactions/${transactionId}/sanction-check` },
    { id: 'eligibility-check', name: 'Eligibility Check', icon: ClipboardDocumentCheckIcon, path: `/transactions/${transactionId}/eligibility-check` },
    { id: 'limits-check', name: 'Limits Check', icon: ScaleIcon, path: `/transactions/${transactionId}/limits-check` },
    { id: 'pricing', name: 'Pricing', icon: CalculatorIcon, path: `/transactions/${transactionId}/pricing` },
    { id: 'earmarking', name: 'Earmarking of Limits', icon: CurrencyDollarIcon, path: `/transactions/${transactionId}/earmarking` },
    { id: 'approval', name: 'Approval', icon: UserGroupIcon, path: `/transactions/${transactionId}/approval` },
    { id: 'booking', name: 'Transaction Booking', icon: BookOpenIcon, path: `/transactions/${transactionId}/booking` },
  ];

  // Find the index of the current step
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  // Calculate the progress percentage for the connecting line
  const progressPercentage = currentStepIndex === 0 
    ? 0 
    : Math.min(100, Math.round((currentStepIndex / (steps.length - 1)) * 100));
  
  // Function to determine if a check step is in progress
  const isStepInProgress = (stepId) => {
    if (!transaction) return false;
    
    switch (stepId) {
      case 'sanction-check':
        return transaction.sanction_check_status === 'PROCESSING';
      case 'eligibility-check':
        return transaction.eligibility_check_status === 'PROCESSING';
      case 'limits-check':
        return transaction.limit_check_status === 'PROCESSING';
      case 'pricing':
        return transaction.pricing_status === 'PROCESSING';
      default:
        return false;
    }
  };
  
  // Function to determine if a check step has passed
  const hasStepPassed = (stepId) => {
    if (!transaction) return false;
    
    switch (stepId) {
      case 'sanction-check':
        return transaction.sanction_check_status === 'PASSED';
      case 'eligibility-check':
        return transaction.eligibility_check_status === 'PASSED';
      case 'limits-check':
        return transaction.limit_check_status === 'PASSED';
      case 'pricing':
        return transaction.pricing_status === 'COMPLETED';
      default:
        return false;
    }
  };
  
  // Function to determine if a check step has warnings
  const hasStepWarnings = (stepId) => {
    if (!transaction) return false;
    
    switch (stepId) {
      case 'sanction-check':
        return transaction.sanction_check_status === 'WARNING' || transaction.sanction_check_status === 'FAILED';
      case 'eligibility-check':
        return transaction.eligibility_check_status === 'WARNING' || transaction.eligibility_check_status === 'FAILED';
      case 'limits-check':
        return transaction.limit_check_status === 'WARNING' || transaction.limit_check_status === 'FAILED';
      case 'pricing':
        return transaction.pricing_status === 'WARNING' || transaction.pricing_status === 'FAILED';
      default:
        return false;
    }
  };
  
  return (
    <div className="w-full mb-10 mt-4">
      {/* Add the custom styles */}
      <style>{customStyles}</style>
      
      <div className="relative py-4">
        {/* Background track */}
        <div className="connecting-line" aria-hidden="true"></div>
        
        {/* Progress line */}
        <div 
          className="connecting-line-progress" 
          style={{ width: `${progressPercentage}%` }}
          aria-hidden="true"
        ></div>
        
        {/* Steps */}
        <div className="relative flex justify-between items-start">
          {steps.map((step, index) => {
            // Determine the status of each step
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;
            
            const isInProgress = isStepInProgress(step.id);
            const hasPassed = hasStepPassed(step.id);
            const hasWarnings = hasStepWarnings(step.id);
            
            // Define animation classes
            const stepAnimClass = isCurrent ? 'scale-in step-pulse' : isComplete ? 'fade-in' : '';
            const textAnimClass = isCurrent ? 'slide-right' : '';
            
            // Define circle background color based on status
            let bgColorClass = 'bg-gray-200';
            if (isComplete || hasPassed) bgColorClass = 'bg-green-600';
            else if (isCurrent) bgColorClass = 'bg-blue-500';
            else if (isInProgress) bgColorClass = 'bg-blue-400';
            else if (hasWarnings) bgColorClass = 'bg-yellow-500';
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step circle with icon */}
                <div 
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full step-circle
                    ${bgColorClass} shadow-md
                    transition-all duration-300 ${stepAnimClass}
                    ${(isComplete || isCurrent || isInProgress || hasPassed || hasWarnings) ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                  style={{
                    boxShadow: '0 0 0 4px white',
                  }}
                >
                  <div className={`relative z-20 ${isInProgress ? 'spin' : ''}`}>
                    {isComplete || hasPassed ? (
                      <CheckIcon className="w-6 h-6 text-white" aria-hidden="true" />
                    ) : isInProgress ? (
                      <ArrowPathIcon className="w-5 h-5 text-white" aria-hidden="true" />
                    ) : hasWarnings ? (
                      <ExclamationCircleIcon className="w-5 h-5 text-white" aria-hidden="true" />
                    ) : (
                      <step.icon 
                        className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-gray-500'}`}
                        aria-hidden="true" 
                      />
                    )}
                  </div>
                  
                  {/* Step number absolute positioned above the icon */}
                  <div className={`
                    absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border-2 z-20
                    ${isComplete || hasPassed ? 'border-green-600' : 
                      isCurrent ? 'border-blue-500' : 
                      isInProgress ? 'border-blue-400' :
                      hasWarnings ? 'border-yellow-500' :
                      'border-gray-300'}
                    flex items-center justify-center text-xs font-bold
                    ${isComplete || hasPassed ? 'text-green-600' : 
                      isCurrent ? 'text-blue-500' : 
                      isInProgress ? 'text-blue-400' :
                      hasWarnings ? 'text-yellow-500' :
                      'text-gray-500'}
                  `}>
                    {index + 1}
                  </div>
                </div>
                
                {/* Step label */}
                <div className={`mt-3 ${textAnimClass}`}>
                  <Link 
                    to={(isComplete || isCurrent || isInProgress || hasPassed || hasWarnings) ? step.path : '#'}
                    className={`
                      relative text-sm font-medium px-3 py-1 rounded-full
                      ${isComplete || hasPassed ? 'text-green-700' : 
                        isCurrent ? 'text-white bg-blue-600 shadow-md' : 
                        isInProgress ? 'text-white bg-blue-400 shadow-md' :
                        hasWarnings ? 'text-white bg-yellow-500 shadow-md' :
                        'text-gray-500'}
                      ${(isComplete || isCurrent || isInProgress || hasPassed || hasWarnings) ? 'cursor-pointer' : 
                        'cursor-not-allowed pointer-events-none opacity-70'}
                      transition-all duration-200
                    `}
                  >
                    {step.name}
                  </Link>
                  
                  {/* Static tooltip - always visible on desktop */}
                  <div className="hidden">
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl text-sm whitespace-nowrap">
                      {step.name}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    </div>
                  </div>
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