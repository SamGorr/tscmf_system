from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import desc
import datetime

from .database.database import get_db, engine
from .models.models import Transaction, Event, Entity, Transaction_Entity, Transaction_Goods
# Create the tables if they don't exist
# Note: In production, use Alembic migrations instead
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TSCMF API",
    description="Trade, Supply Chain, and Microfinance Management API",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the TSCMF API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        # Try to fetch one entity to check DB connection
        db.execute("SELECT 1")
        return {"status": "Database connection successful"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)}

@app.get("/api/events")
def get_events(db: Session = Depends(get_db)):
    """
    Retrieve all events with related transaction and entity information.
    """
    try:
        print("Starting events API endpoint request...")
        # Query events with related information
        events = db.query(Event).order_by(desc(Event.created_at)).all()
        print(f"Found {len(events)} events in the database")
        
        # Format the events for the response
        result = []
        for event in events:
            print(f"Processing event {event.event_id}")
            # Get transaction info if available
            transaction_info = {}
            if event.transaction_id:
                transaction = event.transaction
                if transaction:
                    transaction_info = {
                        "transaction_id": transaction.transaction_id,
                        "country": transaction.country,
                        "issuing_bank": transaction.issuing_bank,
                        "confirming_bank": transaction.confirming_bank,
                        "requesting_bank": transaction.requesting_bank,
                        "adb_guarantee_trn": transaction.adb_guarantee_trn,
                        "form_of_eligible_instrument": transaction.form_of_eligible_instrument,
                        "face_amount": float(transaction.face_amount) if transaction.face_amount else None,
                        "currency": transaction.currency,
                        "usd_equivalent_amount": float(transaction.usd_equivalent_amount) if transaction.usd_equivalent_amount else None,
                        "date_of_issue": transaction.date_of_issue.isoformat() if transaction.date_of_issue else None,
                        "expiry_date": transaction.expiry_date.isoformat() if transaction.expiry_date else None,
                        "tenor": transaction.tenor,
                    }
            
            # Combine all data
            event_data = {
                "event_id": event.event_id,
                "transaction_id": event.transaction_id,
                "source": event.source,
                "email_from": event.email_from,
                "email_to": event.email_to,
                "email_subject": event.email_subject,
                "email_date": event.email_date.isoformat() if event.email_date else None,
                "email_body": event.email_body,
                "type": event.type,
                "created_at": event.created_at.isoformat() if event.created_at else None,
                "status": event.status,
                "transaction": transaction_info,
            }
            
            result.append(event_data)
        
        print(f"Returning {len(result)} events in response")
        return result
    except Exception as e:
        print(f"Error retrieving events: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving events: {str(e)}")

@app.get("/api/events-simple")
def get_events_simple(db: Session = Depends(get_db)):
    """
    Simplified endpoint to test events retrieval
    """
    try:
        print("Starting simple events API endpoint request...")
        # Query events without relationships
        events = db.query(Event).order_by(desc(Event.created_at)).all()
        print(f"Found {len(events)} events in the database")
        
        # Format the events for the response - simple version
        result = []
        for event in events:
            event_data = {
                "event_id": event.event_id,
                "transaction_id": event.transaction_id,
                "entity_id": event.entity_id,
                "source": event.source,
                "type": event.type, 
                "created_at": event.created_at.isoformat(),
                "status": event.status,
            }
            result.append(event_data)
        
        print(f"Returning {len(result)} simple events in response")
        return result
    except Exception as e:
        print(f"Error retrieving simple events: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving simple events: {str(e)}")

@app.get("/api/entities")
def get_entities(db: Session = Depends(get_db)):
    """
    Retrieve all entities (clients)
    """
    try:
        print("Starting entities API endpoint request...")
        entities = db.query(Entity).all()
        print(f"Found {len(entities)} entities in the database")
        
        result = []
        for entity in entities:
            entity_data = {
                "entity_id": entity.entity_id,
                "entity_name": entity.entity_name,
                "entity_address": entity.entity_address,
                "country": entity.country,
                "client_type": entity.client_type,
                "risk_rating": entity.risk_rating,
                "onboard_date": entity.onboard_date.isoformat() if entity.onboard_date else None,
            }
            result.append(entity_data)
        
        print(f"Returning {len(result)} entities in response")
        return result
    except Exception as e:
        print(f"Error retrieving entities: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving entities: {str(e)}")

@app.get("/api/transactions")
def get_transactions(db: Session = Depends(get_db)):
    """
    Retrieve all transactions with related entity information
    """
    try:
        print("Starting transactions API endpoint request...")
        transactions = db.query(Transaction).order_by(desc(Transaction.created_at)).all()
        print(f"Found {len(transactions)} transactions in the database")
        
        result = []
        for transaction in transactions:
            # Get entity info if available
            entity_info = {}
            if transaction.entity_id:
                entity = transaction.entity
                if entity:
                    entity_info = {
                        "entity_id": entity.entity_id,
                        "entity_name": entity.entity_name,
                        "country": entity.country,
                        "client_type": entity.client_type,
                        "risk_rating": entity.risk_rating,
                    }
            
            # Format transaction
            transaction_data = {
                "id": transaction.transaction_id,
                "transaction_id": transaction.transaction_id,
                "entity_id": transaction.entity_id,
                "product_id": transaction.product_id,
                "product_name": transaction.product_name,
                "industry": transaction.industry,
                "amount": float(transaction.amount) if transaction.amount else None,
                "currency": transaction.currency,
                "country": transaction.country,
                "location": transaction.location,
                "beneficiary": transaction.beneficiary,
                "tenor": transaction.tenor,
                "maturity_date": transaction.maturity_date.isoformat() if transaction.maturity_date else None,
                "price": float(transaction.price) if transaction.price else None,
                "created_at": transaction.created_at.isoformat() if transaction.created_at else None,
                "reference_number": f"TXN-{transaction.transaction_id:05d}",
                "client_name": entity_info.get("entity_name", ""),
                "client_type": entity_info.get("client_type", ""),
                "entity": entity_info
            }
            result.append(transaction_data)
        
        print(f"Returning {len(result)} transactions in response")
        return result
    except Exception as e:
        print(f"Error retrieving transactions: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving transactions: {str(e)}")

@app.get("/api/transactions/{transaction_id}")
def get_transaction_by_id(transaction_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single transaction by ID with related entity and event information
    """
    try:
        print(f"Starting transaction detail API endpoint request for ID: {transaction_id}...")
        
        # Query for the specific transaction with joined entity data
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Get related events
        events = db.query(Event).filter(Event.transaction_id == transaction_id).order_by(desc(Event.created_at)).all()
        
        # Get entity data
        issuing_entity = None
        confirming_entity = None
        requesting_entity = None
        
        if transaction.issuing_bank:
            issuing_entity = db.query(Entity).filter(Entity.entity_name == transaction.issuing_bank).first()
            
        if transaction.confirming_bank:
            confirming_entity = db.query(Entity).filter(Entity.entity_name == transaction.confirming_bank).first()
            
        if transaction.requesting_bank:
            requesting_entity = db.query(Entity).filter(Entity.entity_name == transaction.requesting_bank).first()
        
        events_data = []
        for event in events:
            event_data = {
                "event_id": event.event_id,
                "transaction_id": event.transaction_id,
                "source": event.source,
                "email_from": event.email_from,
                "email_to": event.email_to,
                "email_subject": event.email_subject,
                "email_date": event.email_date.isoformat() if event.email_date else None,
                "email_body": event.email_body,
                "type": event.type,
                "created_at": event.created_at.isoformat() if event.created_at else None,
                "status": event.status,
            }
            events_data.append(event_data)
        
        # Determine status and type from most recent event
        status = "Pending Review"
        event_type = "Request"
        if events:
            status = events[0].status
            event_type = events[0].type
        
        # Format transaction with detailed information
        transaction_data = {
            "id": transaction.transaction_id,
            "transaction_id": transaction.transaction_id,
            "country": transaction.country,
            "issuing_bank": transaction.issuing_bank,
            "confirming_bank": transaction.confirming_bank,
            "requesting_bank": transaction.requesting_bank,
            "adb_guarantee_trn": transaction.adb_guarantee_trn,
            "confirming_bank_reference_trn": transaction.confirming_bank_reference_trn,
            "issuing_bank_reference_trn": transaction.issuing_bank_reference_trn,
            "form_of_eligible_instrument": transaction.form_of_eligible_instrument,
            "face_amount": float(transaction.face_amount) if transaction.face_amount else None,
            "date_of_issue": transaction.date_of_issue.isoformat() if transaction.date_of_issue else None,
            "expiry_date": transaction.expiry_date.isoformat() if transaction.expiry_date else None,
            "terms_of_payment": transaction.terms_of_payment,
            "currency": transaction.currency,
            "local_currency_amount": float(transaction.local_currency_amount) if transaction.local_currency_amount else None,
            "usd_equivalent_amount": float(transaction.usd_equivalent_amount) if transaction.usd_equivalent_amount else None,
            "book_rate": float(transaction.book_rate) if transaction.book_rate else None,
            "cover": float(transaction.cover) if transaction.cover else None,
            "local_currency_amount_cover": float(transaction.local_currency_amount_cover) if transaction.local_currency_amount_cover else None,
            "usd_equivalent_amount_cover": float(transaction.usd_equivalent_amount_cover) if transaction.usd_equivalent_amount_cover else None,
            "sub_limit_type": transaction.sub_limit_type,
            "value_date_of_adb_guarantee": transaction.value_date_of_adb_guarantee.isoformat() if transaction.value_date_of_adb_guarantee else None,
            "end_of_risk_period": transaction.end_of_risk_period.isoformat() if transaction.end_of_risk_period else None,
            "tenor": transaction.tenor,
            "expiry_date_of_adb_guarantee": transaction.expiry_date_of_adb_guarantee.isoformat() if transaction.expiry_date_of_adb_guarantee else None,
            "tenor_of_adb_guarantee": transaction.tenor_of_adb_guarantee,
            "guarantee_fee_rate": float(transaction.guarantee_fee_rate) if transaction.guarantee_fee_rate else None,
            
            # Keep original fields for backward compatibility with UI
            "reference_number": transaction.adb_guarantee_trn or f"TXN-{transaction.transaction_id:05d}",
            "client_name": transaction.issuing_bank,
            "client_country": transaction.country,
            "client_address": "",
            "status": status,
            "type": event_type,
            "source": events[0].source if events else "System",
            "events": events_data,
            
            # Entity data from relationships
            "entity_address": issuing_entity.entity_address if issuing_entity else "",
            
            # Issuing bank entity data
            "issuing_bank_swift": issuing_entity.swift if issuing_entity else None,
            "issuing_bank_entity_address": issuing_entity.entity_address if issuing_entity else None,
            "issuing_bank_signing_office_branch": issuing_entity.signing_office_branch if issuing_entity else None,
            "issuing_bank_agreement_date": issuing_entity.agreement_date.isoformat() if issuing_entity and issuing_entity.agreement_date else None,
            "issuing_bank_country": issuing_entity.country if issuing_entity else transaction.country,
            
            # Confirming bank entity data
            "confirming_bank_swift": confirming_entity.swift if confirming_entity else None,
            "confirming_bank_entity_address": confirming_entity.entity_address if confirming_entity else None,
            "confirming_bank_signing_office_branch": confirming_entity.signing_office_branch if confirming_entity else None,
            "confirming_bank_agreement_date": confirming_entity.agreement_date.isoformat() if confirming_entity and confirming_entity.agreement_date else None,
            "confirming_bank_country": confirming_entity.country if confirming_entity else transaction.country,
            
            # Requesting bank entity data
            "requesting_bank_swift": requesting_entity.swift if requesting_entity else None,
            "requesting_bank_entity_address": requesting_entity.entity_address if requesting_entity else None,
            "requesting_bank_signing_office_branch": requesting_entity.signing_office_branch if requesting_entity else None,
            "requesting_bank_agreement_date": requesting_entity.agreement_date.isoformat() if requesting_entity and requesting_entity.agreement_date else None,
            "requesting_bank_country": requesting_entity.country if requesting_entity else transaction.country,
            
            # Additional entities information derived from the transaction model
            "entities": [
                {
                    "id": "1", 
                    "type": "Issuing Bank",
                    "name": transaction.issuing_bank,
                    "country": issuing_entity.country if issuing_entity else transaction.country,
                    "address": issuing_entity.entity_address if issuing_entity else ""
                },
                {
                    "id": "2", 
                    "type": "Confirming Bank",
                    "name": transaction.confirming_bank,
                    "country": confirming_entity.country if confirming_entity else transaction.country, 
                    "address": confirming_entity.entity_address if confirming_entity else ""
                },
                {
                    "id": "3", 
                    "type": "Requesting Bank",
                    "name": transaction.requesting_bank,
                    "country": requesting_entity.country if requesting_entity else transaction.country,
                    "address": requesting_entity.entity_address if requesting_entity else ""
                }
            ] if transaction.issuing_bank else []
        }
        
        print(f"Returning transaction detail for ID: {transaction_id}")
        return transaction_data
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error retrieving transaction detail: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving transaction detail: {str(e)}")

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Retrieve summary statistics for the dashboard based on events data
    """
    try:
        print("Starting dashboard stats API endpoint request...")
        
        # Get events
        events = db.query(Event).all()
        
        # Count unique transactions and entities from events
        unique_transactions = set()
        banks = set()
        countries = set()
        
        # Get events by status and type
        status_counts = {}
        type_counts = {}
        
        for event in events:
            if event.transaction_id:
                unique_transactions.add(event.transaction_id)
                
                # Get transaction details to extract banks and countries
                transaction = event.transaction
                if transaction:
                    if transaction.issuing_bank:
                        banks.add(transaction.issuing_bank)
                    if transaction.confirming_bank:
                        banks.add(transaction.confirming_bank)
                    if transaction.requesting_bank:
                        banks.add(transaction.requesting_bank)
                    if transaction.country:
                        countries.add(transaction.country)
            
            # Count by status
            status_counts[event.status] = status_counts.get(event.status, 0) + 1
            
            # Count by type
            type_counts[event.type] = type_counts.get(event.type, 0) + 1
        
        # Categorize for transaction summary
        approved_count = sum(count for status, count in status_counts.items() 
                          if 'Success' in status or 'Booked' in status)
        processing_count = sum(count for status, count in status_counts.items() 
                            if 'Pending' in status or 'In Progress' in status)
        declined_count = sum(count for status, count in status_counts.items() 
                          if 'Failed' in status or 'Rejected' in status)
        
        # Create response
        result = {
            "clients": len(banks),
            "products": len(countries),
            "transactions": {
                "total": len(unique_transactions),
                "approved": approved_count,
                "processing": processing_count,
                "declined": declined_count
            },
            "events": {
                "total": len(events),
                "by_status": status_counts,
                "by_type": type_counts
            }
        }
        
        print(f"Returning dashboard stats")
        return result
    except Exception as e:
        print(f"Error retrieving dashboard stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard stats: {str(e)}")

@app.get("/api/transactions/{transaction_id}/details")
def get_transaction_details(transaction_id: int, db: Session = Depends(get_db)):
    """
    Retrieve transaction entity and goods information by transaction ID
    """
    try:
        print(f"Starting transaction details API endpoint request for ID: {transaction_id}...")
        
        # Query for the specific transaction
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Query transaction entities
        transaction_entities = db.query(Transaction_Entity).filter(
            Transaction_Entity.transaction_id == transaction_id
        ).all()
        
        # Query transaction goods
        transaction_goods = db.query(Transaction_Goods).filter(
            Transaction_Goods.transaction_id == transaction_id
        ).all()
        
        if not transaction_entities and not transaction_goods:
            print(f"No detailed entities/goods found for transaction ID: {transaction_id}. Using derived data.")
            
            # Create derived entities from transaction fields
            entities_data = []
            if transaction.issuing_bank:
                entities_data.append({
                    "id": 1,
                    "type": "Issuing Bank",
                    "name": transaction.issuing_bank,
                    "country": transaction.country,
                    "address": ""
                })
            
            if transaction.confirming_bank:
                entities_data.append({
                    "id": 2,
                    "type": "Confirming Bank",
                    "name": transaction.confirming_bank,
                    "country": transaction.country,
                    "address": ""
                })
                
            if transaction.requesting_bank:
                entities_data.append({
                    "id": 3,
                    "type": "Requesting Bank",
                    "name": transaction.requesting_bank,
                    "country": transaction.country,
                    "address": ""
                })
            
            # Create derived goods from form_of_eligible_instrument field
            goods_data = []
            if transaction.form_of_eligible_instrument:
                goods_data.append({
                    "id": 1,
                    "name": transaction.form_of_eligible_instrument,
                    "quantity": 1,
                    "unit": "item"
                })
        else:
            print(f"Found {len(transaction_entities)} entities and {len(transaction_goods)} goods for transaction ID: {transaction_id}")
            
            # Format the entities data
            entities_data = []
            for entity in transaction_entities:
                entity_data = {
                    "id": entity.id,
                    "type": entity.type,
                    "address": entity.address,
                    "country": entity.country,
                    "name": entity.type  # Adding a default name based on type
                }
                entities_data.append(entity_data)
            
            # Format the goods data
            goods_data = []
            for good in transaction_goods:
                good_data = {
                    "id": good.id,
                    "name": good.item_name,
                    "quantity": good.quantity,
                    "unit": good.unit
                }
                goods_data.append(good_data)
        
        # Combine all data
        transaction_details = {
            "transaction_id": transaction_id,
            "entities": entities_data,
            "goods": goods_data
        }
        
        print(f"Returning transaction details for ID: {transaction_id}")
        return transaction_details
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error retrieving transaction details: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving transaction details: {str(e)}")