from .emotions import analyze

# This client returns a mocked CBT-style guidance text so the project runs with no API keys.
# Later, swap to a real provider using httpx and your API key if settings.USE_REAL_LLM is True.

def generate_guidance(user_text: str, emotions: dict) -> str:
    top = max(emotions, key=emotions.get) if emotions else "mixed"
    return (
        "Thanks for sharing. I hear " + top + " in what you wrote. "
        "Let's try a brief CBT step:
"
        "1) Situation: Write one sentence describing what happened.
"
        "2) Thought check: What thought makes the feeling stronger? Any evidence for/against it?
"
        "3) Reframe: Try a kinder, more balanced alternative thought.
"
        "4) Small action: Choose one helpful action you can take in the next 24 hours."
    )
