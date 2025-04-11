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
    transaction_id: Integer (PK)
    country: String
    issuing_bank: String (FK to Entity)
    confirming_bank: String (FK to Entity)
    requesting_bank: String (FK to Entity)
    adb_guarantee_trn: String
    confirming_bank_reference_trn: String
    issuing_bank_reference_trn: String
    form_of_eligible_instrument: String
    face_amount: Float
    date_of_issue: DateTime
    expiry_date: DateTime
    terms_of_payment: String
    currency: String
    local_currency_amount: Float
    usd_equivalent_amount: Float
    book_rate: Float
    cover: Float
    local_currency_amount_cover: Float
    usd_equivalent_amount_cover: Float
    sub_limit_type: String
    value_date_of_adb_guarantee: DateTime
    end_of_risk_period: DateTime
    tenor: String
    expiry_date_of_adb_guarantee: DateTime
    tenor_of_adb_guarantee: String
    guarantee_fee_rate: Float
    
    # Relationships
    events: relationship to Event
    transaction_entities: relationship to Transaction_Entity
    transaction_goods: relationship to Transaction_Goods
    issuing_entity: relationship to Entity
    confirming_entity: relationship to Entity
    requesting_entity: relationship to Entity
}
```

### Event
Represents events associated with transactions:

```
Event {
    event_id: Integer (PK)
    transaction_id: Integer (FK to Transaction)
    source: String
    email_from: String
    email_to: String
    email_subject: String
    email_body: String
    email_date: DateTime
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
- `GET /api/events`: Retrieves all events with related transaction information
  - Returns detailed information including transaction details from the updated data model
  - Data is ordered by creation date (newest first)
  - Format:
    ```json
    [
      {
        "event_id": 1,
        "transaction_id": 10001,
        "source": "Email",
        "email_from": "example@bank.com",
        "email_to": "tradefinance@adb.org",
        "email_subject": "Transaction Request",
        "email_date": "2025-03-11T18:10:00",
        "email_body": "",
        "type": "Request",
        "created_at": "2025-03-11T00:00:00",
        "status": "Pending Review",
        "transaction": {
          "transaction_id": 10001,
          "country": "PAKISTAN",
          "issuing_bank": "BANK AL HABIB LIMITED",
          "confirming_bank": "BNP PARIBAS APAC TRADE",
          "requesting_bank": "BNP PARIBAS APAC TRADE",
          "adb_guarantee_trn": "GU2033-017-663",
          "form_of_eligible_instrument": "LETTER OF CREDIT REF NO. 0007LC58671/2025",
          "face_amount": 92000.0,
          "currency": "EUR",
          "usd_equivalent_amount": 100307.57,
          "date_of_issue": "2025-03-07T00:00:00",
          "expiry_date": "2025-04-27T00:00:00",
          "tenor": "34 days"
        }
      }
    ]
    ```

- `GET /api/events-simple`: Simplified endpoint for testing event retrieval
  - Returns basic event information without detailed transaction or entity data
  - Useful for debugging or performance testing

### Dashboard Statistics API
- `GET /api/dashboard/stats`: Retrieves summary statistics for the dashboard based on events data
  - Returns aggregated statistics from events and associated transactions
  - Format:
    ```json
    {
      "clients": 15,
      "products": 8,
      "transactions": {
        "total": 25,
        "approved": 12,
        "processing": 10,
        "declined": 3
      },
      "events": {
        "total": 40,
        "by_status": {
          "Pending Review": 10,
          "Transaction Booked": 12,
          "Transaction Rejected": 3
        },
        "by_type": {
          "Request": 25,
          "Inquiry": 10,
          "Cancellation": 5
        }
      }
    }
    ```

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