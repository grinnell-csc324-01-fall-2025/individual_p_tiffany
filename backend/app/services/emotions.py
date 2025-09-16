# Minimal keyword-based emotions (placeholder). Replace with Naive Bayes later.
from typing import Tuple

KEYWORDS = {
    "joy": ["happy", "glad", "great", "good", "excited"],
    "sadness": ["sad", "down", "depressed", "cry"],
    "anger": ["angry", "mad", "furious"],
    "anxiety": ["anxious", "worried", "nervous", "panic"],
}

RISK_WORDS = {"suicide", "kill myself", "self-harm", "hurt myself"}

def analyze(text: str) -> Tuple[dict, bool]:
    t = text.lower()
    scores = {k: 0.0 for k in KEYWORDS}
    for emo, kws in KEYWORDS.items():
        for w in kws:
            if w in t:
                scores[emo] += 1.0
    # normalize (simple)
    total = sum(scores.values()) or 1.0
    for k in scores:
        scores[k] /= total
    risk = any(kw in t for kw in RISK_WORDS)
    return scores, risk
