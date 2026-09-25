import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.search_analytics import ConversationalSession
from app.services.ai.ai_search_service import AISearchService
from app.schemas.ai import ConversationalSearchResponse, ParsedQueryIntent, ProductMatchItem


class ConversationalSearchService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_search = AISearchService(db)

    def process_message(
        self, session_id: str, message: str, profile_id: Optional[uuid.UUID] = None, reset: bool = False
    ) -> ConversationalSearchResponse:
        session = (
            self.db.query(ConversationalSession)
            .filter(ConversationalSession.session_id == session_id)
            .first()
        )

        if not session or reset:
            if session and reset:
                session.history = []
                session.current_filters = {}
            else:
                session = ConversationalSession(
                    session_id=session_id,
                    profile_id=profile_id,
                    history=[],
                    current_filters={}
                )
                self.db.add(session)
                self.db.commit()
                self.db.refresh(session)

        # Retrieve current history & context
        history: List[Dict[str, str]] = list(session.history or [])
        current_filters: Dict[str, Any] = dict(session.current_filters or {})

        # Parse new incoming intent
        new_intent = self.ai_search.parse_query_intent(message)

        # Merge intent with accumulated filters
        merged_query_parts = []
        if history:
            # Combine previous assistant context with user follow-up
            last_queries = [h["content"] for h in history if h.get("role") == "user"]
            merged_query_parts.extend(last_queries)
        merged_query_parts.append(message)

        full_context_query = " ".join(merged_query_parts)

        # Run hybrid search on combined query context
        search_res = self.ai_search.execute_hybrid_search(full_context_query, session_id=session_id)

        # Generate friendly conversational assistant reply
        reply = self._generate_assistant_reply(message, search_res.parsed_intent, len(search_res.products))

        # Update session history & filters
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": reply})

        session.history = history
        session.current_filters = search_res.parsed_intent.model_dump()
        self.db.commit()

        return ConversationalSearchResponse(
            success=True,
            session_id=session_id,
            reply=reply,
            parsed_intent=search_res.parsed_intent,
            products=search_res.products,
            history=history
        )

    def _generate_assistant_reply(
        self, user_msg: str, intent: ParsedQueryIntent, match_count: int
    ) -> str:
        filters_applied = []
        if intent.brand:
            filters_applied.append(f"brand: {intent.brand}")
        if intent.category:
            filters_applied.append(f"category: {intent.category}")
        if intent.max_price:
            filters_applied.append(f"under ${intent.max_price:.0f}")
        if intent.ram:
            filters_applied.append(f"RAM: {intent.ram}")
        if intent.use_case:
            filters_applied.append(f"use case: {intent.use_case}")

        if match_count > 0:
            if filters_applied:
                f_str = ", ".join(filters_applied)
                return f"I've updated your search with {f_str}. I found {match_count} matching products below."
            return f"Here are the top {match_count} products matching your request."
        else:
            return f"I couldn't find any products matching those exact criteria. Try adjusting the budget or clearing specific brand filters."
