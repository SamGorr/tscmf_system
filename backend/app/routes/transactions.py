from fastapi import APIRouter, HTTPException, Depends, Query
from tortoise.exceptions import DoesNotExist
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, date
from app.models.transaction import Transaction, TransactionEvent, TransactionStatus
from app.models.client import Client
from app.models.product import Product
import uuid

router = APIRouter()

# Pydantic models for request/response validation
class TransactionBase(BaseModel):
    event_type: TransactionEvent
    product_id: int
    client_id: int
    counterparty_id: Optional[int] = None
    amount: float
    currency: str = "USD"
    maturity_date: Optional[date] = None
    inquiry_reference: Optional[str] = None
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    status: Optional[TransactionStatus] = None
    amount: Optional[float] = None
    maturity_date: Optional[date] = None
    pricing_rate: Optional[float] = None
    notes: Optional[str] = None
    sanctions_check_passed: Optional[bool] = None
    eligibility_check_passed: Optional[bool] = None
    limits_check_passed: Optional[bool] = None
    exposure_check_passed: Optional[bool] = None

class TransactionResponse(TransactionBase):
    id: int
    reference_number: str
    status: TransactionStatus
    pricing_rate: Optional[float] = None
    request_date: datetime
    approval_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    sanctions_check_passed: Optional[bool] = None
    eligibility_check_passed: Optional[bool] = None
    limits_check_passed: Optional[bool] = None
    exposure_check_passed: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

@router.post("/", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate):
    # Check if client exists
    client = await Client.filter(id=transaction.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client with ID {transaction.client_id} not found")
    
    # Check if product exists
    product = await Product.filter(id=transaction.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID {transaction.product_id} not found")
    
    # Check if counterparty exists if provided
    if transaction.counterparty_id:
        counterparty = await Client.filter(id=transaction.counterparty_id).first()
        if not counterparty:
            raise HTTPException(status_code=404, detail=f"Counterparty with ID {transaction.counterparty_id} not found")
    
    # Generate unique reference number
    reference_number = f"TX-{uuid.uuid4().hex[:8].upper()}"
    
    # Create transaction
    transaction_data = transaction.dict()
    transaction_data["reference_number"] = reference_number
    transaction_data["status"] = TransactionStatus.SUBMITTED
    
    transaction_obj = await Transaction.create(**transaction_data)
    return await TransactionResponse.from_tortoise_orm(transaction_obj)

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    client_id: Optional[int] = None,
    product_id: Optional[int] = None,
    status: Optional[TransactionStatus] = None,
    event_type: Optional[TransactionEvent] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    query = Transaction.all().prefetch_related("client", "product", "counterparty")
    
    if client_id:
        query = query.filter(client_id=client_id)
    if product_id:
        query = query.filter(product_id=product_id)
    if status:
        query = query.filter(status=status)
    if event_type:
        query = query.filter(event_type=event_type)
    if start_date:
        query = query.filter(request_date__gte=start_date)
    if end_date:
        query = query.filter(request_date__lte=end_date)
    
    return await TransactionResponse.from_queryset(query)

@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: int):
    try:
        return await TransactionResponse.from_queryset_single(
            Transaction.get(id=transaction_id).prefetch_related("client", "product", "counterparty")
        )
    except DoesNotExist:
        raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(transaction_id: int, transaction: TransactionUpdate):
    try:
        # Check if transaction exists
        await Transaction.get(id=transaction_id)
        
        # Update transaction
        await Transaction.filter(id=transaction_id).update(**transaction.dict(exclude_unset=True, exclude_none=True))
        
        # If status is changing to APPROVED, set approval_date
        if transaction.status == TransactionStatus.APPROVED:
            await Transaction.filter(id=transaction_id).update(approval_date=datetime.now())
        
        # If status is changing to COMPLETED, set completion_date
        if transaction.status == TransactionStatus.COMPLETED:
            await Transaction.filter(id=transaction_id).update(completion_date=datetime.now())
        
        return await TransactionResponse.from_queryset_single(
            Transaction.get(id=transaction_id).prefetch_related("client", "product", "counterparty")
        )
    except DoesNotExist:
        raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: int):
    deleted_count = await Transaction.filter(id=transaction_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found")
    return {"message": f"Transaction with ID {transaction_id} deleted successfully"}

@router.post("/{transaction_id}/process", response_model=TransactionResponse)
async def process_transaction(transaction_id: int):
    """
    Simulates the processing of a transaction through the various service checks
    In a real implementation, this would call the actual services
    """
    try:
        transaction = await Transaction.get(id=transaction_id)
        
        # Update status to PROCESSING
        transaction.status = TransactionStatus.PROCESSING
        await transaction.save()
        
        # Simulate service checks (in real implementation, these would be actual calls)
        # For now, we'll just randomly set them to True or False
        import random
        sanctions_passed = True  # Always pass sanctions for demo
        eligibility_passed = random.choice([True, True, True, False])  # 75% pass rate
        limits_passed = random.choice([True, True, False])  # 67% pass rate
        exposure_passed = random.choice([True, True, True, False])  # 75% pass rate
        
        # Update transaction with check results
        transaction.sanctions_check_passed = sanctions_passed
        transaction.eligibility_check_passed = eligibility_passed
        transaction.limits_check_passed = limits_passed
        transaction.exposure_check_passed = exposure_passed
        
        # Determine overall result
        if all([sanctions_passed, eligibility_passed, limits_passed, exposure_passed]):
            transaction.status = TransactionStatus.APPROVED
            transaction.approval_date = datetime.now()
        else:
            transaction.status = TransactionStatus.DECLINED
        
        await transaction.save()
        
        return await TransactionResponse.from_tortoise_orm(transaction)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail=f"Transaction with ID {transaction_id} not found") 