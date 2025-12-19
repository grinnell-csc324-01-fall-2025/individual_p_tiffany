import pytest
from hypothesis import given, strategies as st

from app.services.emotions import analyze, KEYWORDS, RISK_WORDS


# Property 1: keys are always the same as KEYWORDS
@given(st.text())
def test_analyze_returns_all_emotion_keys(text):
    scores, risk = analyze(text)
    assert set(scores.keys()) == set(KEYWORDS.keys())


# Property 2: all scores are non-negative
@given(st.text())
def test_emotion_scores_are_non_negative(text):
    scores, _ = analyze(text)
    assert all(score >= 0 for score in scores.values())


# Property 3: scores are normalized (sum ≈ 1)
@given(st.text())
def test_emotion_scores_sum_to_one(text):
    scores, _ = analyze(text)
    total = sum(scores.values())
    assert total == pytest.approx(1.0)


# Property 4: empty or random text never crashes and returns valid output
@given(st.text())
def test_analyze_never_crashes(text):
    scores, risk = analyze(text)
    assert isinstance(scores, dict)
    assert isinstance(risk, bool)


# Property 5: presence of risk words implies risk == True
@given(
    base_text=st.text(),
    risk_word=st.sampled_from(list(RISK_WORDS)),
)
def test_risk_detected_when_risk_word_present(base_text, risk_word):
    text = base_text + " " + risk_word
    _, risk = analyze(text)
    assert risk is True


# Property 6: if no risk words appear, risk should be False
@given(
    text=st.text().filter(
        lambda t: not any(rw in t.lower() for rw in RISK_WORDS)
    )
)
def test_no_risk_words_means_no_risk(text):
    _, risk = analyze(text)
    assert risk is False
