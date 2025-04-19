from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import desc
import datetime

from .database.database import get_db, engine
from .models.models import Transaction, Event, Entity, Transaction_Entity, Transaction_Goods, Underlying_Transaction, EntityLimit
from .services.sanctions_check import check_entity_against_watchlist, check_transaction_entities
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
                "swift": entity.swift,
                "signing_office_branch": entity.signing_office_branch,
                "agreement_date": entity.agreement_date.isoformat() if entity.agreement_date else None,
            }
            result.append(entity_data)
        
        print(f"Returning {len(result)} entities in response")
        return result
    except Exception as e:
        print(f"Error retrieving entities: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving entities: {str(e)}")

@app.get("/api/entity-limits")
def get_entity_limits(db: Session = Depends(get_db)):
    """
    Retrieve all entity limits
    """
    try:
        print("Starting entity limits API endpoint request...")
        entity_limits = db.query(EntityLimit).all()
        print(f"Found {len(entity_limits)} entity limits in the database")
        
        result = []
        for limit in entity_limits:
            limit_data = {
                "id": limit.id,
                "entity_name": limit.entity_name,
                "facility_limit": limit.facility_limit,
                "approved_limit": float(limit.approved_limit) if limit.approved_limit else 0,
                "max_tenor_of_adb_guarantee": limit.max_tenor_of_adb_guarantee,
                "type": limit.type,
                "pfi_rpa_allocation": float(limit.pfi_rpa_allocation) if limit.pfi_rpa_allocation else 0,
                "outstanding_exposure": float(limit.outstanding_exposure) if limit.outstanding_exposure else 0,
                "earmark_limit": float(limit.earmark_limit) if limit.earmark_limit else 0,
            }
            result.append(limit_data)
        
        print(f"Returning {len(result)} entity limits in response")
        return result
    except Exception as e:
        print(f"Error retrieving entity limits: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving entity limits: {str(e)}")

@app.get("/api/entities/{entity_name}")
def get_entity_by_name(entity_name: str, db: Session = Depends(get_db)):
    """
    Retrieve entity details by name including its limits
    """
    try:
        print(f"Starting entity detail API endpoint request for {entity_name}...")
        entity = db.query(Entity).filter(Entity.entity_name == entity_name).first()
        
        if not entity:
            raise HTTPException(status_code=404, detail=f"Entity {entity_name} not found")
        
        # Get entity limits
        entity_limits = db.query(EntityLimit).filter(EntityLimit.entity_name == entity_name).all()
        
        # Format entity data
        entity_data = {
            "entity_id": entity.entity_id,
            "entity_name": entity.entity_name,
            "entity_address": entity.entity_address,
            "country": entity.country,
            "swift": entity.swift,
            "signing_office_branch": entity.signing_office_branch,
            "agreement_date": entity.agreement_date.isoformat() if entity.agreement_date else None,
            "limits": []
        }
        
        # Format and add limits data
        for limit in entity_limits:
            available_limit = (
                float(limit.approved_limit if limit.approved_limit else 0) - 
                float(limit.pfi_rpa_allocation if limit.pfi_rpa_allocation else 0) - 
                float(limit.outstanding_exposure if limit.outstanding_exposure else 0)
            )
            
            net_available_limit = (
                available_limit - 
                float(limit.earmark_limit if limit.earmark_limit else 0)
            )
            
            limit_data = {
                "id": limit.id,
                "facility_limit": limit.facility_limit,
                "approved_limit": float(limit.approved_limit) if limit.approved_limit else 0,
                "max_tenor_of_adb_guarantee": limit.max_tenor_of_adb_guarantee,
                "type": limit.type,
                "pfi_rpa_allocation": float(limit.pfi_rpa_allocation) if limit.pfi_rpa_allocation else 0,
                "outstanding_exposure": float(limit.outstanding_exposure) if limit.outstanding_exposure else 0,
                "earmark_limit": float(limit.earmark_limit) if limit.earmark_limit else 0,
                "available_limit": available_limit,
                "net_available_limit": net_available_limit
            }
            entity_data["limits"].append(limit_data)
        
        print(f"Returning entity {entity_name} with {len(entity_data['limits'])} limits")
        return entity_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving entity details: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving entity details: {str(e)}")

@app.get("/api/country-limits/{country}")
def get_country_limits(country: str, db: Session = Depends(get_db)):
    """
    Retrieve country-level limit information
    """
    try:
        print(f"Starting country limits API endpoint request for {country}...")
        
        # Get all entities from this country
        entities = db.query(Entity).filter(Entity.country == country).all()
        entity_names = [entity.entity_name for entity in entities]
        
        # Get all limits for these entities
        entity_limits = db.query(EntityLimit).filter(EntityLimit.entity_name.in_(entity_names)).all()
        
        # Calculate total limits
        total_country_approved_limit = 400000000  # $400M as specified
        total_utilized = sum(float(limit.approved_limit) if limit.approved_limit else 0 for limit in entity_limits)
        available_country_limit = total_country_approved_limit - total_utilized
        utilization_percentage = (total_utilized / total_country_approved_limit) * 100 if total_country_approved_limit > 0 else 0
        
        country_limit_data = {
            "country": country,
            "total_country_approved_limit": total_country_approved_limit,
            "total_utilized": total_utilized,
            "available_country_limit": available_country_limit,
            "utilization_percentage": utilization_percentage
        }
        
        print(f"Returning country limit information for {country}")
        return country_limit_data
    except Exception as e:
        print(f"Error retrieving country limits: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving country limits: {str(e)}")

@app.get("/api/program-limits")
def get_program_limits(db: Session = Depends(get_db)):
    """
    Retrieve program-wide limit information
    """
    try:
        print("Starting program limits API endpoint request...")
        
        # Get all entity limits
        entity_limits = db.query(EntityLimit).all()
        
        # Calculate total limits
        total_program_approved_limit = 2000000000  # $2B as specified
        total_utilized = sum(float(limit.approved_limit) if limit.approved_limit else 0 for limit in entity_limits)
        available_program_limit = total_program_approved_limit - total_utilized
        utilization_percentage = (total_utilized / total_program_approved_limit) * 100 if total_program_approved_limit > 0 else 0
        
        program_limit_data = {
            "total_program_approved_limit": total_program_approved_limit,
            "total_utilized": total_utilized,
            "available_program_limit": available_program_limit,
            "utilization_percentage": utilization_percentage
        }
        
        print("Returning program limit information")
        return program_limit_data
    except Exception as e:
        print(f"Error retrieving program limits: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving program limits: {str(e)}")

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
    Retrieve a specific transaction by its ID
    """
    try:
        print(f"Starting get transaction by ID API endpoint request for ID: {transaction_id}...")
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Get the latest event for this transaction to get status information
        event = db.query(Event).filter(Event.transaction_id == transaction_id).order_by(desc(Event.created_at)).first()
        
        # Get entity details using relationships
        issuing_entity = transaction.issuing_entity if transaction.issuing_bank else None
        confirming_entity = transaction.confirming_entity if transaction.confirming_bank else None
        requesting_entity = transaction.requesting_entity if transaction.requesting_bank else None
        
        # Format transaction data including verification check statuses
        transaction_data = {
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
            "book_rate": transaction.book_rate,
            "cover": transaction.cover,
            "local_currency_amount_cover": float(transaction.local_currency_amount_cover) if transaction.local_currency_amount_cover else None,
            "usd_equivalent_amount_cover": float(transaction.usd_equivalent_amount_cover) if transaction.usd_equivalent_amount_cover else None,
            "sub_limit_type": transaction.sub_limit_type,
            "value_date_of_adb_guarantee": transaction.value_date_of_adb_guarantee.isoformat() if transaction.value_date_of_adb_guarantee else None,
            "end_of_risk_period": transaction.end_of_risk_period.isoformat() if transaction.end_of_risk_period else None,
            "tenor": transaction.tenor,
            "expiry_date_of_adb_guarantee": transaction.expiry_date_of_adb_guarantee.isoformat() if transaction.expiry_date_of_adb_guarantee else None,
            "tenor_of_adb_guarantee": transaction.tenor_of_adb_guarantee,
            "guarantee_fee_rate": transaction.guarantee_fee_rate,
            "industry": transaction.industry,
            
            # Add entity details for issuing bank
            "issuing_bank_country": issuing_entity.country if issuing_entity else None,
            "issuing_bank_entity_address": issuing_entity.entity_address if issuing_entity else None,
            "issuing_bank_swift": issuing_entity.swift if issuing_entity else None,
            "issuing_bank_signing_office_branch": issuing_entity.signing_office_branch if issuing_entity else None,
            "issuing_bank_agreement_date": issuing_entity.agreement_date.isoformat() if issuing_entity and issuing_entity.agreement_date else None,
            
            # Add entity details for confirming bank
            "confirming_bank_country": confirming_entity.country if confirming_entity else None,
            "confirming_bank_entity_address": confirming_entity.entity_address if confirming_entity else None,
            "confirming_bank_swift": confirming_entity.swift if confirming_entity else None,
            "confirming_bank_signing_office_branch": confirming_entity.signing_office_branch if confirming_entity else None,
            "confirming_bank_agreement_date": confirming_entity.agreement_date.isoformat() if confirming_entity and confirming_entity.agreement_date else None,
            
            # Add entity details for requesting bank
            "requesting_bank_country": requesting_entity.country if requesting_entity else None,
            "requesting_bank_entity_address": requesting_entity.entity_address if requesting_entity else None,
            "requesting_bank_swift": requesting_entity.swift if requesting_entity else None,
            "requesting_bank_signing_office_branch": requesting_entity.signing_office_branch if requesting_entity else None,
            "requesting_bank_agreement_date": requesting_entity.agreement_date.isoformat() if requesting_entity and requesting_entity.agreement_date else None,
        }
        
        # Add verification check statuses from the latest event
        if event:
            transaction_data.update({
                "status": event.status,
                "type": event.type,
                "created_at": event.created_at.isoformat() if event.created_at else None,
                "sanction_check_status": event.sanction_check_status,
                "eligibility_check_status": event.eligibility_check_status,
                "limit_check_status": event.limit_check_status,
                "pricing_status": event.pricing_status
            })
        
        print(f"Returning transaction {transaction_id} details")
        return transaction_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving transaction by ID: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving transaction: {str(e)}")

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
    Retrieve detailed information for a transaction including entities and goods
    """
    try:
        print(f"Starting transaction details API endpoint request for ID: {transaction_id}...")
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")

        # Get the latest event for this transaction
        event = db.query(Event).filter(Event.transaction_id == transaction_id).order_by(desc(Event.created_at)).first()
        
        # Get transaction entities
        transaction_entities = db.query(Transaction_Entity).filter(Transaction_Entity.transaction_id == transaction_id).all()
        
        # Get transaction goods
        transaction_goods = db.query(Transaction_Goods).filter(Transaction_Goods.transaction_id == transaction_id).all()
        
        # Get entity details using relationships
        issuing_entity = transaction.issuing_entity if transaction.issuing_bank else None
        confirming_entity = transaction.confirming_entity if transaction.confirming_bank else None
        requesting_entity = transaction.requesting_entity if transaction.requesting_bank else None
        
        # Format entities
        entities_data = []
        for entity in transaction_entities:
            entity_data = {
                "id": entity.id,
                "transaction_id": entity.transaction_id,
                "name": entity.name,
                "type": entity.type,
                "address": entity.address,
                "country": entity.country
            }
            entities_data.append(entity_data)
        
        # Format goods
        goods_data = []
        for good in transaction_goods:
            good_data = {
                "id": good.id,
                "transaction_id": good.transaction_id,
                "goods_classification": good.goods_classification,
                "item_name": good.item_name,
                "quantity": good.quantity,
                "unit": good.unit,
                "price": good.price
            }
            goods_data.append(good_data)
        
        # Build the response with transaction, entities, and goods data
        result = {
            "transaction": {
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
                "book_rate": transaction.book_rate,
                "cover": transaction.cover,
                "local_currency_amount_cover": float(transaction.local_currency_amount_cover) if transaction.local_currency_amount_cover else None,
                "usd_equivalent_amount_cover": float(transaction.usd_equivalent_amount_cover) if transaction.usd_equivalent_amount_cover else None,
                "sub_limit_type": transaction.sub_limit_type,
                "value_date_of_adb_guarantee": transaction.value_date_of_adb_guarantee.isoformat() if transaction.value_date_of_adb_guarantee else None,
                "end_of_risk_period": transaction.end_of_risk_period.isoformat() if transaction.end_of_risk_period else None,
                "tenor": transaction.tenor,
                "expiry_date_of_adb_guarantee": transaction.expiry_date_of_adb_guarantee.isoformat() if transaction.expiry_date_of_adb_guarantee else None,
                "tenor_of_adb_guarantee": transaction.tenor_of_adb_guarantee,
                "guarantee_fee_rate": transaction.guarantee_fee_rate,
                "industry": transaction.industry,
                
                # Add entity details for issuing bank
                "issuing_bank_country": issuing_entity.country if issuing_entity else None,
                "issuing_bank_entity_address": issuing_entity.entity_address if issuing_entity else None,
                "issuing_bank_swift": issuing_entity.swift if issuing_entity else None,
                "issuing_bank_signing_office_branch": issuing_entity.signing_office_branch if issuing_entity else None,
                "issuing_bank_agreement_date": issuing_entity.agreement_date.isoformat() if issuing_entity and issuing_entity.agreement_date else None,
                
                # Add entity details for confirming bank
                "confirming_bank_country": confirming_entity.country if confirming_entity else None,
                "confirming_bank_entity_address": confirming_entity.entity_address if confirming_entity else None,
                "confirming_bank_swift": confirming_entity.swift if confirming_entity else None,
                "confirming_bank_signing_office_branch": confirming_entity.signing_office_branch if confirming_entity else None,
                "confirming_bank_agreement_date": confirming_entity.agreement_date.isoformat() if confirming_entity and confirming_entity.agreement_date else None,
                
                # Add entity details for requesting bank
                "requesting_bank_country": requesting_entity.country if requesting_entity else None,
                "requesting_bank_entity_address": requesting_entity.entity_address if requesting_entity else None,
                "requesting_bank_swift": requesting_entity.swift if requesting_entity else None,
                "requesting_bank_signing_office_branch": requesting_entity.signing_office_branch if requesting_entity else None,
                "requesting_bank_agreement_date": requesting_entity.agreement_date.isoformat() if requesting_entity and requesting_entity.agreement_date else None,
            },
            "entities": entities_data,
            "goods": goods_data
        }
        
        # Add verification check statuses from the latest event
        if event:
            result["transaction"].update({
                "status": event.status,
                "type": event.type,
                "created_at": event.created_at.isoformat() if event.created_at else None,
                "sanction_check_status": event.sanction_check_status,
                "eligibility_check_status": event.eligibility_check_status,
                "limit_check_status": event.limit_check_status,
                "pricing_status": event.pricing_status
            })
        
        print(f"Returning transaction details for ID: {transaction_id}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving transaction details: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving transaction details: {str(e)}")

@app.get("/api/transactions/{transaction_id}/underlying")
def get_transaction_underlying(transaction_id: int, db: Session = Depends(get_db)):
    """
    Retrieve underlying transaction information by transaction ID
    """
    try:
        print(f"Starting underlying transaction API endpoint request for ID: {transaction_id}...")
        
        # Query for the specific transaction
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Query underlying transactions
        underlying_transactions = db.query(Underlying_Transaction).filter(
            Underlying_Transaction.transaction_id == transaction_id
        ).all()
        
        # Format the underlying transactions data
        underlying_data = []
        for ut in underlying_transactions:
            ut_data = {
                "id": ut.id,
                "transaction_id": ut.transaction_id,
                "issuing_bank": ut.issuing_bank,
                "sequence_no": ut.sequence_no,
                "transaction_ref_no": ut.transaction_ref_no,
                "issue_date": ut.issue_date.isoformat() if ut.issue_date else None,
                "maturity_date": ut.maturity_date.isoformat() if ut.maturity_date else None,
                "currency": ut.currency,
                "amount_in_local_currency": ut.amount_in_local_currency,
                "applicant_name": ut.applicant_name,
                "applicant_address": ut.applicant_address,
                "applicant_country": ut.applicant_country,
                "beneficiary_name": ut.beneficiary_name,
                "beneficiary_address": ut.beneficiary_address,
                "beneficiary_country": ut.beneficiary_country,
                "loading_port": ut.loading_port,
                "discharging_port": ut.discharging_port,
                "country_of_origin": ut.country_of_origin,
                "country_of_final_destination": ut.country_of_final_destination,
                "goods": ut.goods,
                "goods_classification": ut.goods_classification,
                "goods_eligible": ut.goods_eligible,
                "es_classification": ut.es_classification,
                "capital_goods": ut.capital_goods,
                "ee_replacement_of_an_old_equipment": ut.ee_replacement_of_an_old_equipment,
                "sustainable_goods": ut.sustainable_goods
            }
            underlying_data.append(ut_data)
        
        # Generate mock data if no underlying transactions found
        if not underlying_data:
            print(f"No underlying transactions found for transaction ID: {transaction_id}")
            # Return empty array instead of mock data
            underlying_data = []
        
        # Return the underlying transactions
        response = {
            "transaction_id": transaction_id,
            "underlying_transactions": underlying_data
        }
        
        print(f"Returning {len(underlying_data)} underlying transactions for ID: {transaction_id}")
        return response
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error retrieving underlying transactions: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error retrieving underlying transactions: {str(e)}")

@app.put("/api/transactions/{transaction_id}")
def update_transaction(transaction_id: int, transaction_data: dict, db: Session = Depends(get_db)):
    """
    Update transaction details
    """
    try:
        print(f"Updating transaction with ID: {transaction_id}")
        print(f"Update data: {transaction_data}")
        
        # Get transaction from database
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Update transaction fields from the request data
        # Only update fields that are provided in the request
        update_fields = [
            'sub_limit_type', 'form_of_eligible_instrument', 'adb_guarantee_trn',
            'confirming_bank_reference_trn', 'issuing_bank_reference_trn',
            'face_amount', 'currency', 'usd_equivalent_amount',
            'usd_equivalent_amount_cover', 'cover', 'guarantee_fee_rate'
        ]
        
        for field in update_fields:
            if field in transaction_data:
                setattr(transaction, field, transaction_data[field])
        
        # Commit changes to the database
        db.commit()
        db.refresh(transaction)
        
        # Return updated transaction data
        return {
            "transaction_id": transaction.transaction_id,
            "message": "Transaction updated successfully"
        }
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        print(f"Error updating transaction: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()  # Rollback the transaction in case of error
        raise HTTPException(status_code=500, detail=f"Error updating transaction: {str(e)}")

@app.put("/api/transactions/{transaction_id}/trading")
def update_transaction_trading(transaction_id: int, trading_data: dict, db: Session = Depends(get_db)):
    """
    Update transaction trading information (underlying transaction details)
    """
    try:
        print(f"Updating trading information for transaction ID: {transaction_id}")
        print(f"Update data: {trading_data}")
        
        # Get transaction from database
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Update transaction fields from the request data
        # Only update fields that are provided in the request
        update_fields = [
            'industry', 'form_of_eligible_instrument', 'date_of_issue',
            'expiry_date', 'terms_of_payment', 'currency',
            'local_currency_amount', 'value_date_of_adb_guarantee',
            'end_of_risk_period', 'tenor', 'expiry_date_of_adb_guarantee',
            'tenor_of_adb_guarantee'
        ]
        
        for field in update_fields:
            if field in trading_data:
                # Handle date fields
                if field.endswith('_date') and trading_data[field]:
                    try:
                        # Try to parse as date
                        setattr(transaction, field, datetime.datetime.fromisoformat(trading_data[field].replace('Z', '+00:00')))
                    except Exception as e:
                        print(f"Error parsing date field {field}: {e}")
                        # Keep as string if parsing fails
                        setattr(transaction, field, trading_data[field])
                else:
                    setattr(transaction, field, trading_data[field])
        
        # If goods data is provided, update trade goods
        if 'goods' in trading_data and isinstance(trading_data['goods'], list):
            # First, delete existing goods for this transaction
            db.query(Transaction_Goods).filter(Transaction_Goods.transaction_id == transaction_id).delete()
            
            # Then add the new/updated goods
            for good in trading_data['goods']:
                new_good = Transaction_Goods(
                    transaction_id=transaction_id,
                    item_name=good.get('name', ''),
                    quantity=good.get('quantity', 0),
                    unit=good.get('unit', ''),
                    goods_classification=good.get('goods_classification', ''),
                    price=good.get('price', '')
                )
                db.add(new_good)
        
        # Commit changes to the database
        db.commit()
        db.refresh(transaction)
        
        # Return updated transaction data
        return {
            "transaction_id": transaction.transaction_id,
            "message": "Trading information updated successfully"
        }
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        print(f"Error updating trading information: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()  # Rollback the transaction in case of error
        raise HTTPException(status_code=500, detail=f"Error updating trading information: {str(e)}")

@app.post("/api/transactions/{transaction_id}/goods")
def add_transaction_good(transaction_id: int, good_data: dict, db: Session = Depends(get_db)):
    """
    Add a new good to a transaction
    """
    try:
        print(f"Adding good for transaction ID: {transaction_id}")
        print(f"Good data: {good_data}")
        
        # Check if transaction exists
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Create new good
        new_good = Transaction_Goods(
            transaction_id=transaction_id,
            item_name=good_data.get('name', ''),
            quantity=good_data.get('quantity', 0),
            unit=good_data.get('unit', ''),
            goods_classification=good_data.get('goods_classification', ''),
            price=good_data.get('price', '')
        )
        
        # Add to database
        db.add(new_good)
        db.commit()
        db.refresh(new_good)
        
        # Return the newly created good
        return {
            "id": new_good.id,
            "transaction_id": new_good.transaction_id,
            "name": new_good.item_name,
            "quantity": new_good.quantity,
            "unit": new_good.unit,
            "goods_classification": new_good.goods_classification,
            "price": new_good.price
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error adding good: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding good: {str(e)}")

@app.put("/api/transactions/{transaction_id}/goods/{good_id}")
def update_transaction_good(transaction_id: int, good_id: int, good_data: dict, db: Session = Depends(get_db)):
    """
    Update an existing good for a transaction
    """
    try:
        print(f"Updating good ID {good_id} for transaction ID: {transaction_id}")
        print(f"Update data: {good_data}")
        
        # Get the good
        good = db.query(Transaction_Goods).filter(
            Transaction_Goods.id == good_id,
            Transaction_Goods.transaction_id == transaction_id
        ).first()
        
        if not good:
            raise HTTPException(status_code=404, detail=f"Good with ID {good_id} not found for transaction {transaction_id}")
        
        # Update fields
        good.item_name = good_data.get('name', good.item_name)
        good.quantity = good_data.get('quantity', good.quantity)
        good.unit = good_data.get('unit', good.unit)
        good.goods_classification = good_data.get('goods_classification', good.goods_classification)
        good.price = good_data.get('price', good.price)
        
        # Commit changes
        db.commit()
        db.refresh(good)
        
        # Return the updated good
        return {
            "id": good.id,
            "transaction_id": good.transaction_id,
            "name": good.item_name,
            "quantity": good.quantity,
            "unit": good.unit,
            "goods_classification": good.goods_classification,
            "price": good.price
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating good: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating good: {str(e)}")

@app.delete("/api/transactions/{transaction_id}/goods/{good_id}")
def delete_transaction_good(transaction_id: int, good_id: int, db: Session = Depends(get_db)):
    """
    Delete a good from a transaction
    """
    try:
        print(f"Deleting good ID {good_id} from transaction ID: {transaction_id}")
        
        # Get the good
        good = db.query(Transaction_Goods).filter(
            Transaction_Goods.id == good_id,
            Transaction_Goods.transaction_id == transaction_id
        ).first()
        
        if not good:
            raise HTTPException(status_code=404, detail=f"Good with ID {good_id} not found for transaction {transaction_id}")
        
        # Delete the good
        db.delete(good)
        db.commit()
        
        # Return success
        return {"message": f"Good with ID {good_id} has been deleted"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error deleting good: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting good: {str(e)}")

# Entity CRUD operations
@app.put("/api/transactions/{transaction_id}/entities")
def update_transaction_entities(transaction_id: int, entity_data: dict, db: Session = Depends(get_db)):
    """
    Update all entities for a transaction
    """
    try:
        print(f"Updating entities for transaction ID: {transaction_id}")
        print(f"Entity data: {entity_data}")
        
        # Get transaction from database
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        if 'entities' not in entity_data or not isinstance(entity_data['entities'], list):
            raise HTTPException(status_code=400, detail="Invalid entities data format")
        
        # First, delete all existing entities for this transaction
        db.query(Transaction_Entity).filter(Transaction_Entity.transaction_id == transaction_id).delete()
        
        # Then add the new entities
        for entity in entity_data['entities']:
            new_entity = Transaction_Entity(
                transaction_id=transaction_id,
                name=entity.get('name', ''),
                type=entity.get('type', ''),
                address=entity.get('address', ''),
                country=entity.get('country', '')
            )
            db.add(new_entity)
        
        # Commit changes to the database
        db.commit()
        
        # Return updated entities
        updated_entities = db.query(Transaction_Entity).filter(
            Transaction_Entity.transaction_id == transaction_id
        ).all()
        
        result = []
        for entity in updated_entities:
            result.append({
                "id": entity.id,
                "transaction_id": entity.transaction_id,
                "name": entity.name,
                "type": entity.type,
                "address": entity.address,
                "country": entity.country
            })
        
        return {"entities": result}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating entities: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating entities: {str(e)}")

@app.post("/api/transactions/{transaction_id}/entities")
def add_transaction_entity(transaction_id: int, entity_data: dict, db: Session = Depends(get_db)):
    """
    Add a new entity to a transaction
    """
    try:
        print(f"Adding entity for transaction ID: {transaction_id}")
        print(f"Entity data: {entity_data}")
        
        # Check if transaction exists
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
        
        # Create new entity
        new_entity = Transaction_Entity(
            transaction_id=transaction_id,
            name=entity_data.get('name', ''),
            type=entity_data.get('type', ''),
            address=entity_data.get('address', ''),
            country=entity_data.get('country', '')
        )
        
        # Add to database
        db.add(new_entity)
        db.commit()
        db.refresh(new_entity)
        
        # Return the newly created entity
        return {
            "id": new_entity.id,
            "transaction_id": new_entity.transaction_id,
            "name": new_entity.name,
            "type": new_entity.type,
            "address": new_entity.address,
            "country": new_entity.country
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error adding entity: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding entity: {str(e)}")

@app.put("/api/transactions/{transaction_id}/entities/{entity_id}")
def update_transaction_entity(transaction_id: int, entity_id: int, entity_data: dict, db: Session = Depends(get_db)):
    """
    Update an existing entity for a transaction
    """
    try:
        print(f"Updating entity ID {entity_id} for transaction ID: {transaction_id}")
        print(f"Update data: {entity_data}")
        
        # Get the entity
        entity = db.query(Transaction_Entity).filter(
            Transaction_Entity.id == entity_id,
            Transaction_Entity.transaction_id == transaction_id
        ).first()
        
        if not entity:
            raise HTTPException(status_code=404, detail=f"Entity with ID {entity_id} not found for transaction {transaction_id}")
        
        # Update fields
        entity.name = entity_data.get('name', entity.name)
        entity.type = entity_data.get('type', entity.type)
        entity.address = entity_data.get('address', entity.address)
        entity.country = entity_data.get('country', entity.country)
        
        # Commit changes
        db.commit()
        db.refresh(entity)
        
        # Return the updated entity
        return {
            "id": entity.id,
            "transaction_id": entity.transaction_id,
            "name": entity.name,
            "type": entity.type,
            "address": entity.address,
            "country": entity.country
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating entity: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating entity: {str(e)}")

@app.delete("/api/transactions/{transaction_id}/entities/{entity_id}")
def delete_transaction_entity(transaction_id: int, entity_id: int, db: Session = Depends(get_db)):
    """
    Delete an entity from a transaction
    """
    try:
        print(f"Deleting entity ID {entity_id} from transaction ID: {transaction_id}")
        
        # Get the entity
        entity = db.query(Transaction_Entity).filter(
            Transaction_Entity.id == entity_id,
            Transaction_Entity.transaction_id == transaction_id
        ).first()
        
        if not entity:
            raise HTTPException(status_code=404, detail=f"Entity with ID {entity_id} not found for transaction {transaction_id}")
        
        # Delete the entity
        db.delete(entity)
        db.commit()
        
        # Return success
        return {"message": f"Entity with ID {entity_id} has been deleted"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error deleting entity: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting entity: {str(e)}")

@app.put("/api/transactions/{transaction_id}/verification-checks")
def update_verification_checks(transaction_id: int, check_data: dict, db: Session = Depends(get_db)):
    """
    Update verification check statuses for a transaction's event
    """
    try:
        # Find the latest event for this transaction
        event = db.query(Event).filter(Event.transaction_id == transaction_id).order_by(desc(Event.created_at)).first()
        
        if not event:
            raise HTTPException(status_code=404, detail=f"No events found for transaction {transaction_id}")
        
        # Update the event's verification check statuses
        if "sanction_check_status" in check_data:
            event.sanction_check_status = check_data["sanction_check_status"]
        
        if "eligibility_check_status" in check_data:
            event.eligibility_check_status = check_data["eligibility_check_status"]
        
        if "limit_check_status" in check_data:
            event.limit_check_status = check_data["limit_check_status"]
        
        if "pricing_status" in check_data:
            event.pricing_status = check_data["pricing_status"]
        
        # Commit changes to the database
        db.commit()
        
        # Return the updated event data
        return {
            "event_id": event.event_id,
            "transaction_id": event.transaction_id,
            "sanction_check_status": event.sanction_check_status,
            "eligibility_check_status": event.eligibility_check_status,
            "limit_check_status": event.limit_check_status,
            "pricing_status": event.pricing_status
        }
        
    except Exception as e:
        print(f"Error updating verification checks: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating verification checks: {str(e)}")

@app.get("/api/transactions/{transaction_id}/sanctions-check")
def get_transaction_sanctions_check(transaction_id: int, db: Session = Depends(get_db)):
    """
    Perform sanctions check on all entities associated with a transaction
    """
    try:
        print(f"Starting sanctions check for transaction {transaction_id}")
        
        # Get transaction entities
        transaction_entities = db.query(Transaction_Entity).filter(
            Transaction_Entity.transaction_id == transaction_id
        ).all()
        
        if not transaction_entities:
            return {"error": "No entities found for this transaction"}
        
        # Convert entities to dict format for checking
        entities_for_check = []
        for entity in transaction_entities:
            entities_for_check.append({
                "name": entity.name,
                "type": entity.type,
                "address": entity.address,
                "country": entity.country,
                "id": entity.id
            })
        
        # Perform sanctions check
        check_results = check_transaction_entities(entities_for_check)
        
        # Format results
        formatted_results = []
        for entity in transaction_entities:
            entity_name = entity.name
            entity_result = check_results.get(entity_name, {"status": "Not Checked", "matches": []})
            
            formatted_results.append({
                "entity_id": entity.id,
                "entity_name": entity_name,
                "entity_type": entity.type,
                "entity_address": entity.address,
                "entity_country": entity.country,
                "match_status": entity_result["status"],
                "matches": entity_result.get("matches", []),
                "check_timestamp": entity_result.get("check_timestamp", datetime.datetime.utcnow().isoformat())
            })
        
        # Update the event's sanction_check_status if there is a relevant event
        event = db.query(Event).filter(
            Event.transaction_id == transaction_id
        ).order_by(desc(Event.created_at)).first()
        
        if event:
            # Set status based on results - if any entity is "Reviewed", set overall status to "REVIEW"
            if any(result["match_status"] == "Reviewed" for result in formatted_results):
                event.sanction_check_status = "REVIEW"
            else:
                event.sanction_check_status = "CLEARED"
            
            db.commit()
            print(f"Updated event sanction_check_status to {event.sanction_check_status}")
        
        return formatted_results
    except Exception as e:
        print(f"Error performing sanctions check: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error performing sanctions check: {str(e)}")

@app.put("/api/transactions/{transaction_id}/sanctions-check")
def update_transaction_sanctions_check(transaction_id: int, entity_decisions: dict, db: Session = Depends(get_db)):
    """
    Update the sanctions check status for entities in a transaction
    """
    try:
        # Check if transaction exists
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Get the event for this transaction
        event = db.query(Event).filter(
            Event.transaction_id == transaction_id
        ).order_by(desc(Event.created_at)).first()
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found for this transaction")
        
        # Update the sanction check status
        event.sanction_check_status = entity_decisions.get("overall_status", "REVIEW")
        
        # Commit changes
        db.commit()
        
        return {"message": "Sanctions check status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating sanctions check status: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating sanctions check status: {str(e)}")

@app.get("/api/transactions/{transaction_id}/limit-check")
def check_transaction_limits(transaction_id: int, db: Session = Depends(get_db)):
    """
    Check a transaction's impact on program, country, entity, and facility limits
    without updating limit utilizations
    """
    try:
        print(f"Starting limit check for transaction {transaction_id}")
        
        # Get transaction
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail=f"Transaction {transaction_id} not found")
        
        # Get transaction amount in USD
        transaction_amount_usd = transaction.usd_equivalent_amount if transaction.usd_equivalent_amount else 0
        
        # Initialize results structure
        limit_check_results = {
            "transaction_amount_usd": float(transaction_amount_usd),
            "program_limit_check": {},
            "country_limit_check": {},
            "entity_limit_checks": [],
            "facility_limit_checks": []
        }
        
        # Check Program Limit
        program_limits = get_program_limits(db)
        limit_check_results["program_limit_check"] = {
            "total_program_approved_limit": program_limits["total_program_approved_limit"],
            "total_utilized": program_limits["total_utilized"],
            "available_program_limit": program_limits["available_program_limit"],
            "current_utilization_percentage": program_limits["utilization_percentage"],
            "transaction_amount": float(transaction_amount_usd),
            "post_transaction_utilization": float(program_limits["total_utilized"]) + float(transaction_amount_usd),
            "post_transaction_available": float(program_limits["available_program_limit"]) - float(transaction_amount_usd),
            "post_transaction_percentage": ((float(program_limits["total_utilized"]) + float(transaction_amount_usd)) / 
                                           float(program_limits["total_program_approved_limit"])) * 100,
            "impact_amount": float(transaction_amount_usd),
            "impact_percentage": (float(transaction_amount_usd) / float(program_limits["total_program_approved_limit"])) * 100,
            "status": "PASSED" if float(program_limits["available_program_limit"]) >= float(transaction_amount_usd) else "WARNING"
        }
        
        # Check Country Limit
        if transaction.country:
            try:
                country_limits = get_country_limits(transaction.country, db)
                limit_check_results["country_limit_check"] = {
                    "country": transaction.country,
                    "total_country_approved_limit": country_limits["total_country_approved_limit"],
                    "total_utilized": country_limits["total_utilized"],
                    "available_country_limit": country_limits["available_country_limit"],
                    "current_utilization_percentage": country_limits["utilization_percentage"],
                    "transaction_amount": float(transaction_amount_usd),
                    "post_transaction_utilization": float(country_limits["total_utilized"]) + float(transaction_amount_usd),
                    "post_transaction_available": float(country_limits["available_country_limit"]) - float(transaction_amount_usd),
                    "post_transaction_percentage": ((float(country_limits["total_utilized"]) + float(transaction_amount_usd)) / 
                                                  float(country_limits["total_country_approved_limit"])) * 100,
                    "impact_amount": float(transaction_amount_usd),
                    "impact_percentage": (float(transaction_amount_usd) / float(country_limits["total_country_approved_limit"])) * 100,
                    "status": "PASSED" if float(country_limits["available_country_limit"]) >= float(transaction_amount_usd) else "WARNING"
                }
            except Exception as e:
                print(f"Could not check country limits for {transaction.country}: {str(e)}")
                limit_check_results["country_limit_check"] = {"error": f"Could not check country limits: {str(e)}"}
        
        # Check Entity Limits - Only for issuing bank
        entity_names = []
        if transaction.issuing_bank:
            entity_names.append(transaction.issuing_bank)
        
        for entity_name in entity_names:
            try:
                entity = db.query(Entity).filter(Entity.entity_name == entity_name).first()
                if not entity:
                    continue
                
                entity_limits = db.query(EntityLimit).filter(EntityLimit.entity_name == entity_name).all()
                
                entity_limit_check = {
                    "entity_name": entity_name,
                    "entity_type": "Issuing Bank",
                    "facility_limit_checks": [],
                    "total_approved_limit": 0,
                    "total_utilized": 0,
                    "available_limit": 0,
                    "current_utilization_percentage": 0
                }
                
                # Get the transaction's product type (sub_limit_type)
                transaction_product = transaction.sub_limit_type.lower() if transaction.sub_limit_type else None
                
                # Calculate the entity-level totals first
                total_approved_limit = 0
                total_utilized = 0
                for limit in entity_limits:
                    total_approved_limit += float(limit.approved_limit if limit.approved_limit else 0)
                    utilized = float(limit.pfi_rpa_allocation if limit.pfi_rpa_allocation else 0) + float(limit.outstanding_exposure if limit.outstanding_exposure else 0)
                    total_utilized += utilized
                
                entity_limit_check["total_approved_limit"] = total_approved_limit
                entity_limit_check["total_utilized"] = total_utilized
                entity_limit_check["available_limit"] = total_approved_limit - total_utilized
                entity_limit_check["current_utilization_percentage"] = (total_utilized / total_approved_limit) * 100 if total_approved_limit > 0 else 0
                entity_limit_check["transaction_amount"] = float(transaction_amount_usd)
                entity_limit_check["post_transaction_utilization"] = total_utilized + float(transaction_amount_usd)
                entity_limit_check["post_transaction_available"] = entity_limit_check["available_limit"] - float(transaction_amount_usd)
                entity_limit_check["post_transaction_percentage"] = (entity_limit_check["post_transaction_utilization"] / total_approved_limit) * 100 if total_approved_limit > 0 else 0
                entity_limit_check["impact_amount"] = float(transaction_amount_usd)
                entity_limit_check["impact_percentage"] = (float(transaction_amount_usd) / total_approved_limit) * 100 if total_approved_limit > 0 else 0
                
                # Check each facility limit for this entity (but only include ones that match the product)
                matching_facility_found = False
                for limit in entity_limits:
                    # Check if this facility matches the transaction's product type
                    is_matching_sublimit = False
                    if transaction_product and limit.facility_limit:
                        is_matching_sublimit = transaction_product in limit.facility_limit.lower()
                    
                    # Skip facilities that don't match the transaction product
                    if not is_matching_sublimit:
                        continue
                    
                    matching_facility_found = True
                    
                    # Calculate available limit
                    available_limit = (
                        float(limit.approved_limit if limit.approved_limit else 0) - 
                        float(limit.pfi_rpa_allocation if limit.pfi_rpa_allocation else 0) - 
                        float(limit.outstanding_exposure if limit.outstanding_exposure else 0)
                    )
                    
                    net_available_limit = (
                        available_limit - 
                        float(limit.earmark_limit if limit.earmark_limit else 0)
                    )
                    
                    # Calculate utilization percentage
                    utilized = float(limit.pfi_rpa_allocation if limit.pfi_rpa_allocation else 0) + float(limit.outstanding_exposure if limit.outstanding_exposure else 0)
                    utilization_percentage = (utilized / float(limit.approved_limit)) * 100 if limit.approved_limit and float(limit.approved_limit) > 0 else 0
                    
                    # Check if transaction fits within this facility's available limit
                    facility_status = "PASSED" if net_available_limit >= float(transaction_amount_usd) else "WARNING"
                    
                    facility_limit_check = {
                        "facility_limit": limit.facility_limit,
                        "approved_limit": float(limit.approved_limit) if limit.approved_limit else 0,
                        "pfi_rpa_allocation": float(limit.pfi_rpa_allocation) if limit.pfi_rpa_allocation else 0,
                        "outstanding_exposure": float(limit.outstanding_exposure) if limit.outstanding_exposure else 0,
                        "earmark_limit": float(limit.earmark_limit) if limit.earmark_limit else 0,
                        "available_limit": available_limit,
                        "net_available_limit": net_available_limit,
                        "current_utilization": utilized,
                        "current_utilization_percentage": utilization_percentage,
                        "transaction_amount": float(transaction_amount_usd),
                        "post_transaction_utilization": utilized + float(transaction_amount_usd),
                        "post_transaction_available": net_available_limit - float(transaction_amount_usd),
                        "post_transaction_percentage": ((utilized + float(transaction_amount_usd)) / 
                                                      float(limit.approved_limit)) * 100 if limit.approved_limit and float(limit.approved_limit) > 0 else 0,
                        "impact_amount": float(transaction_amount_usd),
                        "impact_percentage": (float(transaction_amount_usd) / float(limit.approved_limit)) * 100 if limit.approved_limit and float(limit.approved_limit) > 0 else 0,
                        "is_matching_sublimit": is_matching_sublimit,
                        "status": facility_status
                    }
                    
                    # Add to facility limit checks
                    entity_limit_check["facility_limit_checks"].append(facility_limit_check)
                    
                    # Also add to the flat list for easier access
                    facility_limit_check_copy = facility_limit_check.copy()
                    facility_limit_check_copy["entity_name"] = entity_name
                    facility_limit_check_copy["entity_type"] = entity_limit_check["entity_type"]
                    limit_check_results["facility_limit_checks"].append(facility_limit_check_copy)
                
                # Add overall status for this entity
                if entity_limit_check["facility_limit_checks"]:
                    overall_status = all(check["status"] == "PASSED" for check in entity_limit_check["facility_limit_checks"])
                    entity_limit_check["overall_status"] = "PASSED" if overall_status else "WARNING"
                else:
                    # If no matching facilities were found, make this more clear in the response
                    if matching_facility_found:
                        entity_limit_check["overall_status"] = "WARNING"  # No limits defined
                    else:
                        entity_limit_check["overall_status"] = "WARNING"
                        entity_limit_check["no_matching_facilities"] = True
                
                # Add to entity limit checks
                limit_check_results["entity_limit_checks"].append(entity_limit_check)
                
            except Exception as e:
                print(f"Could not check entity limits for {entity_name}: {str(e)}")
                limit_check_results["entity_limit_checks"].append({
                    "entity_name": entity_name, 
                    "entity_type": "Issuing Bank",
                    "error": f"Could not check entity limits: {str(e)}"
                })
        
        # Determine overall limit check status
        has_warnings = (
            limit_check_results["program_limit_check"].get("status") == "WARNING" or
            limit_check_results["country_limit_check"].get("status") == "WARNING" or
            any(check.get("overall_status") == "WARNING" for check in limit_check_results["entity_limit_checks"])
        )
        
        limit_check_results["overall_status"] = "WARNING" if has_warnings else "PASSED"
        
        # Update the transaction's limit_check_status in the event
        event = db.query(Event).filter(Event.transaction_id == transaction_id).order_by(desc(Event.created_at)).first()
        if event:
            event.limit_check_status = limit_check_results["overall_status"]
            db.commit()
        
        print(f"Completed limit check for transaction {transaction_id}")
        return limit_check_results
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error checking transaction limits: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error checking transaction limits: {str(e)}")