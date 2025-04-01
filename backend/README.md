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