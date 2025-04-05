# TSCMF Management Platform - Functional Requirements

## Background
The Trade and Supply Chain Finance Program (TSCFP) and Microfinance Program (MFP) aim to make global trade and supply chains inclusive, green, resilient, transparent, and socially responsible. The new TSCMF Management Platform will deliver a fit-for-purpose, integrated solution that can support trade finance, supply chain finance, and microfinance transactions.

## Core Event Types

### Event 1: Inquiry (Request for quote)
- PFIs or Obligors request a quote in advance of a transaction
- The system reserves/earmarks limits for future utilization
- Services involved:
  - Email Extract Service
  - File Extract Service
  - Pricing Service
  - Sanctions Service
  - Eligibility Check Service
  - Limit Management Service
  - RDA Booking Engine
  - Exposure Management Services
  - Transaction validation and approval
  - Transaction processing and document storage

### Event 2: Transaction Request
- Actual transaction request from the client
- Checks for existing inquiry reference number
- Services involved (same as Event 1 with some conditional processing)
- Additional services:
  - Accounting Service
  - Treasury service
  - Document Management Service (DMS)

### Event 3: Transaction Amendment
- Follows similar steps as the transaction request
- Not applicable to all products (e.g., RCF and FRPA)

### Event 4: RDA Process
- Stand-alone selldown for obligor portfolio review
- Prioritizes transactions for selldown based on pre-agreed rules
- Releases ORM limits and replaces with RDA limits

### Event 5: Closure of Transaction
- Closure on expiry/maturity date
- Releases limits, exposure, and RDA facility
- Updates accounting and documentation
- Sends confirmation messages to counterparties

## Products

### Trade Finance
- **Credit Guarantee (CG)**: ADB issues guarantees to Confirming Banks for Issuing Banks
- **Revolving Credit Facility (RCF)**: Direct funding to approved Issuing Banks
- **Unfunded Risk Participation Agreement (URPA)**: Portfolio participation in transactions
- **Funded Risk Participation Agreement (FRPA)**: Similar to URPA but on a funded basis

### Supply Chain
- **Unfunded Risk Participation Agreement (URPA)**: Unfunded participation in supply chain finance transactions
- **Partial Guarantee Facility Agreement (PGFA)**: Tripartite arrangement similar to URPA
- **Funded Risk Participation Agreement (FRPA)**: Funded participation in supply chain finance loans

### Microfinance
- **Unfunded Risk Participation Agreement (URPA)**: Participation in loans to Microfinance Institutions
- **Partial Guarantee Facility Agreement (PGFA)**: Commitment to partially guarantee loans to MFIs

### Risk Distribution
- **Risk Distribution Agreement (RDA)**: Arrangement to sell down obligor risk exposures
- Available for both Trade Finance and Supply Chain businesses
- Can be invoked at transaction level or during portfolio review 