# MK SHOP — AI Shopping Agent & Commerce Intelligence Platform
## Comprehensive Technical Documentation & Architecture Blueprint

---

## 1. Executive Summary

**MK SHOP** is a production-grade **AI Shopping Agent and AI Commerce Intelligence Platform** engineered for conversational product discovery, country-locked search enforcement, automated spec comparison, and simulated payment fulfillment.

It bridges conversational LLMs (**OpenAI** & **Google Gemini**) with live merchant feeds via the **Model Context Protocol (MCP)**, guaranteeing:
- **Zero Hallucination Policy**: Prices, availability, specifications, and delivery timeframes are derived strictly from grounded sources.
- **Country-First Search Routing**: All search execution is validated server-side to the user's selected country (**Pakistan, UK, USA, UAE, Saudi Arabia, etc.**).
- **Component-Based Product Scoring**: Transparent recommendation scoring displaying exact breakdowns across requirement match, price fit, customer reviews, and shipping delivery speed.
- **Two-Step Explicit Checkout**: Sensitive mutations (cart modification, order creation, and mock payments) require cryptographic confirmation tokens to prevent unprompted agent actions.

---

## 2. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              MK SHOP FRONTEND (Next.js 15)                              │
│  • App Router (React 19) • Tailwind CSS • Zustand State Management • TanStack Query     │
│  • /shop: 3-Column AI Shopping Workspace (Chat + Voice + Discovered Cards + Comparison) │
│  • /: Modern Hero Workspace with Quick Country & AI Studio Input Card                   │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │ HTTPS / REST (JSON)
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               FASTAPI BACKEND ENGINE                                    │
│  • ASGI High-Performance Server • Pydantic v2 Validation • SQLAlchemy 2.0 Async/Sync   │
│  • API Endpoints: /api/v1/agent/*, /api/v1/products/*, /api/v1/cart/*, /api/v1/orders/* │
└────────────────────────┬─────────────────────────────────────────┬──────────────────────┘
                         │                                         │
        ┌────────────────┴───────────────┐        ┌────────────────┴───────────────┐
        │       AI PROVIDER LAYER        │        │     SECURITY & GUARDRAILS      │
        │ • OpenAI Provider (Chat/Voice) │        │ • SSRF & Cloud Metadata Block  │
        │ • Gemini Provider (Research)   │        │ • Prompt Injection Sanitizer   │
        │ • ProviderRouter with Failover │        │ • MCP Allowlist & Rate Limiter │
        └────────────────┬───────────────┘        └────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               MCP SHOPPING GATEWAY                                      │
│─────────────────────────────────────────────────────────────────────────────────────────│
│ 1. shopping_search   (Country-locked multi-source merchant discovery)                   │
│ 2. web_search        (Grounded web metadata & domain relevance)                         │
│ 3. fetch_page        (Safe SSRF-filtered HTML & product page parser)                    │
│ 4. extract_product   (Structured specification & price extractor)                       │
│ 5. get_shipping      (Domestic delivery timeframes & cross-border duties)               │
│ 6. get_reviews       (Customer sentiment & verified review themes)                      │
│ 7. currency_converter(Live multi-currency exchange rate normalization)                  │
│ 8. compare_products  (Side-by-side spec matrix & 4-component score calculation)         │
└────────────────────────┬────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               POSTGRESQL DATABASE                                       │
│─────────────────────────────────────────────────────────────────────────────────────────│
│ • Shopping Sessions & Requirements  • Agent Runs & Tool Audit Telemetry                 │
│ • External Products & Sources       • Comparisons & Price Observations                  │
│ • Core E-Commerce Models            • Payment Intents (Simulated Paid State)            │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Subsystems

### 3.1 Country-First Search Enforcement
- **Supported Regions**: Pakistan (`PK`), United Kingdom (`GB`), United States (`US`), United Arab Emirates (`AE`), Saudi Arabia (`SA`), Canada (`CA`), Germany (`DE`), Australia (`AU`).
- **Server-Side Enforcement**: The backend rejects queries that attempt to strip country locks.
- **Domain Mapping**:
  - `PK`: Daraz.pk, Telemart, Shophive, PakLap, PriceOye.
  - `GB`: Amazon.co.uk, Currys, Argos, John Lewis.
  - `US`: Amazon.com, Best Buy, Newegg, B&H Photo.
  - `AE` / `SA`: Amazon.ae, Amazon.sa, Noon, Jarir Bookstore.
- **Cross-Border Tagging**: Items outside the user's selected country are flagged with `cross_border: true` and calculated customs/duty estimates.

---

### 3.2 MCP Shopping Gateway
The gateway resides in [`backend/app/ai/mcp/`](file:///Users/m.muzammil/Desktop/e_comrace%20project/backend/app/ai/mcp/) and provides 8 standardized, provider-agnostic shopping tools:

| Tool Name | Input Parameters | Output & Purpose |
| :--- | :--- | :--- |
| `shopping_search` | `query`, `country_code`, `currency`, `max_results` | Multi-source grounded listings with price, stock, specs, and source URLs. |
| `web_search` | `query`, `country_code`, `language`, `max_results` | Structured search results with title, URL, snippet, and domain. |
| `fetch_page` | `url` | Safe, SSRF-filtered public page parser. |
| `extract_product` | `page_content` or raw candidate | Normalized product object with specifications, warranty, and seller info. |
| `get_shipping` | `product_url`, `country_code`, `city` | Shipping cost, delivery timeframe, and cross-border indicators. |
| `get_reviews` | `product_id` / `url` | Rating, review count, positive themes, and negative feedback. |
| `currency_converter`| `amount`, `from_currency`, `to_currency` | Normalized currency amount with timestamped rate. |
| `compare_products` | `products[]`, `requirements` | Side-by-side spec comparison table and 4-factor component score. |

---

### 3.3 Transparent Product Scoring Algorithm
Recommendations use a verifiable, multi-factor scoring formula:

$$\text{Final Score} = (0.40 \times \text{ReqMatch}) + (0.25 \times \text{PriceFit}) + (0.20 \times \text{ReviewSignal}) + (0.15 \times \text{DeliveryFit})$$

1. **Requirement Match ($40\%$)**: Keyword, RAM, GPU, storage, brand, and condition compatibility.
2. **Price Fit ($25\%$)**: Proximity to target budget; penalizes budget overshoots.
3. **Review Signal ($20\%$)**: Normalized customer rating and sentiment ratio.
4. **Delivery Fit ($15\%$)**: Domestic vs. cross-border delivery speed and shipping cost.

---

### 3.4 Payment Abstraction & Simulation Flow
- **Payment Abstraction**: [`backend/app/services/payment/`](file:///Users/m.muzammil/Desktop/e_comrace%20project/backend/app/services/payment/) defines `BasePaymentProvider` with `MockPaymentProvider`, `StripePaymentProvider`, `PayPalPaymentProvider`, and `RazorpayPaymentProvider`.
- **Environment Setting**: Defaults to `PAYMENT_MODE=mock`.
- **Security Check**: Initiating a checkout generates an `order_review_token`. Confirming payment validates this token and sets the status to `SIMULATED_PAID`.
- **Transparency**: The UI displays **"DEMO / SIMULATION MODE"** to ensure no real money is claimed to be charged.

---

## 4. Database Schema Migrations

Alembic migration [`a8d41e2b5c09_add_ai_shopping_agent_tables.py`](file:///Users/m.muzammil/Desktop/e_comrace%20project/backend/alembic/versions/a8d41e2b5c09_add_ai_shopping_agent_tables.py) provisions:

1. `shopping_sessions`: User session context, active country, currency, and preferences.
2. `shopping_requirements`: Extracted user requirements (budget, brands, required specs).
3. `agent_runs`: Audit trail of agent invocations, tokens, and execution latencies.
4. `agent_tool_calls`: Granular log of MCP tool invocations with execution timings.
5. `external_products`: Discovered merchant items with live price, availability, and specs.
6. `product_sources`: Domain and citation URLs for all discovered listings.
7. `product_comparisons`: Persisted comparison matrices and winner awards.
8. `shipping_quotes`: Real-time shipping quotes and delivery estimates.
9. `price_observations`: Historical price tracking and freshness timestamps.
10. `payment_intents`: Cryptographic confirmation tokens and simulation state tracking.

---

## 5. Security & Safety Controls

| Security Control | Implementation Module | Threat Mitigated |
| :--- | :--- | :--- |
| **SSRF Protection** | `backend/app/core/security/ssrf_protection.py` | Blocks internal IP ranges (RFC 1918), loopback, link-local (169.254.169.254), and non-standard ports. |
| **URL Validation** | `backend/app/core/security/url_validator.py` | Rejects malicious schemes (`javascript:`, `file:`) and validates merchant domains. |
| **Prompt Injection Filter** | `backend/app/core/security/prompt_injection.py` | Sanitizes external webpage content before LLM context injection. |
| **Least-Privilege Guardrails** | `backend/app/core/security/mcp_guardrails.py` | Enforces allowlists and requires user confirmation tokens for state mutations. |
| **Rate Limiter** | `backend/app/core/security/rate_limiter.py` | Sliding window rate limiter preventing API abuse. |

---

## 6. Verification & Test Metrics

- **Backend Pytest Suite**: 103 passed tests across 13 test files.
- **Frontend Production Build**: 20/20 Next.js 15 pages generated with zero TypeScript or linting errors.
- **End-to-End User Flow**: Verified from country selection (Pakistan) → Natural language search → Spec comparison → Cart addition → Explicit review → Simulated payment confirmation.
