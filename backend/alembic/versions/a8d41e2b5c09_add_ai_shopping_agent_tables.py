"""Add AI shopping agent and commerce intelligence tables

Revision ID: a8d41e2b5c09
Revises: 31c8822fe40c
Create Date: 2026-09-25 16:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a8d41e2b5c09'
down_revision: Union[str, None] = '31c8822fe40c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Shopping Sessions
    op.create_table(
        'shopping_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('session_id', sa.String(length=100), nullable=False),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('country', sa.String(length=10), server_default='PK', nullable=False),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('currency', sa.String(length=10), server_default='PKR', nullable=False),
        sa.Column('language', sa.String(length=10), server_default='en', nullable=False),
        sa.Column('preferences', sa.JSON(), nullable=False),
        sa.Column('current_query', sa.Text(), nullable=True),
        sa.Column('extracted_requirements', sa.JSON(), nullable=False),
        sa.Column('selected_products', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=50), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['profile_id'], ['public.profiles.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )
    op.create_index(op.f('ix_public_shopping_sessions_session_id'), 'shopping_sessions', ['session_id'], unique=True, schema='public')

    # 2. Shopping Requirements
    op.create_table(
        'shopping_requirements',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('country', sa.String(length=10), server_default='PK', nullable=False),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('language', sa.String(length=10), server_default='en', nullable=False),
        sa.Column('currency', sa.String(length=10), server_default='PKR', nullable=False),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('query', sa.Text(), nullable=False),
        sa.Column('budget_min', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('budget_max', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('brand', sa.JSON(), nullable=False),
        sa.Column('condition', sa.String(length=50), server_default='new', nullable=False),
        sa.Column('required_specs', sa.JSON(), nullable=False),
        sa.Column('preferred_specs', sa.JSON(), nullable=False),
        sa.Column('quantity', sa.Integer(), server_default='1', nullable=False),
        sa.Column('delivery_deadline_days', sa.Integer(), nullable=True),
        sa.Column('shipping_required', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('quality_priority', sa.Numeric(precision=3, scale=2), server_default='0.8', nullable=False),
        sa.Column('price_priority', sa.Numeric(precision=3, scale=2), server_default='0.9', nullable=False),
        sa.Column('delivery_priority', sa.Numeric(precision=3, scale=2), server_default='0.8', nullable=False),
        sa.Column('raw_prompt', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['public.shopping_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )

    # 3. Agent Runs
    op.create_table(
        'agent_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('provider', sa.String(length=50), server_default='openai', nullable=False),
        sa.Column('model', sa.String(length=100), server_default='gpt-4o', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='completed', nullable=False),
        sa.Column('user_prompt', sa.Text(), nullable=False),
        sa.Column('final_response', sa.Text(), nullable=True),
        sa.Column('intent', sa.String(length=100), nullable=True),
        sa.Column('citations', sa.JSON(), nullable=False),
        sa.Column('total_latency_ms', sa.Integer(), server_default='0', nullable=False),
        sa.Column('token_usage', sa.JSON(), nullable=False),
        sa.Column('estimated_cost', sa.Numeric(precision=8, scale=5), server_default='0.0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['profile_id'], ['public.profiles.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['session_id'], ['public.shopping_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )

    # 4. Agent Tool Calls
    op.create_table(
        'agent_tool_calls',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tool_name', sa.String(length=100), nullable=False),
        sa.Column('tool_input', sa.JSON(), nullable=False),
        sa.Column('tool_output', sa.JSON(), nullable=False),
        sa.Column('latency_ms', sa.Integer(), server_default='0', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='success', nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['public.agent_runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )

    # 5. External Products
    op.create_table(
        'external_products',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(length=500), nullable=False),
        sa.Column('brand', sa.String(length=200), nullable=True),
        sa.Column('model', sa.String(length=200), nullable=True),
        sa.Column('price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False),
        sa.Column('original_price', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('discount', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('availability', sa.String(length=50), server_default='in_stock', nullable=False),
        sa.Column('seller', sa.String(length=255), nullable=False),
        sa.Column('seller_rating', sa.Numeric(precision=3, scale=2), nullable=True),
        sa.Column('product_rating', sa.Numeric(precision=3, scale=2), nullable=True),
        sa.Column('review_count', sa.Integer(), nullable=True),
        sa.Column('condition', sa.String(length=50), server_default='new', nullable=False),
        sa.Column('specifications', sa.JSON(), nullable=False),
        sa.Column('shipping_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('delivery_estimate', sa.String(length=255), nullable=True),
        sa.Column('warranty', sa.String(length=255), nullable=True),
        sa.Column('country_code', sa.String(length=10), nullable=False),
        sa.Column('source_url', sa.Text(), nullable=False),
        sa.Column('source_domain', sa.String(length=255), nullable=False),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('cross_border', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('retrieved_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )

    # 6. Product Sources
    op.create_table(
        'product_sources',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=False),
        sa.Column('country_codes', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('adapter_type', sa.String(length=50), server_default='search_api', nullable=False),
        sa.Column('rate_limit_rpm', sa.Integer(), server_default='60', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain'),
        schema='public'
    )

    # 7. Product Comparisons
    op.create_table(
        'product_comparisons',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('product_ids', sa.JSON(), nullable=False),
        sa.Column('comparison_matrix', sa.JSON(), nullable=False),
        sa.Column('ai_analysis', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['public.shopping_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )

    # 8. Shipping Quotes
    op.create_table(
        'shipping_quotes',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('source_url', sa.Text(), nullable=False),
        sa.Column('country_code', sa.String(length=10), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('postal_code', sa.String(length=50), nullable=True),
        sa.Column('shipping_available', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('shipping_cost', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('currency', sa.String(length=10), nullable=True),
        sa.Column('delivery_estimate', sa.String(length=255), nullable=True),
        sa.Column('express_available', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('seller_country', sa.String(length=10), nullable=True),
        sa.Column('cross_border', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('import_duty_possible', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('checked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )

    # 9. Price Observations
    op.create_table(
        'price_observations',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('external_product_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('product_url', sa.Text(), nullable=False),
        sa.Column('price', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False),
        sa.Column('availability', sa.String(length=50), server_default='in_stock', nullable=False),
        sa.Column('observed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['external_product_id'], ['public.external_products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )

    # 10. Payment Intents
    op.create_table(
        'payment_intents',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('provider', sa.String(length=50), server_default='mock', nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=10), server_default='PKR', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='requires_confirmation', nullable=False),
        sa.Column('is_simulation', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('confirmation_token', sa.String(length=255), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['public.orders.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['profile_id'], ['public.profiles.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        schema='public'
    )


def downgrade() -> None:
    op.drop_table('payment_intents', schema='public')
    op.drop_table('price_observations', schema='public')
    op.drop_table('shipping_quotes', schema='public')
    op.drop_table('product_comparisons', schema='public')
    op.drop_table('product_sources', schema='public')
    op.drop_table('external_products', schema='public')
    op.drop_table('agent_tool_calls', schema='public')
    op.drop_table('agent_runs', schema='public')
    op.drop_table('shopping_requirements', schema='public')
    op.drop_index(op.f('ix_public_shopping_sessions_session_id'), table_name='shopping_sessions', schema='public')
    op.drop_table('shopping_sessions', schema='public')
