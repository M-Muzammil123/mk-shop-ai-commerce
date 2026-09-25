from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Generator


class AIProvider(ABC):
    """
    Abstract AI Provider Interface for Conversational & Research Agents.
    """
    @abstractmethod
    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def extract_structured_requirements(
        self,
        user_prompt: str,
        country: str = "PK",
        currency: str = "PKR"
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def research_and_compare(
        self,
        products: List[Dict[str, Any]],
        requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        pass
