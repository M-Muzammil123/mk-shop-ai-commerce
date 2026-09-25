import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Numeric, Integer, text, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


class ShoppingSession(Base):
    __tablename__ = "shopping_sessions"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="SET NULL"), nullable=True)
    country = Column(String(10), default="PK", nullable=False)
    city = Column(String(100), nullable=True)
    currency = Column(String(10), default="PKR", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    preferences = Column(JSON, default=dict, nullable=False)
    current_query = Column(Text, nullable=True)
    extracted_requirements = Column(JSON, default=dict, nullable=False)
    selected_products = Column(JSON, default=list, nullable=False)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    # Relationships
    profile = relationship("Profile", backref="shopping_sessions")
    requirements = relationship("ShoppingRequirement", back_populates="session", cascade="all, delete-orphan")
    runs = relationship("AgentRun", back_populates="session", cascade="all, delete-orphan")
    comparisons = relationship("ProductComparison", back_populates="session", cascade="all, delete-orphan")


class ShoppingRequirement(Base):
    __tablename__ = "shopping_requirements"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("public.shopping_sessions.id", ondelete="CASCADE"), nullable=False)
    country = Column(String(10), default="PK", nullable=False)
    city = Column(String(100), nullable=True)
    language = Column(String(10), default="en", nullable=False)
    currency = Column(String(10), default="PKR", nullable=False)
    category = Column(String(100), nullable=True)
    query = Column(Text, nullable=False)
    budget_min = Column(Numeric(12, 2), nullable=True)
    budget_max = Column(Numeric(12, 2), nullable=True)
    brand = Column(JSON, default=list, nullable=False)
    condition = Column(String(50), default="new", nullable=False)
    required_specs = Column(JSON, default=dict, nullable=False)
    preferred_specs = Column(JSON, default=dict, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    delivery_deadline_days = Column(Integer, nullable=True)
    shipping_required = Column(Boolean, default=True, nullable=False)
    quality_priority = Column(Numeric(3, 2), default=0.8, nullable=False)
    price_priority = Column(Numeric(3, 2), default=0.9, nullable=False)
    delivery_priority = Column(Numeric(3, 2), default=0.8, nullable=False)
    raw_prompt = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    session = relationship("ShoppingSession", back_populates="requirements")


class AgentRun(Base):
    __tablename__ = "agent_runs"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("public.shopping_sessions.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="SET NULL"), nullable=True)
    provider = Column(String(50), default="openai", nullable=False)
    model = Column(String(100), default="gpt-4o", nullable=False)
    status = Column(String(50), default="completed", nullable=False)
    user_prompt = Column(Text, nullable=False)
    final_response = Column(Text, nullable=True)
    intent = Column(String(100), nullable=True)
    citations = Column(JSON, default=list, nullable=False)
    total_latency_ms = Column(Integer, default=0, nullable=False)
    token_usage = Column(JSON, default=dict, nullable=False)
    estimated_cost = Column(Numeric(8, 5), default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    session = relationship("ShoppingSession", back_populates="runs")
    tool_calls = relationship("AgentToolCall", back_populates="run", cascade="all, delete-orphan")


class AgentToolCall(Base):
    __tablename__ = "agent_tool_calls"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    run_id = Column(UUID(as_uuid=True), ForeignKey("public.agent_runs.id", ondelete="CASCADE"), nullable=False)
    tool_name = Column(String(100), nullable=False)
    tool_input = Column(JSON, default=dict, nullable=False)
    tool_output = Column(JSON, default=dict, nullable=False)
    latency_ms = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="success", nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    run = relationship("AgentRun", back_populates="tool_calls")


class ExternalProduct(Base):
    __tablename__ = "external_products"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String(500), nullable=False)
    brand = Column(String(200), nullable=True)
    model = Column(String(200), nullable=True)
    price = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), nullable=False)
    original_price = Column(Numeric(12, 2), nullable=True)
    discount = Column(Numeric(5, 2), nullable=True)
    availability = Column(String(50), default="in_stock", nullable=False)
    seller = Column(String(255), nullable=False)
    seller_rating = Column(Numeric(3, 2), nullable=True)
    product_rating = Column(Numeric(3, 2), nullable=True)
    review_count = Column(Integer, nullable=True)
    condition = Column(String(50), default="new", nullable=False)
    specifications = Column(JSON, default=dict, nullable=False)
    shipping_cost = Column(Numeric(10, 2), nullable=True)
    delivery_estimate = Column(String(255), nullable=True)
    warranty = Column(String(255), nullable=True)
    country_code = Column(String(10), nullable=False)
    source_url = Column(Text, nullable=False)
    source_domain = Column(String(255), nullable=False)
    image_url = Column(Text, nullable=True)
    cross_border = Column(Boolean, default=False, nullable=False)
    retrieved_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    price_observations = relationship("PriceObservation", back_populates="external_product", cascade="all, delete-orphan")


class ProductSource(Base):
    __tablename__ = "product_sources"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String(100), nullable=False)
    domain = Column(String(255), unique=True, nullable=False)
    country_codes = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    adapter_type = Column(String(50), default="search_api", nullable=False)
    rate_limit_rpm = Column(Integer, default=60, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)


class ProductComparison(Base):
    __tablename__ = "product_comparisons"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("public.shopping_sessions.id", ondelete="CASCADE"), nullable=True)
    product_ids = Column(JSON, default=list, nullable=False)
    comparison_matrix = Column(JSON, default=dict, nullable=False)
    ai_analysis = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    session = relationship("ShoppingSession", back_populates="comparisons")


class ShippingQuote(Base):
    __tablename__ = "shipping_quotes"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    source_url = Column(Text, nullable=False)
    country_code = Column(String(10), nullable=False)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(50), nullable=True)
    shipping_available = Column(Boolean, default=True, nullable=False)
    shipping_cost = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(10), nullable=True)
    delivery_estimate = Column(String(255), nullable=True)
    express_available = Column(Boolean, default=False, nullable=False)
    seller_country = Column(String(10), nullable=True)
    cross_border = Column(Boolean, default=False, nullable=False)
    import_duty_possible = Column(Boolean, default=False, nullable=False)
    checked_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)


class PriceObservation(Base):
    __tablename__ = "price_observations"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    external_product_id = Column(UUID(as_uuid=True), ForeignKey("public.external_products.id", ondelete="CASCADE"), nullable=True)
    product_url = Column(Text, nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), nullable=False)
    availability = Column(String(50), default="in_stock", nullable=False)
    observed_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    # Relationships
    external_product = relationship("ExternalProduct", back_populates="price_observations")


class PaymentIntent(Base):
    __tablename__ = "payment_intents"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    order_id = Column(UUID(as_uuid=True), ForeignKey("public.orders.id", ondelete="SET NULL"), nullable=True)
    profile_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id", ondelete="SET NULL"), nullable=True)
    provider = Column(String(50), default="mock", nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="PKR", nullable=False)
    status = Column(String(50), default="requires_confirmation", nullable=False) # requires_confirmation, simulated_paid, succeeded, failed
    is_simulation = Column(Boolean, default=True, nullable=False)
    confirmation_token = Column(String(255), nullable=True)
    metadata_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"), nullable=False)

    # Relationships
    order = relationship("Order", backref="payment_intents")
    profile = relationship("Profile", backref="payment_intents")
