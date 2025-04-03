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