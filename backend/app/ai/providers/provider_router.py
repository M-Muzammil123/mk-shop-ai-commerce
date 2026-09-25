from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.ai.providers.base_provider import AIProvider
from app.ai.providers.openai_provider import OpenAIProvider
from app.ai.providers.gemini_provider import GeminiProvider


class ProviderRouter:
    """
    Intelligent AI Provider Router supporting OpenAI, Google Gemini, and Hybrid failover execution.
    """
    def __init__(self):
        self.openai = OpenAIProvider()
        self.gemini = GeminiProvider()

    def get_conversational_provider(self) -> AIProvider:
        prov = settings.AI_PROVIDER.lower()
        if prov == "gemini":
            return self.gemini
        return self.openai  # default

    def get_research_provider(self) -> AIProvider:
        prov = settings.RESEARCH_PROVIDER.lower()
        if prov == "openai":
            return self.openai
        return self.gemini  # default

    def execute_chat_with_fallback(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Attempts primary provider and seamlessly falls back if failure occurs.
        """
        primary = self.get_conversational_provider()
        try:
            res = primary.generate_chat_response(messages, tools=tools)
            if res.get("success"):
                return res
        except Exception:
            pass

        # Fallback to secondary provider
        secondary = self.gemini if primary == self.openai else self.openai
        try:
            return secondary.generate_chat_response(messages, tools=tools)
        except Exception:
            # Ultimate offline fallback
            return self.openai._mock_chat_completion(messages, tools or [])

    def execute_research_with_fallback(
        self,
        products: List[Dict[str, Any]],
        requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes comparison and product synthesis with fallback.
        """
        researcher = self.get_research_provider()
        try:
            return researcher.research_and_compare(products, requirements)
        except Exception:
            fallback = self.openai if researcher == self.gemini else self.gemini
            return fallback.research_and_compare(products, requirements)


ai_router = ProviderRouter()
