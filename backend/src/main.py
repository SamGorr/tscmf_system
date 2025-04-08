from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import desc
import datetime

from .database.database import get_db, engine
from .models.models import Transaction, Event, Entity
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
                        "product_name": transaction.product_name,
                        "industry": transaction.industry,
                        "amount": float(transaction.amount) if transaction.amount else None,
                        "currency": transaction.currency,
                        "country": transaction.country,
                        "location": transaction.location,
                        "beneficiary": transaction.beneficiary,
                        "maturity_date": transaction.maturity_date.isoformat() if transaction.maturity_date else None,
                    }
            
            # Get entity info if available
            entity_info = {}
            if event.entity_id:
                entity = event.entity
                if entity:
                    entity_info = {
                        "entity_name": entity.entity_name,
                        "entity_address": entity.entity_address,
                        "country": entity.country,
                        "client_type": entity.client_type,
                        "risk_rating": entity.risk_rating,
                    }
            
            # Combine all data
            event_data = {
                "event_id": event.event_id,
                "transaction_id": event.transaction_id,
                "entity_id": event.entity_id,
                "source": event.source,
                "source_content": event.source_content,
                "type": event.type,
                "created_at": event.created_at.isoformat(),
                "status": event.status,
                "transaction": transaction_info,
                "entity": entity_info,
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
        
        # Query for the specific transaction
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Get entity info if available
        entity_info = {}
        if transaction.entity_id:
            entity = transaction.entity
            if entity:
                entity_info = {
                    "entity_id": entity.entity_id,
                    "entity_name": entity.entity_name,
                    "entity_address": entity.entity_address,
                    "country": entity.country,
                    "client_type": entity.client_type,
                    "risk_rating": entity.risk_rating,
                }
        
        # Get related events
        events = db.query(Event).filter(Event.transaction_id == transaction_id).order_by(desc(Event.created_at)).all()
        
        events_data = []
        for event in events:
            event_data = {
                "event_id": event.event_id,
                "transaction_id": event.transaction_id,
                "entity_id": event.entity_id,
                "source": event.source,
                "source_content": event.source_content,
                "type": event.type,
                "created_at": event.created_at.isoformat(),
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
            "client_country": entity_info.get("country", ""),
            "client_address": entity_info.get("entity_address", ""),
            "risk_rating": entity_info.get("risk_rating", ""),
            "status": status,
            "type": event_type,
            "source": events[0].source if events else "System",
            "goods_list": [{"name": transaction.industry, "quantity": "1", "unit": "lot"}] if transaction.industry else [],
            "entity": entity_info,
            "events": events_data,
            "entities": [{
                "id": str(entity_info.get("entity_id", "")),
                "type": "Client",
                "name": entity_info.get("entity_name", ""),
                "country": entity_info.get("country", ""),
                "address": entity_info.get("entity_address", "")
            }] if entity_info else []
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
    Retrieve summary statistics for the dashboard
    """
    try:
        print("Starting dashboard stats API endpoint request...")
        
        # Get counts
        entity_count = db.query(Entity).count()
        transaction_count = db.query(Transaction).count()
        event_count = db.query(Event).count()
        
        # Get unique product count
        product_count = db.query(Transaction.product_name).distinct().count()
        
        # Get events by status
        events = db.query(Event).all()
        status_counts = {}
        for event in events:
            status_counts[event.status] = status_counts.get(event.status, 0) + 1
        
        # Approximate status categories for transactions based on events
        approved_count = sum(count for status, count in status_counts.items() 
                          if 'Success' in status or 'Booked' in status)
        processing_count = sum(count for status, count in status_counts.items() 
                            if 'Pending' in status or 'In Progress' in status)
        declined_count = sum(count for status, count in status_counts.items() 
                          if 'Failed' in status or 'Rejected' in status)
        
        # Create response
        result = {
            "clients": entity_count,
            "products": product_count,
            "transactions": {
                "total": transaction_count,
                "approved": approved_count,
                "processing": processing_count,
                "declined": declined_count
            },
            "events": {
                "total": event_count,
                "by_status": status_counts
            }
        }
        
        print(f"Returning dashboard stats")
        return result
    except Exception as e:
        print(f"Error retrieving dashboard stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard stats: {str(e)}")