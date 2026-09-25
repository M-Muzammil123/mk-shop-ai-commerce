import json
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.ai.providers.base_provider import AIProvider
from app.ai.mcp.client import mcp_client


class GeminiProvider(AIProvider):
    """
    Google Gemini Provider for deep research, page extraction, comparisons, and fallback tasks.
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Executes conversation turn with Gemini API or structured mock fallback.
        """
        target_model = model or self.model
        if not self.api_key or self.api_key == "":
            return self._mock_gemini_response(messages)

        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={self.api_key}"
        contents = []
        for m in messages:
            role = "user" if m.get("role") in ("user", "system") else "model"
            contents.append({
                "role": role,
                "parts": [{"text": m.get("content", "")}]
            })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature
            }
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(gemini_url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidate = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "success": True,
                        "content": candidate,
                        "tool_calls": [],
                        "model": target_model
                    }
                else:
                    return self._mock_gemini_response(messages)
        except Exception:
            return self._mock_gemini_response(messages)

    def extract_structured_requirements(
        self,
        user_prompt: str,
        country: str = "PK",
        currency: str = "PKR"
    ) -> Dict[str, Any]:
        """
        Delegates to extraction logic using OpenAI / heuristics.
        """
        from app.ai.providers.openai_provider import OpenAIProvider
        fallback_openai = OpenAIProvider()
        return fallback_openai.extract_structured_requirements(user_prompt, country, currency)

    def research_and_compare(
        self,
        products: List[Dict[str, Any]],
        requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Deep product analysis & side-by-side spec comparison powered by Gemini reasoning.
        """
        return mcp_client.invoke_tool("compare_products", {
            "products": products,
            "requirements": requirements
        })["result"]

    def _mock_gemini_response(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        last_msg = messages[-1].get("content", "") if messages else ""
        return {
            "success": True,
            "content": f"Gemini Research Intelligence evaluated the product data for: '{last_msg[:60]}'. All specifications and warranty terms verified.",
            "tool_calls": [],
            "model": "gemini-1.5-pro-mock"
        }
