from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database.database import Base

class Transaction(Base):
    __tablename__ = "transaction"

    created_at = Column(DateTime, default=datetime.utcnow)
    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(Integer, ForeignKey("entity.entity_id"))
    product_id = Column(Integer)
    product_name = Column(String)
    industry = Column(String)
    amount = Column(Float)
    currency = Column(String)
    country = Column(String)
    location = Column(String)
    beneficiary = Column(String)
    tenor = Column(Integer)
    maturity_date = Column(DateTime)
    price = Column(Float)
    
    events = relationship("Event", backref="transaction")
    transaction_entities = relationship("Transaction_Entity", backref="transaction")
    transaction_goods = relationship("Transaction_Goods", backref="transaction")

class Event(Base):
    __tablename__ = "event"

    event_id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id"))
    entity_id = Column(Integer, ForeignKey("entity.entity_id"))
    source = Column(String)
    source_content = Column(String)
    type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String)

class Entity(Base):
    __tablename__ = "entity"

    entity_id = Column(Integer, primary_key=True, autoincrement=True)
    entity_name = Column(String)
    entity_address = Column(String)
    country = Column(String)
    client_type = Column(String)
    risk_rating = Column(String)
    onboard_date = Column(DateTime)
    
    transactions = relationship("Transaction", backref="entity")
    events = relationship("Event", backref="entity")

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