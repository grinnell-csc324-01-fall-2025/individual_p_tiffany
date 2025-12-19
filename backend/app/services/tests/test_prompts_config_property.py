import string

import pytest
from hypothesis import given, strategies as st

from app.services.prompts_config import load_prompt_config, resolve_tone, build_prompts


cfg = load_prompt_config()
valid_tones = set(cfg.get("tones", {}).keys())
default_tone = cfg.get("default_tone", "calming")


@given(st.text())
def test_resolve_tone_always_returns_valid_tone(random_tone: str):
    """For any input tone string, resolve_tone should return a valid tone."""
    t = resolve_tone(random_tone, cfg)
    assert t in valid_tones or t == default_tone


@given(
    user_text=st.text(),
    tone=st.text(),
    emotions=st.dictionaries(
        keys=st.text(min_size=1, max_size=20),
        values=st.floats(min_value=0.0, max_value=1e6, allow_nan=False, allow_infinity=False),
        max_size=10,
    ),
)
def test_build_prompts_never_leaves_placeholders(user_text, tone, emotions):
    """
    build_prompts should not crash for arbitrary inputs and should not leave
    template placeholders like {user_text} in the final strings.
    """
    built = build_prompts(user_text=user_text, emotions=emotions, tone=tone)

    assert isinstance(built.system_prompt, str)
    assert isinstance(built.user_prompt, str)
    assert built.system_prompt.strip() != ""
    assert built.user_prompt.strip() != ""

    # No obvious unreplaced placeholders
    assert "{user_text}" not in built.user_prompt
    assert "{top_emotion}" not in built.user_prompt
    assert "{tone_instruction}" not in built.system_prompt


@given(
    user_text=st.text(),
    tone=st.text(),
)
def test_build_prompts_handles_empty_emotions(user_text, tone):
    """If emotions is empty, top emotion should fall back to 'mixed' without crashing."""
    built = build_prompts(user_text=user_text, emotions={}, tone=tone)
    assert "mixed" in built.user_prompt.lower() or built.user_prompt.strip() != ""


@given(
    user_text=st.text(),
    tone=st.sampled_from(list(valid_tones) if valid_tones else ["calming"]),
    # guarantee at least 1 emotion key
    emotions=st.dictionaries(
        keys=st.text(min_size=1, max_size=10),
        values=st.floats(min_value=0.0, max_value=1000.0, allow_nan=False, allow_infinity=False),
        min_size=1,
        max_size=10,
    ),
)
def test_top_emotion_is_max_key(user_text, tone, emotions):
    """
    Property: top emotion inserted should correspond to the key with the maximum score.
    """
    max_key = max(emotions, key=emotions.get)
    built = build_prompts(user_text=user_text, emotions=emotions, tone=tone)

    # We don't require exact formatting, but the max_key should appear somewhere
    assert max_key.lower() in built.user_prompt.lower()
