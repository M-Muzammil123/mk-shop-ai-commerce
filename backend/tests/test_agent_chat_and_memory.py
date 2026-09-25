import pytest
from app.ai.agents.shopping_agent import ShoppingAgent
from app.models.shopping_agent import ShoppingSession, AgentRun


def test_agent_chat_flow_and_response_structure(db_session):
    agent = ShoppingAgent(db=db_session)
    res = agent.process_chat_turn(
        user_message="I need a gaming laptop in Pakistan under 300,000 PKR",
        country="PK"
    )
    assert res["success"] is True
    assert "session_id" in res
    assert "message" in res
    assert "intent" in res
    assert res["country"] == "PK"
    assert res["currency"] == "PKR"
    assert len(res["products"]) > 0
    assert len(res["citations"]) > 0
    assert len(res["activity_steps"]) > 0


def test_agent_clarification_on_vague_query(db_session):
    agent = ShoppingAgent(db=db_session)
    res = agent.process_chat_turn(
        user_message="shoes",
        country=None  # No country provided
    )
    assert res["intent"] == "clarification_needed" or res["clarification_question"] is not None
    assert "country" in res["message"].lower()


def test_agent_session_memory_persistence(db_session):
    agent = ShoppingAgent(db=db_session)
    res1 = agent.process_chat_turn(
        user_message="Find me an iPhone in Pakistan under 250,000",
        country="PK"
    )
    sid = res1["session_id"]

    # Verify session persisted in DB
    session_db = db_session.query(ShoppingSession).filter(ShoppingSession.session_id == sid).first()
    assert session_db is not None
    assert session_db.country == "PK"

    # Second turn in same session
    res2 = agent.process_chat_turn(
        user_message="Compare the top options",
        session_id=sid
    )
    assert res2["session_id"] == sid
    assert res2["country"] == "PK"


def test_agent_runs_logged_in_db(db_session):
    agent = ShoppingAgent(db=db_session)
    res = agent.process_chat_turn(
        user_message="Nike shoes in UK under £100",
        country="UK"
    )
    runs = db_session.query(AgentRun).all()
    assert len(runs) >= 1
    assert runs[-1].provider in ("openai", "gemini", "hybrid")
