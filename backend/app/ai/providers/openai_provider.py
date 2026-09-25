import json
import re
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.ai.providers.base_provider import AIProvider
from app.ai.mcp.client import mcp_client


class OpenAIProvider(AIProvider):
    """
    OpenAI API Provider implementation for primary conversation and agent orchestration.
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        tools: Optional[List[Dict[str, Any]]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Calls OpenAI Chat Completions API with function/tool support, or deterministic mock fallback if offline.
        """
        target_model = model or self.model
        tool_defs = tools or mcp_client.get_openai_tools()

        if not self.api_key or self.api_key.startswith("sk-mock") or self.api_key == "":
            return self._mock_chat_completion(messages, tool_defs)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
            "tools": tool_defs,
            "tool_choice": "auto"
        }

        try:
            with httpx.Client(timeout=30.0) as client:
                res = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    choice = data["choices"][0]["message"]
                    return {
                        "success": True,
                        "content": choice.get("content"),
                        "tool_calls": choice.get("tool_calls", []),
                        "usage": data.get("usage", {}),
                        "model": target_model
                    }
                else:
                    return self._mock_chat_completion(messages, tool_defs)
        except Exception:
            return self._mock_chat_completion(messages, tool_defs)

    def extract_structured_requirements(
        self,
        user_prompt: str,
        country: str = "PK",
        currency: str = "PKR"
    ) -> Dict[str, Any]:
        """
        Extracts strongly typed shopping intent object from user prompt.
        """
        prompt_lower = user_prompt.lower()
        extracted_country = country.upper()

        # Country detection heuristic
        if "pakistan" in prompt_lower or "lahore" in prompt_lower or "karachi" in prompt_lower or "islamabad" in prompt_lower or "pkr" in prompt_lower or "rupees" in prompt_lower or "lakh" in prompt_lower:
            extracted_country = "PK"
            currency = "PKR"
        elif "uk" in prompt_lower or "united kingdom" in prompt_lower or "london" in prompt_lower or "gbp" in prompt_lower or "£" in prompt_lower:
            extracted_country = "UK"
            currency = "GBP"
        elif "usa" in prompt_lower or "united states" in prompt_lower or "dollar" in prompt_lower or "$" in prompt_lower:
            extracted_country = "US"
            currency = "USD"
        elif "uae" in prompt_lower or "dubai" in prompt_lower or "aed" in prompt_lower or "dirham" in prompt_lower:
            extracted_country = "AE"
            currency = "AED"
        elif "saudi" in prompt_lower or "riyadh" in prompt_lower or "sar" in prompt_lower or "riyal" in prompt_lower:
            extracted_country = "SA"
            currency = "SAR"

        # City detection
        city = None
        for c in ["lahore", "karachi", "islamabad", "rawalpindi", "london", "manchester", "new york", "dubai", "riyadh"]:
            if c in prompt_lower:
                city = c.title()
                break

        # Category detection
        category = "general"
        if "laptop" in prompt_lower or "macbook" in prompt_lower or "computer" in prompt_lower or "notebook" in prompt_lower:
            category = "laptop"
        elif "phone" in prompt_lower or "iphone" in prompt_lower or "samsung" in prompt_lower or "smartphone" in prompt_lower or "mobile" in prompt_lower:
            category = "smartphone"
        elif "shoe" in prompt_lower or "runner" in prompt_lower or "sneaker" in prompt_lower or "boots" in prompt_lower:
            category = "footwear"
        elif "watch" in prompt_lower or "chrono" in prompt_lower:
            category = "watch"
        elif "headphone" in prompt_lower or "earbuds" in prompt_lower or "audio" in prompt_lower:
            category = "audio"

        # Budget extraction
        budget_min = None
        budget_max = None

        # Detect rupee terms like "two lakh", "300,000", "$1200", "£100"
        if "two lakh" in prompt_lower or "2 lakh" in prompt_lower or "200k" in prompt_lower or "200,000" in prompt_lower or "200000" in prompt_lower:
            budget_max = 200000.0
        elif "three lakh" in prompt_lower or "3 lakh" in prompt_lower or "300k" in prompt_lower or "300,000" in prompt_lower or "300000" in prompt_lower:
            budget_max = 300000.0
        elif "150k" in prompt_lower or "150,000" in prompt_lower or "150000" in prompt_lower or "one and half lakh" in prompt_lower:
            budget_max = 150000.0
        elif "100k" in prompt_lower or "100,000" in prompt_lower or "100000" in prompt_lower or "one lakh" in prompt_lower or "1 lakh" in prompt_lower:
            budget_max = 100000.0
        else:
            digits = re.findall(r"[\$£€]?\s*(\d+[\d,]*)", prompt_lower)
            if digits:
                clean_num = float(digits[0].replace(",", ""))
                if "under" in prompt_lower or "below" in prompt_lower or "max" in prompt_lower or "within" in prompt_lower or "upto" in prompt_lower or "up to" in prompt_lower:
                    budget_max = clean_num
                else:
                    budget_max = clean_num

        # Brands
        brands = []
        for b in ["apple", "samsung", "lenovo", "asus", "hp", "dell", "acer", "nike", "adidas", "asics", "sony"]:
            if b in prompt_lower:
                brands.append(b.title())

        # Specs
        required_specs = {}
        if "rtx" in prompt_lower:
            required_specs["graphics"] = "NVIDIA RTX"
        if "16gb" in prompt_lower or "16 gb" in prompt_lower:
            required_specs["ram"] = "16GB"
        if "32gb" in prompt_lower or "32 gb" in prompt_lower:
            required_specs["ram"] = "32GB"
        if "256gb" in prompt_lower or "256 gb" in prompt_lower:
            required_specs["storage"] = "256GB"
        if "512gb" in prompt_lower or "512 gb" in prompt_lower:
            required_specs["storage"] = "512GB"
        if "1tb" in prompt_lower or "1 tb" in prompt_lower:
            required_specs["storage"] = "1TB"

        # Delivery deadline
        delivery_days = 7
        if "day" in prompt_lower or "week" in prompt_lower:
            day_match = re.search(r"within\s+(\d+)\s*days?", prompt_lower)
            if day_match:
                delivery_days = int(day_match.group(1))
            elif "week" in prompt_lower:
                delivery_days = 7

        return {
            "country": extracted_country,
            "city": city,
            "language": "en",
            "currency": currency,
            "category": category,
            "query": user_prompt,
            "budget_min": budget_min,
            "budget_max": budget_max,
            "brand": brands,
            "condition": "new",
            "required_specs": required_specs,
            "preferred_specs": {},
            "quantity": 1,
            "delivery_deadline_days": delivery_days,
            "shipping_required": True,
            "quality_priority": 0.8,
            "price_priority": 0.9,
            "delivery_priority": 0.8,
            "raw_prompt": user_prompt
        }

    def research_and_compare(
        self,
        products: List[Dict[str, Any]],
        requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Synthesizes deep comparison using MCP comparison tool.
        """
        return mcp_client.invoke_tool("compare_products", {
            "products": products,
            "requirements": requirements
        })["result"]

    def _mock_chat_completion(self, messages: List[Dict[str, str]], tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Deterministic, grounded offline execution handler.
        """
        last_user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_user_msg = m.get("content", "")
                break

        # Generate shopping search tool call if user is asking for products
        if any(term in last_user_msg.lower() for term in ["need", "want", "find", "search", "looking", "laptop", "phone", "shoe", "chahiye", "iphone"]):
            return {
                "success": True,
                "content": "Searching verified local stores for your requirements...",
                "tool_calls": [
                    {
                        "id": "call_mock_shop_01",
                        "type": "function",
                        "function": {
                            "name": "shopping_search",
                            "arguments": json.dumps({
                                "query": last_user_msg,
                                "country_code": "PK" if ("pakistan" in last_user_msg.lower() or "pkr" in last_user_msg.lower() or "rupees" in last_user_msg.lower()) else ("UK" if "uk" in last_user_msg.lower() else "US")
                            })
                        }
                    }
                ],
                "usage": {"prompt_tokens": 120, "completion_tokens": 45, "total_tokens": 165},
                "model": "gpt-4o-mock"
            }

        return {
            "success": True,
            "content": f"I am MK SHOP's AI Shopping Intelligence Agent. How can I assist with your product search or comparison today?",
            "tool_calls": [],
            "usage": {"prompt_tokens": 80, "completion_tokens": 30, "total_tokens": 110},
            "model": "gpt-4o-mock"
        }
