import pytest
from app.ai.agents.voice_agent import VoiceAgent


def test_voice_turn_speech_interpretation(db_session):
    voice_agent = VoiceAgent(db=db_session)
    res = voice_agent.process_voice_turn(
        transcript_input="Find me a good laptop in Pakistan under 300,000 rupees",
        country="PK"
    )
    assert res["success"] is True
    assert "transcript" in res
    assert "spoken_reply" in res
    assert len(res["spoken_reply"]) > 10
    assert res["chat_response"]["country"] == "PK"
    assert len(res["chat_response"]["products"]) > 0


def test_voice_turn_uk_running_shoes(db_session):
    voice_agent = VoiceAgent(db=db_session)
    res = voice_agent.process_voice_turn(
        transcript_input="Find me running shoes in the UK under £100",
        country="UK"
    )
    assert res["success"] is True
    assert res["chat_response"]["currency"] == "GBP"


def test_voice_turn_synchronizes_with_chat_session(db_session):
    voice_agent = VoiceAgent(db=db_session)
    res = voice_agent.process_voice_turn(
        transcript_input="Show me iPhones in Pakistan",
        country="PK"
    )
    sid = res["session_id"]
    assert sid is not None
    assert len(res["chat_response"]["citations"]) > 0
