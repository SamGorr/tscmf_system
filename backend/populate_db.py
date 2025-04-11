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
        session.execute(text("TRUNCATE transaction, event, transaction_entity, transaction_goods CASCADE"))

        # Now import entities from CSV file
        print("Importing entity from CSV...")
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "entity.csv")
        
        with open(csv_path, 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Parse the date from the CSV format (MM/DD/YYYY) to a datetime object
                date_str = row.get('agreement_date', '')
                try:
                    agreement_date = datetime.strptime(date_str, '%m/%d/%Y')
                except ValueError:
                    print(f"Warning: Could not parse date {date_str}, using current date")
                    agreement_date = datetime.utcnow()
                
                # Insert the entity into the database
                session.execute(text("""
                    INSERT INTO entity (entity_id, entity_name, swift, entity_address, country, signing_office_branch, agreement_date)
                    VALUES (:entity_id, :entity_name, :swift, :entity_address, :country, :signing_office_branch, :agreement_date)
                """), {
                    "entity_id": int(row['entity_id']),
                    "entity_name": row['entity_name'],
                    "swift": row.get('swift', ''),
                    "entity_address": row.get('entity_address', ''),
                    "country": row.get('country', ''),
                    "signing_office_branch": row.get('signing_office_branch', ''),
                    "agreement_date": agreement_date
                })
        
        # Now import transaction from CSV file
        print("Importing transaction from CSV...")
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "transaction.csv")
        
        with open(csv_path, 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Parse the dates from the CSV
                date_of_issue_str = row.get('date_of_issue', '')
                expiry_date_str = row.get('expiry_date', '')
                value_date_str = row.get('value_date_of_adb_guarantee', '')
                end_risk_period_str = row.get('end_of_risk_period', '')
                expiry_date_adb_str = row.get('expiry_date_of_adb_guarantee', '')
                
                try:
                    date_of_issue = datetime.strptime(date_of_issue_str, '%m/%d/%Y') if date_of_issue_str else None
                    expiry_date = datetime.strptime(expiry_date_str, '%m/%d/%Y') if expiry_date_str else None
                    value_date = datetime.strptime(value_date_str, '%m/%d/%Y') if value_date_str else None
                    end_risk_period = datetime.strptime(end_risk_period_str, '%m/%d/%Y') if end_risk_period_str else None
                    expiry_date_adb = datetime.strptime(expiry_date_adb_str, '%m/%d/%Y') if expiry_date_adb_str else None
                except ValueError as e:
                    print(f"Warning: Could not parse date - {e}, using current date")
                    date_of_issue = datetime.utcnow() if date_of_issue_str else None
                    expiry_date = datetime.utcnow() if expiry_date_str else None
                    value_date = datetime.utcnow() if value_date_str else None
                    end_risk_period = datetime.utcnow() if end_risk_period_str else None
                    expiry_date_adb = datetime.utcnow() if expiry_date_adb_str else None
            
                # Insert the transaction into the database
                session.execute(text("""
                    INSERT INTO transaction (
                        transaction_id, country, issuing_bank, confirming_bank, requesting_bank, 
                        adb_guarantee_trn, confirming_bank_reference_trn, issuing_bank_reference_trn, 
                        form_of_eligible_instrument, face_amount, date_of_issue, expiry_date, 
                        terms_of_payment, currency, local_currency_amount, usd_equivalent_amount, 
                        book_rate, cover, local_currency_amount_cover, usd_equivalent_amount_cover, 
                        sub_limit_type, value_date_of_adb_guarantee, end_of_risk_period, tenor, 
                        expiry_date_of_adb_guarantee, tenor_of_adb_guarantee, guarantee_fee_rate
                    )
                    VALUES (
                        :transaction_id, :country, :issuing_bank, :confirming_bank, :requesting_bank,
                        :adb_guarantee_trn, :confirming_bank_reference_trn, :issuing_bank_reference_trn,
                        :form_of_eligible_instrument, :face_amount, :date_of_issue, :expiry_date,
                        :terms_of_payment, :currency, :local_currency_amount, :usd_equivalent_amount,
                        :book_rate, :cover, :local_currency_amount_cover, :usd_equivalent_amount_cover,
                        :sub_limit_type, :value_date_of_adb_guarantee, :end_of_risk_period, :tenor,
                        :expiry_date_of_adb_guarantee, :tenor_of_adb_guarantee, :guarantee_fee_rate
                    )
                """), {
                    "transaction_id": int(row['transaction_id']),
                    "country": row.get('country', ''),
                    "issuing_bank": row.get('issuing_bank', ''),
                    "confirming_bank": row.get('confirming_bank', ''),
                    "requesting_bank": row.get('requesting_bank', ''),
                    "adb_guarantee_trn": row.get('adb_guarantee_trn', ''),
                    "confirming_bank_reference_trn": row.get('confirming_bank_reference_trn', ''),
                    "issuing_bank_reference_trn": row.get('issuing_bank_reference_trn', ''),
                    "form_of_eligible_instrument": row.get('form_of_eligible_instrument', ''),
                    "face_amount": float(row.get('face_amount', 0)),
                    "date_of_issue": date_of_issue,
                    "expiry_date": expiry_date,
                    "terms_of_payment": row.get('terms_of_payment', ''),
                    "currency": row.get('currency', ''),
                    "local_currency_amount": float(row.get('local_currency_amount', 0)),
                    "usd_equivalent_amount": float(row.get('usd_equivalent_amount', 0)),
                    "book_rate": row.get('book_rate', ''),
                    "cover": row.get('cover', ''),
                    "local_currency_amount_cover": float(row.get('local_currency_amount_cover', 0)),
                    "usd_equivalent_amount_cover": float(row.get('usd_equivalent_amount_cover', 0)),
                    "sub_limit_type": row.get('sub_limit_type', ''),
                    "value_date_of_adb_guarantee": value_date,
                    "end_of_risk_period": end_risk_period,
                    "tenor": row.get('tenor', ''),
                    "expiry_date_of_adb_guarantee": expiry_date_adb,
                    "tenor_of_adb_guarantee": row.get('tenor_of_adb_guarantee', ''),
                    "guarantee_fee_rate": row.get('guarantee_fee_rate', '')
                })

        # Now import events from CSV file
        print("Importing events from CSV...")
        csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "event.csv")
        
        with open(csv_path, 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                # Parse the date from the CSV format (DD-MMM-YY) to a datetime object
                created_at_str = row.get('created_at', '')
                email_date_str = row.get('email_date', '')
                try:
                    created_at = datetime.strptime(created_at_str, '%d-%b-%y')
                    email_date = datetime.strptime(email_date_str, '%m/%d/%Y %H:%M') if email_date_str else None
                except ValueError:
                    print(f"Warning: Could not parse date {created_at_str} or {email_date_str}, using current date")
                    created_at = datetime.utcnow()
                    email_date = datetime.utcnow() if email_date_str else None
                
                # Insert the event into the database
                session.execute(text("""
                    INSERT INTO event (
                        event_id, transaction_id, source, email_from, email_to, 
                        email_subject, email_date, email_body, type, created_at, status
                    )
                    VALUES (
                        :event_id, :transaction_id, :source, :email_from, :email_to, 
                        :email_subject, :email_date, :email_body, :type, :created_at, :status
                    )
                """), {
                    "event_id": int(row['event_id']),
                    "transaction_id": int(row['transaction_id']),
                    "source": row.get('source', ''),
                    "email_from": row.get('email_from', ''),
                    "email_to": row.get('email_to', ''),
                    "email_subject": row.get('email_subject', ''),
                    "email_date": email_date,
                    "email_body": row.get('email_body', ''),
                    "type": row.get('type', ''),
                    "created_at": created_at,
                    "status": row.get('status', '')
                })
                
        # Import transaction_entity from CSV file if it exists
        transaction_entity_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "transaction_entity.csv")
        if os.path.exists(transaction_entity_path):
            print("Importing transaction_entity from CSV...")
            with open(transaction_entity_path, 'r') as file:
                csv_reader = csv.DictReader(file)
                for row in csv_reader:
                    # Insert the transaction_entity into the database
                    session.execute(text("""
                        INSERT INTO transaction_entity (transaction_id, type, address, country)
                        VALUES (:transaction_id, :type, :address, :country)
                    """), {
                        "transaction_id": int(row['transaction_id']),
                        "type": row.get('type', ''),
                        "address": row.get('address', ''),
                        "country": row.get('country', '')
                    })

        # Import transaction_goods from CSV file if it exists
        transaction_goods_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "transaction_goods.csv")
        if os.path.exists(transaction_goods_path):
            print("Importing transaction_goods from CSV...")
            with open(transaction_goods_path, 'r') as file:
                csv_reader = csv.DictReader(file)
                for row in csv_reader:
                    # Convert quantity to integer with error handling
                    try:
                        quantity = int(row['quantity']) if row.get('quantity', '') else 0
                    except ValueError:
                        print(f"Warning: Could not convert quantity '{row.get('quantity', '')}' to integer, using 0")
                        quantity = 0
                    
                    # Insert the transaction_goods into the database
                    session.execute(text("""
                        INSERT INTO transaction_goods (transaction_id, item_name, quantity, unit)
                        VALUES (:transaction_id, :item_name, :quantity, :unit)
                    """), {
                        "transaction_id": int(row['transaction_id']),
                        "item_name": row.get('item_name', ''),
                        "quantity": quantity,
                        "unit": row.get('unit', '')
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