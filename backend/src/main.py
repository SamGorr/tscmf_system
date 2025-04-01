from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import desc
import datetime

from .database.database import get_db, engine
from .models.models import Entity, Transaction, Event, TransactionEntity

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

@app.get("/api/transactions")
def get_transactions(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    transactions = db.query(Transaction).order_by(desc(Transaction.created_at)).offset(skip).limit(limit).all()
    
    # Format transactions for response
    result = []
    for tx in transactions:
        # Get associated events
        events = db.query(Event).filter(Event.transaction_id == tx.transaction_id).all()
        
        # Get transaction entities
        tx_entities = db.query(TransactionEntity).filter(
            TransactionEntity.transaction_id == tx.transaction_id
        ).all()
        
        # Convert list_of_goods to a list of dictionaries
        goods_list = []
        for item in tx.list_of_goods:
            goods_list.append({"name": item, "quantity": "N/A", "unit": "N/A"})
        
        # Format the transaction
        formatted_tx = {
            "transaction_id": tx.transaction_id,
            "product_id": tx.product_id,
            "created_at": tx.created_at.isoformat() if tx.created_at else None,
            "amount": tx.amount,
            "currency": tx.currency,
            "country": tx.country,
            "location": tx.location,
            "beneficiary": tx.beneficiary,
            "product": tx.product,
            "tenor": tx.tenor,
            "price": tx.price,
            "industry": tx.industry,
            "goods_list": goods_list,
            "status": events[0].status if events else "Unknown",
            "type": events[0].type if events else "Unknown",
            "source": events[0].source if events else "Unknown",
            "entities": [
                {
                    "id": str(entity.id),
                    "type": entity.type,
                    "name": entity.entity_name,
                    "country": entity.entity_country,
                    "address": entity.entity_address
                }
                for entity in tx_entities
            ]
        }
        
        result.append(formatted_tx)
    
    return result

@app.get("/api/entities")
def get_entities(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    entities = db.query(Entity).offset(skip).limit(limit).all()
    
    # Format entities for response
    result = []
    for entity in entities:
        # Get associated limits
        limits = db.query(Entity).filter(Entity.entity_id == entity.entity_id).all()
        
        # Format the entity
        formatted_entity = {
            "entity_id": entity.entity_id,
            "entity_name": entity.entity_name,
            "entity_address": entity.entity_address,
            "country": entity.country,
            "client_type": entity.client_type,
            "risk_rating": entity.risk_rating,
            "onboard_date": entity.onboard_date.isoformat() if entity.onboard_date else None,
        }
        
        result.append(formatted_entity)
    
    return result

@app.get("/api/transactions/{transaction_id}")
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get associated events
    events = db.query(Event).filter(Event.transaction_id == transaction.transaction_id).all()
    
    # Get transaction entities
    tx_entities = db.query(TransactionEntity).filter(
        TransactionEntity.transaction_id == transaction.transaction_id
    ).all()
    
    # Convert list_of_goods to a list of dictionaries
    goods_list = []
    for item in transaction.list_of_goods:
        goods_list.append({"name": item, "quantity": "N/A", "unit": "N/A"})
    
    # Format the transaction
    result = {
        "transaction_id": transaction.transaction_id,
        "product_id": transaction.product_id,
        "created_at": transaction.created_at.isoformat() if transaction.created_at else None,
        "amount": transaction.amount,
        "currency": transaction.currency,
        "country": transaction.country,
        "location": transaction.location,
        "beneficiary": transaction.beneficiary,
        "product": transaction.product,
        "tenor": transaction.tenor,
        "price": transaction.price,
        "industry": transaction.industry,
        "goods_list": goods_list,
        "status": events[0].status if events else "Unknown",
        "type": events[0].type if events else "Unknown",
        "source": events[0].source if events else "Unknown",
        "entities": [
            {
                "id": str(entity.id),
                "type": entity.type,
                "name": entity.entity_name,
                "country": entity.entity_country,
                "address": entity.entity_address
            }
            for entity in tx_entities
        ]
    }
    
    return result 