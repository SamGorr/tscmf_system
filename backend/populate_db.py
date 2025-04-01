import os
import sys
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text

# Add the backend directory to the path so we can import our models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database.database import engine

def populate_database():
    """Populate the database with mock data using direct SQL."""
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        print("Creating mock data...")

        # Drop existing data
        print("Clearing existing data...")
        session.execute(text("TRUNCATE entity, transaction, event, transaction_entity, eligibility_check, exposure_check, limits_check, sanction_check CASCADE"))
        
        # Create entities
        print("Creating entities...")
        entities = [
            (1, "Global Traders Inc.", "123 Trade Avenue, New York, NY 10001", "USA", "CORPORATE", "A", datetime.utcnow()),
            (2, "Eastern Suppliers Ltd.", "88 Manufacturing Blvd, Shanghai, China", "China", "CORPORATE", "A-", datetime.utcnow()),
            (3, "African Farmers Cooperative", "45 Agriculture Road, Nairobi, Kenya", "Kenya", "SME", "B", datetime.utcnow()),
            (4, "South American Exporters", "237 Export Avenue, São Paulo, Brazil", "Brazil", "CORPORATE", "B+", datetime.utcnow()),
            (5, "European Distribution Network", "36 Logistics Park, Hamburg, Germany", "Germany", "CORPORATE", "AA", datetime.utcnow()),
            (6, "Asian Development Corp", "50 Raffles Place, Singapore 048623", "Singapore", "BANK", "AA+", datetime.utcnow()),
            (7, "Kenya Commercial Bank", "55 Banking Street, Nairobi, Kenya", "Kenya", "BANK", "B+", datetime.utcnow())
        ]
        
        for entity in entities:
            session.execute(text("""
                INSERT INTO entity (entity_id, entity_name, entity_address, country, client_type, risk_rating, onboard_date)
                VALUES (:entity_id, :entity_name, :entity_address, :country, :client_type, :risk_rating, :onboard_date)
            """), {
                "entity_id": entity[0],
                "entity_name": entity[1],
                "entity_address": entity[2],
                "country": entity[3],
                "client_type": entity[4],
                "risk_rating": entity[5],
                "onboard_date": entity[6]
            })
        
        # Create transactions
        print("Creating transactions...")
        transactions = [
            (1, 1, datetime.strptime("2023-01-15T10:30:00Z", "%Y-%m-%dT%H:%M:%SZ"), 250000, "USD", "USA", "New York", 
             "Tech Solutions Ltd", "Invoice Financing", 180, 5.75, "Technology", 
             "{Computing Hardware,Networking Equipment,Cloud Servers}"),
            
            (2, 2, datetime.strptime("2023-01-26T14:45:00Z", "%Y-%m-%dT%H:%M:%SZ"), 75000, "EUR", "Kenya", "Nairobi", 
             "European Gourmet Foods", "Warehouse Receipt Financing", 150, 6.25, "Agriculture", 
             "{Coffee Beans,Macadamia Nuts,Avocados}"),
            
            (3, 4, datetime.strptime("2023-02-18T09:15:00Z", "%Y-%m-%dT%H:%M:%SZ"), 500000, "USD", "China", "Shanghai", 
             "German Precision Machinery", "Import Loan", 180, 7.0, "Manufacturing", 
             "{Industrial Machinery,Manufacturing Equipment,Automation Systems}"),
            
            (4, 3, datetime.strptime("2023-02-20T11:00:00Z", "%Y-%m-%dT%H:%M:%SZ"), 125000, "GBP", "Germany", "Hamburg", 
             "NHS Procurement", "Export Credit Insurance", 180, 2.5, "Healthcare", 
             "{Pharmaceuticals,Medical Equipment,Laboratory Supplies}"),
            
            (5, 5, datetime.strptime("2023-02-28T16:30:00Z", "%Y-%m-%dT%H:%M:%SZ"), 350000, "USD", "Brazil", "São Paulo", 
             "Global Food Distributors", "Supply Chain Finance", 180, 5.5, "Agriculture", 
             "{Soybeans,Coffee,Sugar,Beef}")
        ]
        
        for tx in transactions:
            session.execute(text("""
                INSERT INTO transaction (transaction_id, product_id, created_at, amount, currency, country, location, 
                                        beneficiary, product, tenor, price, industry, list_of_goods)
                VALUES (:transaction_id, :product_id, :created_at, :amount, :currency, :country, :location, 
                       :beneficiary, :product, :tenor, :price, :industry, :list_of_goods)
            """), {
                "transaction_id": tx[0],
                "product_id": tx[1],
                "created_at": tx[2],
                "amount": tx[3],
                "currency": tx[4],
                "country": tx[5],
                "location": tx[6],
                "beneficiary": tx[7],
                "product": tx[8],
                "tenor": tx[9],
                "price": tx[10],
                "industry": tx[11],
                "list_of_goods": tx[12]
            })
        
        # Create events
        print("Creating events...")
        events = [
            (1, 1, 1, "Email", "Transaction request for invoice financing", "NEW", 
             datetime.strptime("2023-01-15T10:30:00Z", "%Y-%m-%dT%H:%M:%SZ"), "Transaction Booked"),
            
            (2, 2, 3, "File", "Inquiry for warehouse receipt financing", "NEW", 
             datetime.strptime("2023-01-26T14:45:00Z", "%Y-%m-%dT%H:%M:%SZ"), "Pending Review"),
            
            (3, 3, 2, "Manual", "Import loan request", "NEW", 
             datetime.strptime("2023-02-18T09:15:00Z", "%Y-%m-%dT%H:%M:%SZ"), "Viability Check Failed - Limit"),
            
            (4, 4, 5, "Email", "Export credit insurance request", "NEW", 
             datetime.strptime("2023-02-20T11:00:00Z", "%Y-%m-%dT%H:%M:%SZ"), "Viability Check Successes"),
            
            (5, 5, 4, "File", "Supply chain finance request", "NEW", 
             datetime.strptime("2023-02-28T16:30:00Z", "%Y-%m-%dT%H:%M:%SZ"), "Transaction Rejected")
        ]
        
        for event in events:
            session.execute(text("""
                INSERT INTO event (event_id, transaction_id, entity_id, source, source_content, type, created_at, status)
                VALUES (:event_id, :transaction_id, :entity_id, :source, :source_content, :type, :created_at, :status)
            """), {
                "event_id": event[0],
                "transaction_id": event[1],
                "entity_id": event[2],
                "source": event[3],
                "source_content": event[4],
                "type": event[5],
                "created_at": event[6],
                "status": event[7]
            })
        
        # Create transaction entities
        print("Creating transaction entities...")
        transaction_entities = [
            (1, 1, "Issuing Bank", "Global Traders Inc.", "123 Trade Avenue, New York, NY 10001", "USA"),
            (2, 1, "Confirming Bank", "Asian Development Corp", "50 Raffles Place, Singapore 048623", "Singapore"),
            (3, 1, "Importer", "Tech Solutions Ltd", "1-7-1 Konan, Minato-ku, Tokyo, Japan", "Japan"),
            (4, 1, "Supplier", "Global Hardware Supplies", "88 Dunhua North Road, Taipei, Taiwan", "Taiwan"),
            
            (5, 2, "Issuing Bank", "Kenya Commercial Bank", "55 Banking Street, Nairobi, Kenya", "Kenya"),
            (6, 2, "Importer", "European Gourmet Foods", "24 Rue de Commerce, Paris, France", "France"),
            (7, 2, "Supplier", "African Farmers Cooperative", "45 Agriculture Road, Nairobi, Kenya", "Kenya")
        ]
        
        for entity in transaction_entities:
            session.execute(text("""
                INSERT INTO transaction_entity (id, transaction_id, type, entity_name, entity_address, entity_country)
                VALUES (:id, :transaction_id, :type, :entity_name, :entity_address, :entity_country)
            """), {
                "id": entity[0],
                "transaction_id": entity[1],
                "type": entity[2],
                "entity_name": entity[3],
                "entity_address": entity[4],
                "entity_country": entity[5]
            })
        
        # Create checks
        print("Creating checks...")
        # Sanction checks
        sanction_checks = [
            (1, 1, datetime.strptime("2023-01-15T10:30:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (2, 2, datetime.strptime("2023-01-26T14:45:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (3, 3, datetime.strptime("2023-02-18T09:15:00Z", "%Y-%m-%dT%H:%M:%SZ"))
        ]
        
        for check in sanction_checks:
            session.execute(text("""
                INSERT INTO sanction_check (id, event_id, check_timestamp)
                VALUES (:id, :event_id, :check_timestamp)
            """), {
                "id": check[0],
                "event_id": check[1],
                "check_timestamp": check[2]
            })
        
        # Eligibility checks
        eligibility_checks = [
            (1, 1, datetime.strptime("2023-01-15T10:30:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (2, 2, datetime.strptime("2023-01-26T14:45:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (3, 3, datetime.strptime("2023-02-18T09:15:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (4, 4, datetime.strptime("2023-02-20T11:00:00Z", "%Y-%m-%dT%H:%M:%SZ"))
        ]
        
        for check in eligibility_checks:
            session.execute(text("""
                INSERT INTO eligibility_check (id, event_id, check_timestamp)
                VALUES (:id, :event_id, :check_timestamp)
            """), {
                "id": check[0],
                "event_id": check[1],
                "check_timestamp": check[2]
            })
        
        # Limits checks
        limits_checks = [
            (1, 1, datetime.strptime("2023-01-15T10:30:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (2, 2, datetime.strptime("2023-01-26T14:45:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (3, 4, datetime.strptime("2023-02-20T11:00:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (4, 5, datetime.strptime("2023-02-28T16:30:00Z", "%Y-%m-%dT%H:%M:%SZ"))
        ]
        
        for check in limits_checks:
            session.execute(text("""
                INSERT INTO limits_check (id, event_id, check_timestamp)
                VALUES (:id, :event_id, :check_timestamp)
            """), {
                "id": check[0],
                "event_id": check[1],
                "check_timestamp": check[2]
            })
        
        # Exposure checks
        exposure_checks = [
            (1, 1, datetime.strptime("2023-01-15T10:30:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (2, 2, datetime.strptime("2023-01-26T14:45:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (3, 3, datetime.strptime("2023-02-18T09:15:00Z", "%Y-%m-%dT%H:%M:%SZ")),
            (4, 4, datetime.strptime("2023-02-20T11:00:00Z", "%Y-%m-%dT%H:%M:%SZ"))
        ]
        
        for check in exposure_checks:
            session.execute(text("""
                INSERT INTO exposure_check (id, event_id, check_timestamp)
                VALUES (:id, :event_id, :check_timestamp)
            """), {
                "id": check[0],
                "event_id": check[1],
                "check_timestamp": check[2]
            })
        
        # Create limits (using correct table name from schema)
        print("Creating limits...")
        # Check which table actually exists
        table_check = session.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'entity_limit')")).scalar()
        
        if table_check:
            limit_table = "entity_limit"
        else:
            limit_table = "limit"
            
        print(f"Using table name: {limit_table}")
        
        limits = [
            (1, 1, 1, 5000000, 1500000),
            (2, 2, 1, 4000000, 3000000),
            (3, 3, 1, 1000000, 250000),
            (4, 4, 1, 3000000, 2750000),
            (5, 5, 1, 7500000, 2000000)
        ]
        
        for limit in limits:
            session.execute(text(f"""
                INSERT INTO "{limit_table}" (id, entity_id, product_id, approved_limit, used_limit)
                VALUES (:id, :entity_id, :product_id, :approved_limit, :used_limit)
            """), {
                "id": limit[0],
                "entity_id": limit[1],
                "product_id": limit[2],
                "approved_limit": limit[3],
                "used_limit": limit[4]
            })
        
        session.commit()
        print("Mock data created successfully!")
    
    except Exception as e:
        session.rollback()
        print(f"Error creating mock data: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    populate_database() 