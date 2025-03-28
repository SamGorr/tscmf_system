from app.models.transaction import Transaction, TransactionStatus, TransactionEvent
from app.models.client import Client
from app.models.product import Product
from datetime import datetime
import uuid
import random
from typing import Dict, Any, Optional

class TransactionService:
    @staticmethod
    async def create_inquiry(
        client_id: int,
        product_id: int,
        amount: float,
        currency: str = "USD",
        maturity_date: Optional[datetime] = None,
        counterparty_id: Optional[int] = None,
        notes: Optional[str] = None
    ) -> Transaction:
        """
        Create a new inquiry transaction
        """
        # Generate unique reference number
        reference_number = f"INQ-{uuid.uuid4().hex[:8].upper()}"
        
        # Create transaction
        transaction = await Transaction.create(
            reference_number=reference_number,
            event_type=TransactionEvent.INQUIRY,
            status=TransactionStatus.SUBMITTED,
            client_id=client_id,
            product_id=product_id,
            counterparty_id=counterparty_id,
            amount=amount,
            currency=currency,
            maturity_date=maturity_date,
            notes=notes
        )
        
        # Here we would call various services
        await TransactionService._process_service_checks(transaction)
        
        return transaction
    
    @staticmethod
    async def create_transaction_request(
        client_id: int,
        product_id: int,
        amount: float,
        currency: str = "USD",
        maturity_date: Optional[datetime] = None,
        counterparty_id: Optional[int] = None,
        inquiry_reference: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Transaction:
        """
        Create a new transaction request
        """
        # If there's an inquiry reference, check if it exists
        inquiry = None
        if inquiry_reference:
            inquiry = await Transaction.filter(
                reference_number=inquiry_reference,
                event_type=TransactionEvent.INQUIRY,
                status=TransactionStatus.APPROVED
            ).first()
            
            if not inquiry:
                raise ValueError(f"No approved inquiry found with reference number {inquiry_reference}")
        
        # Generate unique reference number
        reference_number = f"TRX-{uuid.uuid4().hex[:8].upper()}"
        
        # Create transaction
        transaction_data = {
            "reference_number": reference_number,
            "event_type": TransactionEvent.REQUEST,
            "status": TransactionStatus.SUBMITTED,
            "client_id": client_id,
            "product_id": product_id,
            "counterparty_id": counterparty_id,
            "amount": amount,
            "currency": currency,
            "maturity_date": maturity_date,
            "notes": notes
        }
        
        if inquiry:
            transaction_data["inquiry_reference"] = inquiry_reference
            # Copy some data from inquiry if available
            transaction_data["pricing_rate"] = inquiry.pricing_rate
        
        transaction = await Transaction.create(**transaction_data)
        
        # If there's no inquiry, we need to run service checks
        if not inquiry:
            await TransactionService._process_service_checks(transaction)
        else:
            # If there is an inquiry, we copy the service check results
            transaction.sanctions_check_passed = inquiry.sanctions_check_passed
            transaction.eligibility_check_passed = inquiry.eligibility_check_passed
            transaction.limits_check_passed = inquiry.limits_check_passed
            transaction.exposure_check_passed = inquiry.exposure_check_passed
            
            # Determine status based on the service check results
            if all([
                transaction.sanctions_check_passed, 
                transaction.eligibility_check_passed,
                transaction.limits_check_passed,
                transaction.exposure_check_passed
            ]):
                transaction.status = TransactionStatus.APPROVED
                transaction.approval_date = datetime.now()
            
            await transaction.save()
        
        return transaction
    
    @staticmethod
    async def create_amendment(
        original_transaction_id: int,
        amount: Optional[float] = None,
        maturity_date: Optional[datetime] = None,
        notes: Optional[str] = None
    ) -> Transaction:
        """
        Create a transaction amendment
        """
        # Get the original transaction
        original = await Transaction.get(id=original_transaction_id)
        
        if original.status not in [TransactionStatus.APPROVED, TransactionStatus.COMPLETED]:
            raise ValueError("Can only amend approved or completed transactions")
        
        # Generate unique reference number
        reference_number = f"AMD-{uuid.uuid4().hex[:8].upper()}"
        
        # Create amendment using data from original transaction
        transaction_data = {
            "reference_number": reference_number,
            "event_type": TransactionEvent.AMENDMENT,
            "status": TransactionStatus.SUBMITTED,
            "client_id": original.client_id,
            "product_id": original.product_id,
            "counterparty_id": original.counterparty_id,
            "amount": amount if amount is not None else original.amount,
            "currency": original.currency,
            "maturity_date": maturity_date if maturity_date is not None else original.maturity_date,
            "notes": notes if notes is not None else original.notes,
            "inquiry_reference": original.reference_number
        }
        
        transaction = await Transaction.create(**transaction_data)
        
        # Run service checks for the amendment
        await TransactionService._process_service_checks(transaction)
        
        return transaction
    
    @staticmethod
    async def close_transaction(transaction_id: int) -> Transaction:
        """
        Close a transaction
        """
        transaction = await Transaction.get(id=transaction_id)
        
        if transaction.status != TransactionStatus.APPROVED:
            raise ValueError("Only approved transactions can be closed")
        
        # Update transaction status
        transaction.status = TransactionStatus.COMPLETED
        transaction.completion_date = datetime.now()
        await transaction.save()
        
        # Here we would call various services to release limits, etc.
        
        return transaction
    
    @staticmethod
    async def _process_service_checks(transaction: Transaction) -> None:
        """
        Process all service checks for a transaction
        In a real implementation, this would call the actual services
        """
        # Update status to PROCESSING
        transaction.status = TransactionStatus.PROCESSING
        await transaction.save()
        
        # Simulate service checks (in real implementation, these would be actual calls)
        # For simplicity, we'll simulate all checks to pass
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