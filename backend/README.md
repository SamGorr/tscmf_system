# TSCMF Backend

This is the backend API for the Trade, Supply Chain, and Microfinance Management Platform (TSCMF).

## Technology Stack

- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Alembic for database migrations
- Docker

## Getting Started

### Using Docker

The easiest way to run the application is using Docker:

```bash
# Start all services
docker-compose up

# Start only the backend and database
docker-compose up backend db
```

### Manual Setup

If you want to run the application manually:

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set environment variables:

```bash
export DATABASE_URL=postgresql://sam:test123@localhost:5432/tscmf_db
```

3. Run database migrations:

```bash
alembic upgrade head
```

4. Start the application:

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 5000
```

## Database Migrations

The project uses Alembic for database migrations:

```bash
# Create a new migration (automatically detecting changes in models)
alembic revision --autogenerate -m "description_of_changes"

# Apply migrations
alembic upgrade head

# Revert to a specific migration
alembic downgrade <revision_id>

# Show migration history
alembic history
```

## API Documentation

When the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

## Project Structure

```
backend/
├── alembic.ini              # Alembic configuration
├── Dockerfile               # Docker configuration
├── entrypoint.sh            # Docker entrypoint script
├── migrations/              # Alembic migrations
├── requirements.txt         # Python dependencies
└── src/                     # Application source code
    ├── database/            # Database connection and session management
    ├── models/              # SQLAlchemy models
    └── main.py              # Main FastAPI application
```

## Data Models

The application includes the following data models:

- Entity
- Transaction
- Event
- TransactionEntity
- Limit
- SanctionCheck
- EligibilityCheck
- LimitsCheck
- ExposureCheck

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/transactions` | GET | Returns a list of all transactions |
| `/api/transactions/{transaction_id}` | GET | Returns details for a single transaction |
| `/api/transactions/{transaction_id}/details` | GET | Returns transaction entity and goods data for a specific transaction |
| `/api/entities` | GET | Returns a list of all entities (clients) |
| `/api/events` | GET | Returns a list of all events with related transaction and entity information |
| `/api/events-simple` | GET | Returns a simplified list of events (for testing) |
| `/api/dashboard/stats` | GET | Returns summary statistics for the dashboard |

## Transaction Relationship Data

The system now supports detailed transaction relationship data through two new tables:

1. **Transaction_Entity**: Links transactions to multiple related entities (client, beneficiary, supplier, etc.)
   - Contains entity type, address, and country information
   - Each transaction can have multiple related entities

2. **Transaction_Goods**: Stores details of goods/items associated with each transaction
   - Includes item name, quantity, and unit information
   - Each transaction can have multiple goods items

### Applying the Transaction Relations Migration

1. To create a migration for the transaction relations tables:
   ```
   python create_migration.py transaction_relations
   ```

2. To apply the migration:
   ```
   alembic upgrade head
   ```

### Populating the Transaction Relations Data

The updated `populate_db.py` script now imports data from:
- `data/transaction_entity.csv` - Contains entity relationships
- `data/transaction_goods.csv` - Contains goods information

To populate all database tables including transaction relations:
```
python populate_db.py
```

### Data Model Structure

The system now uses the following relationships:
- `Transaction` model has one-to-many relationships with `Transaction_Entity` and `Transaction_Goods`
- Each `Transaction_Entity` record represents a specific role an entity plays in a transaction
- Each `Transaction_Goods` record represents a specific item involved in a transaction 