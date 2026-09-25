from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from sqlalchemy.exc import IntegrityError
import uvicorn

from app.core.config import settings
from app.api.v1.router import api_router
from app.exceptions.handlers import (
    validation_exception_handler,
    http_exception_handler,
    database_integrity_exception_handler,
    value_error_handler
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready FastAPI backend for the AI E-Commerce Platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register Custom Global Exception Handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(IntegrityError, database_integrity_exception_handler)
app.add_exception_handler(ValueError, value_error_handler)

# Mount API v1 Router & root fallback router
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router)

@app.get("/", tags=["Health Check"])
def root_health_check():
    """
    Server status checks. Returns greeting message.
    """
    return {
        "success": True,
        "message": f"Welcome to the {settings.PROJECT_NAME} Backend API!",
        "status": "online",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    # Allows launching uvicorn programmatically if run directly
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
