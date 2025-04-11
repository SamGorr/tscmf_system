from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database.database import Base

class Transaction(Base):
    __tablename__ = "transaction"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    country = Column(String)
    issuing_bank = Column(String, ForeignKey("entity.entity_name"))
    confirming_bank = Column(String, ForeignKey("entity.entity_name"))
    requesting_bank = Column(String, ForeignKey("entity.entity_name"))
    adb_guarantee_trn = Column(String)
    confirming_bank_reference_trn = Column(String)
    issuing_bank_reference_trn = Column(String)
    form_of_eligible_instrument = Column(String)
    face_amount = Column(Float)
    date_of_issue = Column(DateTime)
    expiry_date = Column(DateTime)
    terms_of_payment = Column(String)
    currency = Column(String)
    local_currency_amount = Column(Float)
    usd_equivalent_amount = Column(Float)
    book_rate = Column(Float)
    cover = Column(Float)
    local_currency_amount_cover = Column(Float)
    usd_equivalent_amount_cover = Column(Float)
    sub_limit_type = Column(String)
    value_date_of_adb_guarantee = Column(DateTime)
    end_of_risk_period = Column(DateTime)
    tenor = Column(String)
    expiry_date_of_adb_guarantee = Column(DateTime)
    tenor_of_adb_guarantee = Column(String)
    guarantee_fee_rate = Column(Float)
    
    events = relationship("Event", backref="transaction")
    transaction_entities = relationship("Transaction_Entity", backref="transaction")
    transaction_goods = relationship("Transaction_Goods", backref="transaction")
    issuing_entity = relationship("Entity", foreign_keys=[issuing_bank], backref="issued_transactions")
    confirming_entity = relationship("Entity", foreign_keys=[confirming_bank], backref="confirmed_transactions")
    requesting_entity = relationship("Entity", foreign_keys=[requesting_bank], backref="requested_transactions")

class Event(Base):
    __tablename__ = "event"

    event_id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id"))
    source = Column(String)
    email_from = Column(String)
    email_to = Column(String)
    email_subject = Column(String)
    email_body = Column(String)
    email_date = Column(DateTime)
    type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String)

class Entity(Base):
    __tablename__ = "entity"

    entity_id = Column(Integer)
    entity_name = Column(String, primary_key=True)
    swift = Column(String)
    entity_address = Column(String)
    country = Column(String)
    signing_office_branch = Column(String)
    agreement_date = Column(DateTime)

class Transaction_Entity(Base):
    __tablename__ = "transaction_entity"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id"))
    type = Column(String)
    address = Column(String)
    country = Column(String)

class Transaction_Goods(Base):
    __tablename__ = "transaction_goods"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id"))
    item_name = Column(String)
    quantity = Column(Integer)
    unit = Column(String)