import os
import sys
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, inspect

# Add the backend directory to the path so we can import our models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database.database import Base, engine
from src.models.models import (
    Entity, Transaction, Event, TransactionEntity,
    Limit, SanctionCheck, EligibilityCheck,
    LimitsCheck, ExposureCheck
)

# Create database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def parse_datetime(date_str):
    """Parse datetime string to datetime object."""
    if not date_str:
        return datetime.utcnow()
    try:
        return datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return datetime.utcnow()

def check_tables_exist():
    """Check if tables already exist and have data."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    required_tables = [
        'entity', 'transaction', 'event', 'transaction_entity', 
        'entity_limit', 'sanction_check', 'eligibility_check', 
        'limits_check', 'exposure_check'
    ]
    
    # Check if all required tables exist
    missing_tables = [table for table in required_tables if table not in tables]
    if missing_tables:
        print(f"Missing tables: {missing_tables}")
        return False
    
    # Check if entity table has data
    try:
        entity_count = db.query(Entity).count()
        if entity_count > 0:
            print(f"Found {entity_count} entities. Database already has data.")
            return True
    except Exception as e:
        print(f"Error checking entity count: {e}")
        return False
    
    return False

def create_mock_data():
    """Generate and insert mock data into the database."""
    try:
        # Check if tables already exist and have data
        if check_tables_exist():
            print("Database already has data. Skipping mock data creation.")
            return
            
        print("Creating mock data...")

        # Create mock entities
        entities = [
            {
                "entity_name": "Global Traders Inc.",
                "entity_address": "123 Trade Avenue, New York, NY 10001",
                "country": "USA",
                "client_type": "CORPORATE",
                "risk_rating": "A",
                "onboard_date": datetime.utcnow()
            },
            {
                "entity_name": "Eastern Suppliers Ltd.",
                "entity_address": "88 Manufacturing Blvd, Shanghai, China",
                "country": "China",
                "client_type": "CORPORATE",
                "risk_rating": "A-",
                "onboard_date": datetime.utcnow()
            },
            {
                "entity_name": "African Farmers Cooperative",
                "entity_address": "45 Agriculture Road, Nairobi, Kenya",
                "country": "Kenya",
                "client_type": "SME",
                "risk_rating": "B",
                "onboard_date": datetime.utcnow()
            },
            {
                "entity_name": "South American Exporters",
                "entity_address": "237 Export Avenue, São Paulo, Brazil",
                "country": "Brazil",
                "client_type": "CORPORATE",
                "risk_rating": "B+",
                "onboard_date": datetime.utcnow()
            },
            {
                "entity_name": "European Distribution Network",
                "entity_address": "36 Logistics Park, Hamburg, Germany",
                "country": "Germany",
                "client_type": "CORPORATE",
                "risk_rating": "AA",
                "onboard_date": datetime.utcnow()
            },
            {
                "entity_name": "Asian Development Corp",
                "entity_address": "50 Raffles Place, Singapore 048623",
                "country": "Singapore",
                "client_type": "BANK",
                "risk_rating": "AA+",
                "onboard_date": datetime.utcnow()
            },
            {
                "entity_name": "Kenya Commercial Bank",
                "entity_address": "55 Banking Street, Nairobi, Kenya",
                "country": "Kenya",
                "client_type": "BANK",
                "risk_rating": "B+",
                "onboard_date": datetime.utcnow()
            }
        ]

        entity_objects = []
        for entity_data in entities:
            entity = Entity(**entity_data)
            db.add(entity)
            db.flush()  # Flush to get the entity_id
            entity_objects.append(entity)
        
        # Create mock transactions
        transactions = [
            {
                "product_id": 1,
                "created_at": parse_datetime("2023-01-15T10:30:00Z"),
                "amount": 250000,
                "currency": "USD",
                "country": "USA",
                "location": "New York",
                "beneficiary": "Tech Solutions Ltd",
                "product": "Invoice Financing",
                "tenor": 180,
                "price": 5.75,
                "industry": "Technology",
                "list_of_goods": ["Computing Hardware", "Networking Equipment", "Cloud Servers"]
            },
            {
                "product_id": 2,
                "created_at": parse_datetime("2023-01-26T14:45:00Z"),
                "amount": 75000,
                "currency": "EUR",
                "country": "Kenya",
                "location": "Nairobi",
                "beneficiary": "European Gourmet Foods",
                "product": "Warehouse Receipt Financing",
                "tenor": 150,
                "price": 6.25,
                "industry": "Agriculture",
                "list_of_goods": ["Coffee Beans", "Macadamia Nuts", "Avocados"]
            },
            {
                "product_id": 4,
                "created_at": parse_datetime("2023-02-18T09:15:00Z"),
                "amount": 500000,
                "currency": "USD",
                "country": "China",
                "location": "Shanghai",
                "beneficiary": "German Precision Machinery",
                "product": "Import Loan",
                "tenor": 180,
                "price": 7.0,
                "industry": "Manufacturing",
                "list_of_goods": ["Industrial Machinery", "Manufacturing Equipment", "Automation Systems"]
            },
            {
                "product_id": 3,
                "created_at": parse_datetime("2023-02-20T11:00:00Z"),
                "amount": 125000,
                "currency": "GBP",
                "country": "Germany",
                "location": "Hamburg",
                "beneficiary": "NHS Procurement",
                "product": "Export Credit Insurance",
                "tenor": 180,
                "price": 2.5,
                "industry": "Healthcare",
                "list_of_goods": ["Pharmaceuticals", "Medical Equipment", "Laboratory Supplies"]
            },
            {
                "product_id": 5,
                "created_at": parse_datetime("2023-02-28T16:30:00Z"),
                "amount": 350000,
                "currency": "USD",
                "country": "Brazil",
                "location": "São Paulo",
                "beneficiary": "Global Food Distributors",
                "product": "Supply Chain Finance",
                "tenor": 180,
                "price": 5.5,
                "industry": "Agriculture",
                "list_of_goods": ["Soybeans", "Coffee", "Sugar", "Beef"]
            }
        ]

        transaction_objects = []
        for transaction_data in transactions:
            transaction = Transaction(**transaction_data)
            db.add(transaction)
            db.flush()  # Flush to get the transaction_id
            transaction_objects.append(transaction)
        
        # Create mock events
        events = [
            {
                "transaction_id": transaction_objects[0].transaction_id,
                "entity_id": entity_objects[0].entity_id,
                "source": "Email",
                "source_content": "Transaction request for invoice financing",
                "type": "NEW",
                "created_at": parse_datetime("2023-01-15T10:30:00Z"),
                "status": "Transaction Booked"
            },
            {
                "transaction_id": transaction_objects[1].transaction_id,
                "entity_id": entity_objects[2].entity_id,
                "source": "File",
                "source_content": "Inquiry for warehouse receipt financing",
                "type": "NEW",
                "created_at": parse_datetime("2023-01-26T14:45:00Z"),
                "status": "Pending Review"
            },
            {
                "transaction_id": transaction_objects[2].transaction_id,
                "entity_id": entity_objects[1].entity_id,
                "source": "Manual",
                "source_content": "Import loan request",
                "type": "NEW",
                "created_at": parse_datetime("2023-02-18T09:15:00Z"),
                "status": "Viability Check Failed - Limit"
            },
            {
                "transaction_id": transaction_objects[3].transaction_id,
                "entity_id": entity_objects[4].entity_id,
                "source": "Email",
                "source_content": "Export credit insurance request",
                "type": "NEW",
                "created_at": parse_datetime("2023-02-20T11:00:00Z"),
                "status": "Viability Check Successes"
            },
            {
                "transaction_id": transaction_objects[4].transaction_id,
                "entity_id": entity_objects[3].entity_id,
                "source": "File",
                "source_content": "Supply chain finance request",
                "type": "NEW",
                "created_at": parse_datetime("2023-02-28T16:30:00Z"),
                "status": "Transaction Rejected"
            }
        ]

        event_objects = []
        for event_data in events:
            event = Event(**event_data)
            db.add(event)
            db.flush()  # Flush to get the event_id
            event_objects.append(event)
        
        # Create mock transaction entities
        transaction_entities = []
        # For transaction 1
        transaction_entities.extend([
            {
                "transaction_id": transaction_objects[0].transaction_id,
                "type": "Issuing Bank",
                "entity_name": "Global Traders Inc.",
                "entity_address": "123 Trade Avenue, New York, NY 10001",
                "entity_country": "USA"
            },
            {
                "transaction_id": transaction_objects[0].transaction_id,
                "type": "Confirming Bank",
                "entity_name": "Asian Development Corp",
                "entity_address": "50 Raffles Place, Singapore 048623",
                "entity_country": "Singapore"
            },
            {
                "transaction_id": transaction_objects[0].transaction_id,
                "type": "Importer",
                "entity_name": "Tech Solutions Ltd",
                "entity_address": "1-7-1 Konan, Minato-ku, Tokyo, Japan",
                "entity_country": "Japan"
            },
            {
                "transaction_id": transaction_objects[0].transaction_id,
                "type": "Supplier",
                "entity_name": "Global Hardware Supplies",
                "entity_address": "88 Dunhua North Road, Taipei, Taiwan",
                "entity_country": "Taiwan"
            }
        ])

        # For transaction 2
        transaction_entities.extend([
            {
                "transaction_id": transaction_objects[1].transaction_id,
                "type": "Issuing Bank",
                "entity_name": "Kenya Commercial Bank",
                "entity_address": "55 Banking Street, Nairobi, Kenya",
                "entity_country": "Kenya"
            },
            {
                "transaction_id": transaction_objects[1].transaction_id,
                "type": "Importer",
                "entity_name": "European Gourmet Foods",
                "entity_address": "24 Rue de Commerce, Paris, France",
                "entity_country": "France"
            },
            {
                "transaction_id": transaction_objects[1].transaction_id,
                "type": "Supplier",
                "entity_name": "African Farmers Cooperative",
                "entity_address": "45 Agriculture Road, Nairobi, Kenya",
                "entity_country": "Kenya"
            }
        ])

        # Add all transaction entities
        for entity_data in transaction_entities:
            transaction_entity = TransactionEntity(**entity_data)
            db.add(transaction_entity)
        
        # Create mock limits
        limits = [
            {
                "entity_id": entity_objects[0].entity_id,
                "product_id": 1,
                "approved_limit": 5000000,
                "used_limit": 1500000
            },
            {
                "entity_id": entity_objects[1].entity_id,
                "product_id": 1,
                "approved_limit": 4000000,
                "used_limit": 3000000
            },
            {
                "entity_id": entity_objects[2].entity_id,
                "product_id": 1,
                "approved_limit": 1000000,
                "used_limit": 250000
            },
            {
                "entity_id": entity_objects[3].entity_id,
                "product_id": 1,
                "approved_limit": 3000000,
                "used_limit": 2750000
            },
            {
                "entity_id": entity_objects[4].entity_id,
                "product_id": 1,
                "approved_limit": 7500000,
                "used_limit": 2000000
            }
        ]

        # Add all limits
        for limit_data in limits:
            limit = Limit(**limit_data)
            db.add(limit)
        
        # Create mock checks
        # Sanction checks
        for i, event in enumerate(event_objects):
            # Only create checks for some events to simulate different statuses
            if i < 3:
                sanction_check = SanctionCheck(
                    event_id=event.event_id,
                    check_timestamp=event.created_at
                )
                db.add(sanction_check)
            
            # Eligibility checks
            if i < 4:
                eligibility_check = EligibilityCheck(
                    event_id=event.event_id,
                    check_timestamp=event.created_at
                )
                db.add(eligibility_check)
            
            # Limits checks
            if i != 2:  # Simulate one failed limit check
                limits_check = LimitsCheck(
                    event_id=event.event_id,
                    check_timestamp=event.created_at
                )
                db.add(limits_check)
            
            # Exposure checks
            if i != 4:  # Simulate one failed exposure check
                exposure_check = ExposureCheck(
                    event_id=event.event_id,
                    check_timestamp=event.created_at
                )
                db.add(exposure_check)
        
        # Commit all changes to database
        db.commit()
        print("Mock data created successfully!")
    
    except Exception as e:
        db.rollback()
        print(f"Error creating mock data: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_mock_data() 