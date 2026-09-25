from typing import Dict, Any, Tuple, Optional


READ_ONLY_TOOLS = {
    "shopping_search",
    "web_search",
    "fetch_page",
    "extract_product",
    "get_reviews",
    "get_shipping",
    "currency_converter",
    "compare_products",
    "availability",
}

SENSITIVE_ACTION_TOOLS = {
    "add_to_cart",
    "create_order",
    "confirm_payment",
}


def validate_mcp_tool_invocation(
    tool_name: str,
    tool_params: Dict[str, Any],
    is_confirmed_by_user: bool = False,
    auth_token: Optional[str] = None,
    expected_auth_token: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Evaluates MCP tool invocation permissions and security rules:
    - Verifies tool exists in allowlists
    - Checks read-only vs sensitive mutation privilege
    - Enforces user confirmation on sensitive tools
    - Validates MCP gateway token if an external token is tested
    """
    if auth_token is not None and expected_auth_token and auth_token != expected_auth_token:
        return False, "Unauthorized MCP Gateway access: invalid auth token."

    if tool_name in READ_ONLY_TOOLS:
        return True, "Authorized read-only tool invocation."

    if tool_name in SENSITIVE_ACTION_TOOLS:
        if not is_confirmed_by_user:
            return False, f"Tool '{tool_name}' is a sensitive action requiring explicit user confirmation before execution."
        return True, "Authorized sensitive action tool invocation with user confirmation."

    return False, f"Unknown or disallowed MCP tool: '{tool_name}'."

