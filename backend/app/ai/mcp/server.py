import time
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.security.mcp_guardrails import validate_mcp_tool_invocation
from app.ai.mcp.tools import (
    execute_shopping_search,
    execute_web_search,
    execute_fetch_page,
    execute_extract_product,
    execute_get_shipping,
    execute_get_reviews,
    convert_currency,
    execute_compare_products,
    execute_check_availability,
)


class MCPShoppingGatewayServer:
    """
    Dedicated Model Context Protocol Gateway Server for safe, provider-agnostic commerce tools.
    """
    def __init__(self):
        self.tool_handlers = {
            "shopping_search": lambda params: execute_shopping_search(
                query=params.get("query", ""),
                country_code=params.get("country_code", "PK"),
                currency=params.get("currency"),
                max_results=params.get("max_results", 20),
                filters=params.get("filters")
            ),
            "web_search": lambda params: execute_web_search(
                query=params.get("query", ""),
                country_code=params.get("country_code", "PK"),
                language=params.get("language", "en"),
                max_results=params.get("max_results", 10)
            ),
            "fetch_page": lambda params: execute_fetch_page(
                url=params.get("url", "")
            ),
            "extract_product": lambda params: execute_extract_product(
                raw_data=params.get("raw_data", {}),
                source_url=params.get("source_url", ""),
                country_code=params.get("country_code", "PK"),
                currency=params.get("currency", "PKR")
            ),
            "get_shipping": lambda params: execute_get_shipping(
                product_url=params.get("product_url", ""),
                country_code=params.get("country_code", "PK"),
                city=params.get("city", ""),
                postal_code=params.get("postal_code", "")
            ),
            "get_reviews": lambda params: execute_get_reviews(
                product_name=params.get("product_name", ""),
                source_url=params.get("source_url", "")
            ),
            "currency_converter": lambda params: convert_currency(
                amount=float(params.get("amount", 0.0)),
                from_currency=params.get("from_currency", "USD"),
                to_currency=params.get("to_currency", "PKR")
            ),
            "compare_products": lambda params: execute_compare_products(
                products=params.get("products", []),
                requirements=params.get("requirements")
            ),
            "availability": lambda params: execute_check_availability(
                product_url=params.get("product_url", ""),
                seller=params.get("seller", "")
            ),
        }

    def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        is_confirmed_by_user: bool = False,
        auth_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes a registered MCP tool through guardrails, tracking latency and status.
        """
        start_time = time.time()

        # Security & Permission validation
        is_allowed, reason = validate_mcp_tool_invocation(
            tool_name=tool_name,
            tool_params=parameters,
            is_confirmed_by_user=is_confirmed_by_user,
            auth_token=auth_token,
            expected_auth_token=settings.MCP_AUTH_TOKEN if settings.MCP_ENABLED else None
        )

        if not is_allowed:
            return {
                "success": False,
                "tool_name": tool_name,
                "error": reason,
                "latency_ms": int((time.time() - start_time) * 1000)
            }

        handler = self.tool_handlers.get(tool_name)
        if not handler:
            return {
                "success": False,
                "tool_name": tool_name,
                "error": f"Tool '{tool_name}' handler not found.",
                "latency_ms": int((time.time() - start_time) * 1000)
            }

        try:
            result = handler(parameters)
            latency_ms = int((time.time() - start_time) * 1000)
            return {
                "success": True,
                "tool_name": tool_name,
                "result": result,
                "latency_ms": latency_ms
            }
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            return {
                "success": False,
                "tool_name": tool_name,
                "error": f"Error executing tool: {str(e)}",
                "latency_ms": latency_ms
            }


mcp_gateway = MCPShoppingGatewayServer()
