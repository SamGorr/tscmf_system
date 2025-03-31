import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import PricingMatrix from './pages/PricingMatrix';
import SanctionsCheckDetail from './pages/SanctionsCheckDetail';
import EligibilityCheckConfig from './pages/EligibilityCheckConfig';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/products" element={<Products />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/sanctions-check/:id" element={<SanctionsCheckDetail />} />
            <Route path="/config/pricing-matrix" element={<PricingMatrix />} />
            <Route path="/config/eligibility-check" element={<EligibilityCheckConfig />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 