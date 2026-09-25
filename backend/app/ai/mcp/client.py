from typing import List, Dict, Any, Optional
from app.ai.mcp.server import mcp_gateway


# Provider-Agnostic MCP Tool Schemas
OPENAI_MCP_TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "shopping_search",
            "description": "Searches multiple country-tailored merchant stores and catalogs for products with live prices and shipping.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search keywords, brand, model, and specs."},
                    "country_code": {"type": "string", "description": "2-letter country code e.g. PK, US, UK, AE, SA, CA, DE, AU."},
                    "currency": {"type": "string", "description": "Currency e.g. PKR, USD, GBP, AED, SAR, EUR."},
                    "max_results": {"type": "integer", "description": "Max products to return."},
                    "filters": {
                        "type": "object",
                        "description": "Optional filters such as budget_min, budget_max, required_specs."
                    }
                },
                "required": ["query", "country_code"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Performs a broader web search for product availability, store domains, and market citations in target country.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query."},
                    "country_code": {"type": "string", "description": "2-letter target country code."},
                    "language": {"type": "string", "description": "Preferred language."},
                    "max_results": {"type": "integer", "description": "Max results to return."}
                },
                "required": ["query", "country_code"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "fetch_page",
            "description": "Safely retrieves public product webpage content with SSRF and prompt injection protection.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "Target public product URL."}
                },
                "required": ["url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "extract_product",
            "description": "Extracts structured product attributes (price, seller, specs, condition) without hallucination.",
            "parameters": {
                "type": "object",
                "properties": {
                    "raw_data": {"type": "object", "description": "Raw data dictionary or parsed page payload."},
                    "source_url": {"type": "string", "description": "Source URL."},
                    "country_code": {"type": "string", "description": "Country code."},
                    "currency": {"type": "string", "description": "Currency."}
                },
                "required": ["raw_data"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_shipping",
            "description": "Calculates shipping cost, transit days, and cross-border customs risk for a product.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_url": {"type": "string", "description": "Product URL."},
                    "country_code": {"type": "string", "description": "Target country code."},
                    "city": {"type": "string", "description": "Destination city."},
                    "postal_code": {"type": "string", "description": "Destination postal code."}
                },
                "required": ["product_url", "country_code"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_reviews",
            "description": "Extracts real customer sentiment, positive themes, and negative feedback for a product.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string", "description": "Product name or model."},
                    "source_url": {"type": "string", "description": "Product source URL."}
                },
                "required": ["product_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "currency_converter",
            "description": "Converts price amounts across international currencies with current exchange rates.",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number", "description": "Amount to convert."},
                    "from_currency": {"type": "string", "description": "Source currency code."},
                    "to_currency": {"type": "string", "description": "Target currency code."}
                },
                "required": ["amount", "from_currency", "to_currency"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "compare_products",
            "description": "Generates a structured side-by-side comparison matrix, component score breakdown, and pros/cons.",
            "parameters": {
                "type": "object",
                "properties": {
                    "products": {
                        "type": "array",
                        "items": {"type": "object"},
                        "description": "List of normalized candidate products."
                    },
                    "requirements": {
                        "type": "object",
                        "description": "User shopping requirements with budget and specs."
                    }
                },
                "required": ["products"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "availability",
            "description": "Verifies if a product listing is currently in-stock and purchasable.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_url": {"type": "string", "description": "Product URL."},
                    "seller": {"type": "string", "description": "Seller or merchant name."}
                },
                "required": ["product_url"]
            }
        }
    }
]


class MCPClient:
    """
    Provider-agnostic MCP Gateway Client for dispatching tool calls.
    """
    def __init__(self):
        self.gateway = mcp_gateway

    def get_openai_tools(self) -> List[Dict[str, Any]]:
        return OPENAI_MCP_TOOL_DEFINITIONS

    def get_gemini_tools(self) -> List[Dict[str, Any]]:
        # Gemini expects function_declarations list format
        declarations = []
        for t in OPENAI_MCP_TOOL_DEFINITIONS:
            fn = t["function"]
            declarations.append({
                "name": fn["name"],
                "description": fn["description"],
                "parameters": fn["parameters"]
            })
        return [{"function_declarations": declarations}]

    def invoke_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        is_confirmed_by_user: bool = False,
        auth_token: Optional[str] = None
    ) -> Dict[str, Any]:
        return self.gateway.execute_tool(
            tool_name=tool_name,
            parameters=arguments,
            is_confirmed_by_user=is_confirmed_by_user,
            auth_token=auth_token
        )


mcp_client = MCPClient()
