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
        session.execute(text("TRUNCATE transaction, event CASCADE"))

        # Now import entities from CSV file
        print("Importing entity from CSV...")
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "entity.csv")
        
        with open(csv_path, 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Parse the date from the CSV format (DD-MMM-YY) to a datetime object
                date_str = row['onboard_date']
                try:
                    onboard_date = datetime.strptime(date_str, '%d-%b-%y')
                except ValueError:
                    print(f"Warning: Could not parse date {date_str}, using current date")
                    onboard_date = datetime.utcnow()
                
                # Insert the event into the database
                session.execute(text("""
                    INSERT INTO entity (entity_id, entity_name, entity_address, country, client_type, risk_rating, onboard_date)
                    VALUES (:entity_id, :entity_name, :entity_address, :country, :client_type, :risk_rating, :onboard_date)
                """), {
                    "entity_id": int(row['entity_id']),
                    "entity_name": row['entity_name'],
                    "entity_address": row['entity_address'],
                    "country": row['country'],
                    "client_type": row['client_type'],
                    "risk_rating": row['risk_rating'],
                    "onboard_date": onboard_date
                })
        
        # Now import transaction from CSV file
        print("Importing transaction from CSV...")
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "transaction.csv")
        
        with open(csv_path, 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Parse the date from the CSV format (DD-MMM-YY) to a datetime object
                date_str = row['created_at']
                maturity_date_str = row['maturity_date']
                try:
                    created_at = datetime.strptime(date_str, '%d-%b-%y')
                    maturity_date = datetime.strptime(maturity_date_str, '%d-%b-%y')
                except ValueError:
                    print(f"Warning: Could not parse date {date_str}, using current date")
                    created_at = datetime.utcnow()
                    maturity_date = datetime.utcnow()
            
                # Default values for all transactions
                session.execute(text("""
                    INSERT INTO transaction (created_at, transaction_id, entity_id, product_id, product_name, industry, amount, currency, country, location, 
                                            beneficiary, tenor, maturity_date, price)
                    VALUES (:created_at, :transaction_id, :entity_id, :product_id, :product_name, :industry, :amount, :currency, :country, :location, 
                        :beneficiary, :tenor, :maturity_date, :price)
                """), {
                    "created_at": created_at,
                    "transaction_id": int(row['transaction_id']),
                    "entity_id": int(row['entity_id']),
                    "product_id": int(row['product_id']),
                    "product_name": row['product_name'],
                    "industry": row['industry'],
                    "amount": float(row['amount']),
                    "currency": row['currency'],
                    "country": row['country'],
                    "location": row['location'],
                    "beneficiary": row['beneficiary'],
                    "tenor": int(row['tenor']),
                    "maturity_date": maturity_date,
                    "price": float(row['price'])
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