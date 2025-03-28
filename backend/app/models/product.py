from tortoise import fields, models
from enum import Enum

class ProductCategory(str, Enum):
    TRADE_FINANCE = "TRADE_FINANCE"
    SUPPLY_CHAIN = "SUPPLY_CHAIN"
    MICROFINANCE = "MICROFINANCE"
    RISK_DISTRIBUTION = "RISK_DISTRIBUTION"

class ProductType(str, Enum):
    CREDIT_GUARANTEE = "CG"
    REVOLVING_CREDIT_FACILITY = "RCF"
    UNFUNDED_RISK_PARTICIPATION = "URPA"
    FUNDED_RISK_PARTICIPATION = "FRPA"
    PARTIAL_GUARANTEE_FACILITY = "PGFA"
    RISK_DISTRIBUTION_AGREEMENT = "RDA"

class Product(models.Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    code = fields.CharField(max_length=50, unique=True)
    product_type = fields.CharEnumField(ProductType)
    category = fields.CharEnumField(ProductCategory)
    description = fields.TextField(null=True)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "products"

    def __str__(self):
        return f"{self.name} ({self.product_type})" 