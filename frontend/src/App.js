import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import EntityDetail from './pages/EntityDetail';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import PricingMatrix from './pages/PricingMatrix';
import SanctionsCheckDetail from './pages/SanctionsCheckDetail';
import EligibilityCheckConfig from './pages/EligibilityCheckConfig';

// Import transaction step pages
import SanctionCheckStep from './pages/transaction-steps/SanctionCheckStep';
import EligibilityCheckStep from './pages/transaction-steps/EligibilityCheckStep';
import LimitsCheckStep from './pages/transaction-steps/LimitsCheckStep';
import PricingStep from './pages/transaction-steps/PricingStep';
import EarmarkingStep from './pages/transaction-steps/EarmarkingStep';
import ApprovalStep from './pages/transaction-steps/ApprovalStep';
import BookingStep from './pages/transaction-steps/BookingStep';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:entityName" element={<EntityDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/transactions" element={<Transactions />} />
            
            {/* Transaction processing flow routes */}
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/transactions/:id/sanction-check" element={<SanctionCheckStep />} />
            <Route path="/transactions/:id/eligibility-check" element={<EligibilityCheckStep />} />
            <Route path="/transactions/:id/limits-check" element={<LimitsCheckStep />} />
            <Route path="/transactions/:id/pricing" element={<PricingStep />} />
            <Route path="/transactions/:id/earmarking" element={<EarmarkingStep />} />
            <Route path="/transactions/:id/approval" element={<ApprovalStep />} />
            <Route path="/transactions/:id/booking" element={<BookingStep />} />
            
            {/* Transaction checks detail pages */}
            <Route path="/transactions/:id/sanctions-check" element={<SanctionsCheckDetail />} />
            
            {/* Configuration pages */}
            <Route path="/config/pricing-matrix" element={<PricingMatrix />} />
            <Route path="/config/eligibility-check" element={<EligibilityCheckConfig />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 