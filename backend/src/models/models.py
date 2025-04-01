from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database.database import Base

class Entity(Base):
    __tablename__ = "entity"

    entity_id = Column(Integer, primary_key=True, autoincrement=True)
    entity_name = Column(String, nullable=False)
    entity_address = Column(String)
    country = Column(String)
    client_type = Column(String)
    risk_rating = Column(String)
    onboard_date = Column(DateTime, default=datetime.utcnow)

    events = relationship("Event", back_populates="entity")
    limits = relationship("Limit", back_populates="entity")


class Transaction(Base):
    __tablename__ = "transaction"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    amount = Column(Float)
    currency = Column(String)
    country = Column(String)
    location = Column(String)
    beneficiary = Column(String)
    product = Column(String)
    tenor = Column(Integer)
    price = Column(Float)
    industry = Column(String)
    list_of_goods = Column(ARRAY(String))

    events = relationship("Event", back_populates="transaction")
    transaction_entities = relationship("TransactionEntity", back_populates="transaction")


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

    entity = relationship("Entity", back_populates="events")
    transaction = relationship("Transaction", back_populates="events")
    sanction_checks = relationship("SanctionCheck", back_populates="event")
    eligibility_checks = relationship("EligibilityCheck", back_populates="event")
    limits_checks = relationship("LimitsCheck", back_populates="event")
    exposure_checks = relationship("ExposureCheck", back_populates="event")


class TransactionEntity(Base):
    __tablename__ = "transaction_entity"

    id = Column(Integer, primary_key=True, autoincrement=True)  # Adding an ID as primary key
    transaction_id = Column(Integer, ForeignKey("transaction.transaction_id"))
    type = Column(String)
    entity_name = Column(String)
    entity_address = Column(String)
    entity_country = Column(String)

    transaction = relationship("Transaction", back_populates="transaction_entities")


class Limit(Base):
    __tablename__ = "entity_limit"  # Changed from "limit" to avoid PostgreSQL reserved keyword

    id = Column(Integer, primary_key=True, autoincrement=True)  # Adding an ID as primary key
    entity_id = Column(Integer, ForeignKey("entity.entity_id"))
    product_id = Column(Integer)
    approved_limit = Column(Float)
    used_limit = Column(Float)

    entity = relationship("Entity", back_populates="limits")


class SanctionCheck(Base):
    __tablename__ = "sanction_check"

    id = Column(Integer, primary_key=True, autoincrement=True)  # Adding an ID as primary key
    event_id = Column(Integer, ForeignKey("event.event_id"))
    check_timestamp = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="sanction_checks")


class EligibilityCheck(Base):
    __tablename__ = "eligibility_check"

    id = Column(Integer, primary_key=True, autoincrement=True)  # Adding an ID as primary key
    event_id = Column(Integer, ForeignKey("event.event_id"))
    check_timestamp = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="eligibility_checks")


class LimitsCheck(Base):
    __tablename__ = "limits_check"

    id = Column(Integer, primary_key=True, autoincrement=True)  # Adding an ID as primary key
    event_id = Column(Integer, ForeignKey("event.event_id"))
    check_timestamp = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="limits_checks")


class ExposureCheck(Base):
    __tablename__ = "exposure_check"

    id = Column(Integer, primary_key=True, autoincrement=True)  # Adding an ID as primary key
    event_id = Column(Integer, ForeignKey("event.event_id"))
    check_timestamp = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="exposure_checks") 