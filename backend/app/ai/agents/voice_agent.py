import base64
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.ai.agents.shopping_agent import ShoppingAgent
from app.models.profile import Profile


class VoiceAgent:
    """
    Voice Shopping Agent handling speech-to-intent and voice interaction sessions.
    Shares unified session context with the primary text ShoppingAgent.
    """
    def __init__(self, db: Optional[Session] = None):
        self.db = db
        self.shopping_agent = ShoppingAgent(db=db)

    def process_voice_turn(
        self,
        transcript_input: Optional[str] = None,
        audio_base64: Optional[str] = None,
        session_id: Optional[str] = None,
        country: Optional[str] = "PK",
        currency: Optional[str] = "PKR",
        profile: Optional[Profile] = None
    ) -> Dict[str, Any]:
        """
        Interprets spoken user query, executes full shopping pipeline,
        and generates a concise spoken audio summary for the voice interface.
        """
        # In mock / browser Web Speech API mode, transcript_input is transcribed by the browser or audio decoder
        user_query = transcript_input or "Find me a good gaming laptop in Pakistan under 300,000 rupees"

        chat_response = self.shopping_agent.process_chat_turn(
            user_message=user_query,
            session_id=session_id,
            country=country,
            currency=currency,
            profile=profile
        )

        # Generate concise speech response
        products = chat_response.get("products", [])
        if products:
            top_p = products[0]
            spoken_text = (
                f"I found {len(products)} matching products in {chat_response['country']}. "
                f"I recommend the {top_p['product_name']}, priced at {top_p['currency']} {top_p['price']:,.0f} from {top_p['seller']}. "
                f"Would you like me to compare the top options or add it to your cart?"
            )
        else:
            spoken_text = chat_response.get("message", "I am searching verified stores for you.")

        return {
            "success": True,
            "session_id": chat_response["session_id"],
            "transcript": user_query,
            "spoken_reply": spoken_text,
            "audio_base64": None,  # Can stream synthesized PCM/MP3 or rely on browser speech synthesis
            "chat_response": chat_response
        }
