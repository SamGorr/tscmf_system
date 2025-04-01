import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, text

# Add the backend directory to the path so we can import our models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database.database import engine

def check_database():
    """Check database tables and content."""
    try:
        # Create a session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Check tables
        print("Checking database tables...")
        tables_query = text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = session.execute(tables_query).fetchall()
        
        if not tables:
            print("No tables found in the database.")
            return
        
        print("\nTables in the database:")
        for table in tables:
            print(f"- {table[0]}")

        # Count rows in each table
        print("\nRow counts in each table:")
        for table in tables:
            table_name = table[0]
            count_query = text(f'SELECT COUNT(*) FROM "{table_name}"')
            count = session.execute(count_query).scalar()
            print(f"- {table_name}: {count} rows")
        
        # Sample data from main tables
        if 'entity' in [t[0] for t in tables]:
            print("\nSample data from entity table:")
            entity_query = text("SELECT entity_id, entity_name, country, client_type, risk_rating FROM entity LIMIT 3")
            entities = session.execute(entity_query).fetchall()
            for entity in entities:
                print(f"  ID: {entity[0]}, Name: {entity[1]}, Country: {entity[2]}, Type: {entity[3]}, Rating: {entity[4]}")
        
        if 'transaction' in [t[0] for t in tables]:
            print("\nSample data from transaction table:")
            transaction_query = text("SELECT transaction_id, product_id, amount, currency, product FROM transaction LIMIT 3")
            transactions = session.execute(transaction_query).fetchall()
            for transaction in transactions:
                print(f"  ID: {transaction[0]}, Product ID: {transaction[1]}, Amount: {transaction[2]}, Currency: {transaction[3]}, Product: {transaction[4]}")
        
        if 'event' in [t[0] for t in tables]:
            print("\nSample data from event table:")
            event_query = text("SELECT event_id, transaction_id, entity_id, source, type, status FROM event LIMIT 3")
            events = session.execute(event_query).fetchall()
            for event in events:
                print(f"  ID: {event[0]}, Transaction ID: {event[1]}, Entity ID: {event[2]}, Source: {event[3]}, Type: {event[4]}, Status: {event[5]}")
        
        print("\nDatabase check completed successfully.")
    
    except Exception as e:
        print(f"Error checking database: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    check_database() 