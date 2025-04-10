# TSCMF Management Platform - Data Models and APIs

## Data Models

### Entity
Represents clients (financial institutions, obligors, etc.):

```
Entity {
    entity_id: Integer (PK)
    entity_name: String
    entity_address: String
    country: String
    client_type: String
    risk_rating: String
    onboard_date: DateTime
    
    # Relationships
    transactions: relationship to Transaction
    events: relationship to Event
}
```

### Transaction
Represents financial transactions:

```
Transaction {
    created_at: DateTime
    transaction_id: Integer (PK)
    entity_id: Integer (FK to Entity)
    product_id: Integer
    product_name: String
    industry: String
    amount: Float
    currency: String
    country: String
    location: String
    beneficiary: String
    tenor: Integer
    maturity_date: DateTime
    price: Float
    
    # Relationships
    events: relationship to Event
}
```

### Event
Represents events associated with transactions:

```
Event {
    event_id: Integer (PK)
    transaction_id: Integer (FK to Transaction)
    entity_id: Integer (FK to Entity)
    source: String
    source_content: String
    type: String
    created_at: DateTime
    status: String
}
```

## API Endpoints

### Base Endpoints
- `GET /`: Welcome message
- `GET /health`: Health check for the API
- `GET /db-check`: Database connection test

### Event Endpoints
- `GET /api/events`: Retrieves all events with related transaction and entity information
  - Returns detailed information including transaction details and entity information
  - Data is ordered by creation date (newest first)

- `GET /api/events-simple`: Simplified endpoint for testing event retrieval
  - Returns basic event information without detailed transaction or entity data
  - Useful for debugging or performance testing

## Frontend API Integration

The frontend connects to these API endpoints to display:
- Dashboard statistics and charts
- Transaction lists
- Client information
- Event details

The application appears to use mock data when the API is not available by setting the `FORCE_MOCK_DATA` flag to true in various components. 

#### Transaction Details API Response Model

```json
{
  "transaction_id": 10001,
  "entities": [
    {
      "id": 1,
      "type": "Client",
      "name": "Client Entity",
      "address": "123 Trade Avenue, New York, NY 10001",
      "country": "USA"
    },
    {
      "id": 2,
      "type": "Beneficiary",
      "name": "Beneficiary Entity",
      "address": "456 Steel Boulevard, Pittsburgh, PA 15212",
      "country": "USA"
    }
  ],
  "goods": [
    {
      "id": 1,
      "name": "Industrial Machinery",
      "quantity": 15,
      "unit": "units"
    },
    {
      "id": 2,
      "name": "Steel Components",
      "quantity": 250,
      "unit": "tons"
    }
  ]
}
``` 