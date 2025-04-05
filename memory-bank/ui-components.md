# TSCMF Management Platform - UI Components and Pages

## Overview
The frontend of the TSCMF Management Platform is built with React.js and Tailwind CSS. It provides a modern, responsive user interface for managing trade, supply chain, and microfinance transactions.

## UI Components

### Navigation
The application uses a responsive Navbar component that includes:
- Main navigation links (Dashboard, Clients, Products, Transactions)
- Configuration dropdown menu (Pricing Matrix, Eligibility Check)
- Mobile-responsive design with a collapsible menu

### Data Visualization 
The Dashboard page includes various visualization components:
- Pie charts for status distribution
- Bar charts for transaction volumes
- Area charts for trends over time
- All visualizations use the Recharts library

### Data Tables
Transaction listings and other data are displayed using styled tables with:
- Sortable columns
- Filterable data
- Hover effects
- Status indicators with color coding

### Tooltips
Enhanced tooltips provide detailed information when hovering over items:
- Transaction details
- Status information
- Related entity data

### Forms and Inputs
Various forms for configuration and data entry including:
- Filter forms
- Configuration forms for pricing matrix
- Eligibility criteria settings

## Main Pages

### Dashboard (`Dashboard.js`)
- Overview of system statistics
- Transaction status distribution
- Recent transactions list
- Filter controls
- Performance metrics

### Clients Page (`Clients.js`)
- List of client entities
- Client information (name, country, type, risk rating)
- Links to related transactions

### Products Page (`Products.js`)
- List of financial products
- Product details (name, category, rates)
- Related transaction counts

### Transactions Page (`Transactions.js`)
- List of all transactions
- Filtering and sorting capabilities
- Status indicators
- Links to transaction details

### Transaction Detail Page (`TransactionDetail.js`)
- Comprehensive view of a single transaction
- Related events timeline
- Entity information
- Product details
- Financial details
- Status tracking

### Configuration Pages

#### Pricing Matrix (`PricingMatrix.js`)
- Configuration interface for pricing rules
- Matrix view of pricing based on client type, product, and other factors
- Edit capabilities for pricing rules

#### Eligibility Check Configuration (`EligibilityCheckConfig.js`)
- Rules configuration for transaction eligibility
- Criteria management for different product types
- Testing tools for eligibility rules

#### Sanctions Check Detail (`SanctionsCheckDetail.js`)
- Detailed view of sanctions screening results
- Entity match information
- Risk indicators
- Resolution status

## UI Design Principles
- Clean, modern interface with Tailwind CSS
- Responsive design that works on mobile and desktop
- Consistent color coding for status indicators
- Interactive elements with hover states
- Hierarchical information display with progressive disclosure 