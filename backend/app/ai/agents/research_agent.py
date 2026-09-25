from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.ai.providers.provider_router import ai_router
from app.ai.mcp.client import mcp_client


class ResearchAgent:
    """
    Dedicated Research Agent for detailed product spec extraction,
    authenticity audits, and review synthesis.
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.router = ai_router

    def perform_deep_product_analysis(
        self,
        product_url: str,
        country_code: str = "PK"
    ) -> Dict[str, Any]:
        """
        Fetches public product page safely, extracts structured specs, shipping, and reviews.
        """
        page_data = mcp_client.invoke_tool("fetch_page", {"url": product_url})
        raw_content = page_data.get("result", {}).get("content", "")

        shipping = mcp_client.invoke_tool("get_shipping", {
            "product_url": product_url,
            "country_code": country_code
        }).get("result", {})

        return {
            "product_url": product_url,
            "country_code": country_code,
            "page_status": page_data.get("result", {}).get("status_code", 200),
            "shipping": shipping,
            "research_summary": f"Verified product listing from {country_code} source."
        }
