import os
import sys
import csv
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text

# Add the backend directory to the path so we can import our models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database.database import engine

def populate_database():
    """
    Populate the database with required data and import events from CSV.
    """
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        print("Starting database population...")
        
        # Drop existing data
        print("Clearing existing data...")
        session.execute(text("TRUNCATE entity, transaction, event, transaction_entity, eligibility_check, exposure_check, limits_check, sanction_check CASCADE"))
        
        # Create entities (needed for foreign key constraints)
        print("Creating entities...")
        entities = [
            (1, "Global Traders Inc.", "123 Trade Avenue, New York, NY 10001", "USA", "CORPORATE", "A", datetime.utcnow()),
            (2, "Eastern Suppliers Ltd.", "88 Manufacturing Blvd, Shanghai, China", "China", "CORPORATE", "A-", datetime.utcnow()),
            (3, "African Farmers Cooperative", "45 Agriculture Road, Nairobi, Kenya", "Kenya", "SME", "B", datetime.utcnow()),
            (4, "South American Exporters", "237 Export Avenue, São Paulo, Brazil", "Brazil", "CORPORATE", "B+", datetime.utcnow()),
            (5, "European Distribution Network", "36 Logistics Park, Hamburg, Germany", "Germany", "CORPORATE", "AA", datetime.utcnow())
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
        
        # Create transactions (for IDs referenced in CSV)
        print("Creating transactions...")
        # Create a set of transactions for all IDs in the CSV
        transaction_ids = [10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10010, 10011]
        
        for tx_id in transaction_ids:
            # Default values for all transactions
            session.execute(text("""
                INSERT INTO transaction (transaction_id, product_id, created_at, amount, currency, country, location, 
                                        beneficiary, product, tenor, price, industry, list_of_goods)
                VALUES (:transaction_id, :product_id, :created_at, :amount, :currency, :country, :location, 
                       :beneficiary, :product, :tenor, :price, :industry, :list_of_goods)
            """), {
                "transaction_id": tx_id,
                "product_id": 1,  # Default product ID
                "created_at": datetime.utcnow(),
                "amount": 100000,
                "currency": "USD",
                "country": "USA",
                "location": "New York",
                "beneficiary": "Sample Beneficiary",
                "product": "Trade Finance",
                "tenor": 180,
                "price": 5.0,
                "industry": "General",
                "list_of_goods": "{Sample Goods}"
            })
        
        # Now import events from CSV file
        print("Importing events from CSV...")
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "event.csv")
        
        with open(csv_path, 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Parse the date from the CSV format (DD-MMM-YY) to a datetime object
                date_str = row['created_at']
                try:
                    created_at = datetime.strptime(date_str, '%d-%b-%y')
                except ValueError:
                    print(f"Warning: Could not parse date {date_str}, using current date")
                    created_at = datetime.utcnow()
                
                # Insert the event into the database
                session.execute(text("""
                    INSERT INTO event (event_id, transaction_id, entity_id, source, source_content, type, created_at, status)
                    VALUES (:event_id, :transaction_id, :entity_id, :source, :source_content, :type, :created_at, :status)
                """), {
                    "event_id": int(row['event_id']),
                    "transaction_id": int(row['transaction_id']),
                    "entity_id": int(row['entity_id']),
                    "source": row['source'],
                    "source_content": row['source_content'],
                    "type": row['type'],
                    "created_at": created_at,
                    "status": row['status']
                })
        
        # Commit the transaction
        session.commit()
        print("Database population completed successfully!")
        
    except Exception as e:
        session.rollback()
        print(f"Error populating database: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    populate_database() 