from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, Text, JSON, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


class SearchAnalytics(Base):
    __tablename__ = "search_analytics"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    query = Column(Text, nullable=False)
    parsed_intent = Column(JSON, default=dict, nullable=False)
    results_count = Column(Integer, default=0, nullable=False)
    latency_ms = Column(Integer, default=0, nullable=False)
    session_id = Column(String(100), nullable=True)
    clicked_product_id = Column(UUID(as_uuid=True), ForeignKey("public.products.id", ondelete="SET NULL"), nullable=True)
    converted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)


class ConversationalSession(Base):
    __tablename__ = "conversational_sessions"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="CASCADE"), nullable=True)
    history = Column(JSON, default=list, nullable=False)
    current_filters = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)
