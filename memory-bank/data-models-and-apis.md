# TSCMF Management Platform - Data Models and APIs

## Data Models

### Entity
Represents clients (financial institutions, obligors, etc.):

```
Entity {
    entity_id: Integer (unique=true, nullable=false)
    entity_name: String (primary key)
    entity_address: String
    country: String
    client_type: String
    risk_rating: String
    onboard_date: DateTime
    
    # Relationships
    transactions: relationship to Transaction
    events: relationship to Event
    entity_limits: relationship to EntityLimit
}
```

### EntityLimit
Represents facility limits associated with an entity:

```
EntityLimit {
    id: Integer (PK)
    entity_name: String (FK to Entity.entity_name)
    facility_limit: String
    approved_limit: Float
    max_tenor_of_adb_guarantee: String
    type: String
    pfi_rpa_allocation: Float
    outstanding_exposure: Float
    earmark_limit: Float
    
    # Relationships
    entity: relationship to Entity
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

### Transaction_Entity

The Transaction_Entity model represents the entities associated with a transaction, such as issuers, beneficiaries, etc.

| Field         | Type    | Description                            |
|---------------|---------|----------------------------------------|
| id            | Integer | Primary key                            |
| transaction_id| Integer | Foreign key to Transaction             |
| name          | String  | Name of the entity                     |
| type          | String  | Type of entity (issuer, beneficiary, etc.) |
| address       | String  | Address of the entity                  |
| country       | String  | Country of the entity                  |

**API Operations:**
- Create: POST `/api/transactions/{transaction_id}/entities`
- Read: GET `/api/transactions/{transaction_id}/details` (returns all entities for a transaction)
- Update: PUT `/api/transactions/{transaction_id}/entities/{entity_id}`
- Delete: DELETE `/api/transactions/{transaction_id}/entities/{entity_id}`
- Batch Update: PUT `/api/transactions/{transaction_id}/entities` (includes all entities in the request)

**Relationships:**
- Many-to-one relationship with Transaction (a transaction can have multiple entities)

### Transaction_Goods

The Transaction_Goods model represents the goods associated with a transaction.

| Field | Type | Description |
| ----- | ---- | ----------- |
| id | Integer | Primary key |
| transaction_id | Integer | Foreign key to Transaction table |
| item_name | String | Name of the goods |
| quantity | Integer | Quantity of goods |
| unit | String | Unit of measurement (e.g., pcs, kg) |
| goods_classification | String | Classification of goods (e.g., Electronics, Raw Materials) |
| price | String | Price of goods |

**API Operations:**
- Create: POST `/api/transactions/{transaction_id}/goods`
- Read: GET `/api/transactions/{transaction_id}/details` (returns all goods for a transaction)
- Update: PUT `/api/transactions/{transaction_id}/goods/{good_id}`
- Delete: DELETE `/api/transactions/{transaction_id}/goods/{good_id}`
- Batch Update: PUT `/api/transactions/{transaction_id}/trading` (includes goods in the request)

**Relationships:**
- Many-to-one relationship with Transaction (a transaction can have multiple goods)

### Underlying_Transaction

The Underlying_Transaction model represents underlying transactions associated with a main transaction.

| Field                              | Type    | Description                                 |
|------------------------------------|---------|---------------------------------------------|
| id                                 | Integer | Primary key                                 |
| transaction_id                     | Integer | Foreign key to Transaction                  |
| issuing_bank                       | String  | Name of the issuing bank                    |
| sequence_no                        | Integer | Sequence number                             |
| transaction_ref_no                 | String  | Transaction reference number                |
| issue_date                         | DateTime| Issue date                                  |
| maturity_date                      | DateTime| Maturity date                               |
| currency                           | String  | Currency                                    |
| amount_in_local_currency           | String  | Amount in local currency                    |
| applicant_name                     | String  | Name of the applicant                       |
| applicant_address                  | String  | Address of the applicant                    |
| applicant_country                  | String  | Country of the applicant                    |
| beneficiary_name                   | String  | Name of the beneficiary                     |
| beneficiary_address                | String  | Address of the beneficiary                  |
| beneficiary_country                | String  | Country of the beneficiary                  |
| loading_port                       | String  | Loading port                                |
| discharging_port                   | String  | Discharging port                            |
| country_of_origin                  | String  | Country of origin                           |
| country_of_final_destination       | String  | Country of final destination                |
| goods                              | String  | Description of goods                        |
| goods_classification               | String  | Classification of goods                     |
| goods_eligible                     | String  | Whether goods are eligible                  |
| es_classification                  | String  | ES classification                           |
| capital_goods                      | Boolean | Whether goods are capital goods             |
| ee_replacement_of_an_old_equipment | Boolean | Whether goods are replacement equipment     |
| sustainable_goods                  | Boolean | Whether goods are sustainable               |

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

### Transaction Endpoints
- `GET /api/transactions`: Retrieves all transactions
- `GET /api/transactions/{transaction_id}`: Retrieves a single transaction by ID with related event information
  - Returns detailed transaction information from the updated data model
  - Format:
    ```json
    {
      "id": 10001,
      "transaction_id": 10001,
      "country": "PAKISTAN",
      "issuing_bank": "BANK AL HABIB LIMITED",
      "confirming_bank": "BNP PARIBAS APAC TRADE",
      "requesting_bank": "BNP PARIBAS APAC TRADE",
      "adb_guarantee_trn": "GU2033-017-663",
      "confirming_bank_reference_trn": "R799180339102574",
      "issuing_bank_reference_trn": "0007LC58671/2025",
      "form_of_eligible_instrument": "LETTER OF CREDIT REF NO. 0007LC58671/2025",
      "face_amount": 92000.0,
      "date_of_issue": "2025-03-07T00:00:00",
      "expiry_date": "2025-04-27T00:00:00",
      "terms_of_payment": "BY NEGOTIATION SIGHT",
      "currency": "EUR",
      "local_currency_amount": 92000.0,
      "usd_equivalent_amount": 100307.57,
      "book_rate": 0.92,
      "cover": 1.0,
      "local_currency_amount_cover": 92000.0,
      "usd_equivalent_amount_cover": 100307.57,
      "sub_limit_type": "CG",
      "value_date_of_adb_guarantee": "2025-03-24T00:00:00",
      "end_of_risk_period": "2025-04-27T00:00:00",
      "tenor": "34 days",
      "expiry_date_of_adb_guarantee": "2025-05-12T00:00:00",
      "tenor_of_adb_guarantee": "49 days",
      "guarantee_fee_rate": 0.03,
      "reference_number": "GU2033-017-663",
      "client_name": "BANK AL HABIB LIMITED",
      "client_country": "PAKISTAN",
      "status": "Pending Review",
      "type": "Request",
      "source": "Email",
      "events": [
        {
          "event_id": 1,
          "transaction_id": 10001,
          "source": "Email",
          "email_from": "bank@example.com",
          "email_to": "tradefinance@adb.org",
          "email_subject": "Transaction Request",
          "email_date": "2025-03-11T18:10:00",
          "type": "Request",
          "created_at": "2025-03-11T00:00:00",
          "status": "Pending Review"
        }
      ],
      "entities": [
        {
          "id": "1",
          "type": "Issuing Bank",
          "name": "BANK AL HABIB LIMITED",
          "country": "PAKISTAN",
          "address": ""
        },
        {
          "id": "2",
          "type": "Confirming Bank",
          "name": "BNP PARIBAS APAC TRADE",
          "country": "PAKISTAN",
          "address": ""
        }
      ]
    }
    ```

- `GET /api/transactions/{transaction_id}/details`: Retrieves transaction entity and goods information
  - Returns entities and goods related to the transaction
  - Can generate derived data from transaction fields when dedicated entries don't exist
  - Format:
    ```json
    {
      "transaction_id": 10001,
      "entities": [
        {
          "id": 1,
          "type": "Issuing Bank",
          "name": "BANK AL HABIB LIMITED",
          "country": "PAKISTAN",
          "address": ""
        },
        {
          "id": 2,
          "type": "Confirming Bank",
          "name": "BNP PARIBAS APAC TRADE",
          "country": "PAKISTAN",
          "address": ""
        }
      ],
      "goods": [
        {
          "id": 1,
          "name": "LETTER OF CREDIT REF NO. 0007LC58671/2025",
          "quantity": 1,
          "unit": "item"
        }
      ]
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