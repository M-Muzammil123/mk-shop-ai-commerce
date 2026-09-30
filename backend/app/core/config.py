import os
from typing import List
from pydantic import AnyHttpUrl, EmailStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI E-Commerce Platform"
    
    # Security
    SECRET_KEY: str = "production_ready_secret_key_change_me_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_PROJECT_ID: str = ""

    
    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    
    # Database
    DATABASE_URL: str
    
    # Payment Gateways (Mock credentials for payment preparation)
    STRIPE_SECRET_KEY: str = "sk_test_mock_key"
    STRIPE_WEBHOOK_SECRET: str = "whsec_mock_key"
    
    PAYPAL_CLIENT_ID: str = "paypal_client_mock_id"
    PAYPAL_CLIENT_SECRET: str = "paypal_client_mock_secret"
    
    RAZORPAY_KEY_ID: str = "rzp_test_mock_id"
    RAZORPAY_KEY_SECRET: str = "rzp_test_mock_secret"
    
    # Mail Config (Mock / Custom SMTP configuration)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "sender@example.com"
    SMTP_PASSWORD: str = "app_password"
    SMTP_FROM: str = "no-reply@aiecommerce.com"
    
    # AI Provider Settings
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_PROVIDER: str = "gemini" # "openai", "gemini", "hybrid"
    RESEARCH_PROVIDER: str = "gemini"
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_REALTIME_MODEL: str = "gpt-4o-realtime-preview"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # MCP Gateway Settings
    MCP_ENABLED: bool = True
    MCP_SERVER_URL: str = "http://localhost:8001"
    MCP_AUTH_TOKEN: str = "mk_mcp_auth_token_secret"

    # Default Country & Currency
    DEFAULT_COUNTRY: str = "PK"
    DEFAULT_CURRENCY: str = "PKR"

    # Payment Gateway Mode (mock / stripe / paypal / razorpay)
    PAYMENT_MODE: str = "mock"

    # CORS Origins (Comma-separated strings in .env parsed into a list)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
