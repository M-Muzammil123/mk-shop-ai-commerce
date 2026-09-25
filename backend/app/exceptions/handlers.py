from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
from sqlalchemy.exc import IntegrityError
import logging

logger = logging.getLogger("app")

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handles request validation errors (Pydantic validation).
    """
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation Error",
            "details": exc.errors()
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Handles FastAPI HTTPExceptions.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail
        }
    )

async def database_integrity_exception_handler(request: Request, exc: IntegrityError):
    """
    Handles database unique/foreign key constraint violations.
    """
    logger.error(f"Database integrity error: {str(exc)}")
    # Simplify error message to hide technical DB details from users
    msg = "A database integrity error occurred (duplicate entry or invalid foreign key)."
    if "unique constraint" in str(exc).lower() or "duplicate key" in str(exc).lower():
        msg = "A record with this identifier already exists."
        
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": msg
        }
    )

async def value_error_handler(request: Request, exc: ValueError):
    """
    Handles standard Python ValueErrors (e.g., from service validation).
    """
    logger.error(f"Value error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": str(exc)
        }
    )
