# TSCMF Management Platform - Project Structure

## Project Overview
The Trade, Supply Chain, and Microfinance Management Platform (TSCMF) is a comprehensive system designed to manage financial transactions across various domains including trade finance, supply chain finance, and microfinance. It handles client management, product management, and transaction processing with various event types.

## Architecture
- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python) with SQLAlchemy ORM
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose

## Backend Structure
- **Main Components**:
  - `main.py`: FastAPI application entry point with API endpoint definitions
  - `models/models.py`: SQLAlchemy ORM models (Transaction, Event, Entity)
  - `database/database.py`: Database connection and session management
  - `populate_db.py`: Script to populate the database with sample data

## Database Schema
- **Entity**: Represents clients (financial institutions, obligors, etc.)
  - Fields: entity_id, entity_name, entity_address, country, client_type, risk_rating, onboard_date
  
- **Transaction**: Represents financial transactions
  - Fields: transaction_id, entity_id, product_id, product_name, industry, amount, currency, country, location, beneficiary, tenor, maturity_date, price
  
- **Event**: Represents events associated with transactions
  - Fields: event_id, transaction_id, entity_id, source, source_content, type, created_at, status

## Frontend Structure
- **Main Components**:
  - `App.js`: Main React component with routing
  - `components/Navbar.js`: Navigation component

- **Pages**:
  - `Dashboard.js`: Main dashboard with transaction overview and statistics
  - `Clients.js`: Client management
  - `Products.js`: Product management
  - `Transactions.js`: Transaction listing and management
  - `TransactionDetail.js`: Detailed view of a transaction
  - `SanctionsCheckDetail.js`: Sanctions check details
  - `PricingMatrix.js`: Pricing matrix configuration
  - `EligibilityCheckConfig.js`: Eligibility check configuration

## Docker Configuration
- Multiple containers defined in docker-compose.yml:
  - `backend`: FastAPI backend service
  - `frontend`: React frontend service
  - `db`: PostgreSQL database
  - `pgadmin4`: PostgreSQL admin interface

## Data Flow
The system handles various event types as defined in the functional requirements:
1. Inquiry (Request for quote)
2. Transaction Request
3. Transaction Amendment
4. RDA Process (risk distribution)
5. Transaction Closure

Each event goes through multiple service checks including sanctions screening, eligibility checks, limit management, and exposure management.

## Development Environment
- Development environment is set up with hot-reloading for both frontend and backend
- Sample data is provided for testing and development 