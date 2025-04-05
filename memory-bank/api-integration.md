# TSCMF Management Platform - API Integration

## Dashboard API Integration

### Backend API Endpoints Added

Three new API endpoints were added to the backend (`main.py`) to support the Dashboard:

1. **GET /api/entities**
   - Returns a list of all client entities
   - Fields include: entity_id, entity_name, entity_address, country, client_type, risk_rating, onboard_date

2. **GET /api/transactions**
   - Returns a list of all transactions with related entity information
   - Includes formatted transaction data with reference numbers, client information, financial details
   - Orders transactions by creation date (newest first)

3. **GET /api/dashboard/stats**
   - Returns summary statistics for the dashboard
   - Includes counts of clients, products, transactions
   - Transaction statistics organized by status category (approved, processing, declined)
   - Event statistics including counts by status

### Frontend Integration in Dashboard.js

The Dashboard component was updated to fetch data from the backend API:

1. **API Connection**:
   - Changed `FORCE_MOCK_DATA` flag from `true` to `false`
   - Uses environment variable `REACT_APP_API_URL` or defaults to `http://localhost:5000`
   - Makes parallel API requests using `Promise.all` to fetch all required data at once

2. **Data Processing**:
   - Combines data from multiple endpoints to create a complete view
   - Extracts transaction status and type from related events
   - Maps backend data structure to match the expected format for UI components

3. **Error Handling**:
   - Provides error messages for API failures
   - Includes detailed error information in console logs

4. **Data Transformations**:
   - Creates relationship between transactions and events
   - Transforms industry data into goods lists for display
   - Sorts transactions by creation date for recent transactions list

### Data Flow

1. Dashboard component makes three parallel API requests:
   ```javascript
   const [dashboardStatsRes, transactionsRes, eventsRes] = await Promise.all([
     axios.get(`${apiUrl}/api/dashboard/stats`),
     axios.get(`${apiUrl}/api/transactions`),
     axios.get(`${apiUrl}/api/events`)
   ]);
   ```

2. Transforms transaction data by associating events:
   ```javascript
   const transactionsData = transactionsRes.data.map(t => {
     const transactionEvents = eventsRes.data.filter(e => e.transaction_id === t.transaction_id);
     let status = 'Pending Review'; // Default status
     let type = 'Request'; // Default type
     
     // Get status and type from the latest event if available
     if (transactionEvents.length > 0) {
       const latestEvent = transactionEvents.sort((a, b) => 
         new Date(b.created_at) - new Date(a.created_at)
       )[0];
       
       status = latestEvent.status;
       type = latestEvent.type;
     }
     
     return {
       ...t,
       status,
       type,
       source: transactionEvents.length > 0 ? transactionEvents[0].source : 'System',
       goods_list: t.industry ? [t.industry] : [],
     };
   });
   ```

3. Updates state with API data:
   ```javascript
   setStats({
     clients: dashboardStats.clients,
     products: dashboardStats.products,
     transactions: dashboardStats.transactions
   });
   
   setTransactions(transactionsData);
   setFilteredTransactions(transactionsData);
   ```

### Benefits of API Integration

- Real-time data display from the database
- Consistent data format across the application
- Single source of truth for application state
- Better scalability for future features
- Proper separation of concerns between frontend and backend 