from tortoise import fields, models
from enum import Enum
from typing import Optional

class ClientType(str, Enum):
    PARTICIPATING_FINANCIAL_INSTITUTION = "PFI"
    OBLIGOR = "OBLIGOR"
    ISSUING_BANK = "ISSUING_BANK"
    CONFIRMING_BANK = "CONFIRMING_BANK"
    MICROFINANCE_INSTITUTION = "MFI"

class Client(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    code = fields.CharField(max_length=100, unique=True)
    client_type = fields.CharEnumField(ClientType)
    country = fields.CharField(max_length=100)
    sector = fields.CharField(max_length=100, null=True)
    address = fields.TextField(null=True)
    contact_person = fields.CharField(max_length=255, null=True)
    contact_email = fields.CharField(max_length=255, null=True)
    contact_phone = fields.CharField(max_length=50, null=True)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "clients"

    def __str__(self):
        return f"{self.name} ({self.client_type})" 