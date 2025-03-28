from tortoise import fields, models
from enum import Enum
from datetime import datetime
from typing import Optional

class TransactionEvent(str, Enum):
    INQUIRY = "INQUIRY"
    REQUEST = "REQUEST"
    AMENDMENT = "AMENDMENT"
    RDA_PROCESS = "RDA_PROCESS"
    CLOSURE = "CLOSURE"

class TransactionStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    PROCESSING = "PROCESSING"
    APPROVED = "APPROVED"
    DECLINED = "DECLINED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    AMENDED = "AMENDED"
    EXPIRED = "EXPIRED"

class Transaction(models.Model):
    id = fields.IntField(pk=True)
    reference_number = fields.CharField(max_length=100, unique=True)
    inquiry_reference = fields.CharField(max_length=100, null=True)
    event_type = fields.CharEnumField(TransactionEvent)
    status = fields.CharEnumField(TransactionStatus, default=TransactionStatus.DRAFT)
    
    # Relationship fields
    product = fields.ForeignKeyField('models.Product', related_name='transactions')
    client = fields.ForeignKeyField('models.Client', related_name='transactions')
    counterparty = fields.ForeignKeyField('models.Client', related_name='counterparty_transactions', null=True)
    
    # Transaction details
    amount = fields.DecimalField(max_digits=20, decimal_places=2)
    currency = fields.CharField(max_length=3, default="USD")
    maturity_date = fields.DateField(null=True)
    pricing_rate = fields.DecimalField(max_digits=10, decimal_places=4, null=True)
    
    # Tracking fields
    request_date = fields.DatetimeField(default=datetime.now)
    approval_date = fields.DatetimeField(null=True)
    completion_date = fields.DatetimeField(null=True)
    
    # Service check results
    sanctions_check_passed = fields.BooleanField(null=True)
    eligibility_check_passed = fields.BooleanField(null=True)
    limits_check_passed = fields.BooleanField(null=True)
    exposure_check_passed = fields.BooleanField(null=True)
    
    # Documents and notes
    documents = fields.JSONField(null=True)
    notes = fields.TextField(null=True)
    
    # System fields
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "transactions"

    def __str__(self):
        return f"{self.reference_number} - {self.client.name} - {self.amount} {self.currency}" 