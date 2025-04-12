## Transaction Detail Page Enhancements

### Most Recent Changes (June 2023)

- **Reorganized Layout**: 
  - Moved the Trading Information section above the Pricing Information section for better logical flow
  - Improved the visual hierarchy of information

- **Added Tabbed Interface in Trading Information**:
  - Created two tabs:
    - **Lists of Goods**: Displays the existing goods table with item name, quantity, and unit
    - **Transaction Details**: Shows detailed underlying transaction information from PostgreSQL

- **Underlying Transactions Display**:
  - Added a new section to show all related underlying transactions
  - Implemented data fetching from the backend `/api/transactions/{transaction_id}/underlying` endpoint
  - Created comprehensive transaction cards showing:
    - Reference Information (issuing bank, reference numbers, dates)
    - Financial Details (currency, amount)
    - Applicant Information
    - Beneficiary Information
    - Shipping Details (ports, countries)
    - Goods Information
    - Compliance Flags with visual indicators

- **API and Service Layer Changes**:
  - Added a new backend API endpoint in `main.py` to retrieve underlying transactions
  - Created a corresponding frontend service method in `dashboardService.js` to fetch the data
  - Implemented loading states and error handling

- **Data Cleansing**:
  - Improved the display of the `form_of_eligible_instrument` field by removing everything after "REF" (and its variations)
  - Enhanced regex pattern to handle different cases (REF, Ref, ref)

- **Edit Functionality**:
  - Added Edit button and functionality to the Request Information section, allowing users to update transaction details
  - Implemented state management for editing mode with save and cancel options

### Previous Enhancements 