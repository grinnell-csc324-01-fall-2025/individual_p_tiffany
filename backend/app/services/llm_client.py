from .emotions import analyze
import os
from typing import Optional

# Minimal optional real-LLM integration using httpx to call OpenAI's Chat Completion API.
# This is optional: by default the project uses the mocked guidance so it runs without any
# API keys. To enable real calls set USE_REAL_LLM=true and provide OPENAI_API_KEY in your .env.

USE_REAL = os.getenv("USE_REAL_LLM", "false").lower() in ("1", "true", "yes")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")


def _mock_guidance(user_text: str, emotions: dict) -> str:
    top = max(emotions, key=emotions.get) if emotions else "mixed"
    return (
        "Thanks for sharing. I hear " + top + " in what you wrote. "
        "Let's try a brief CBT step:\n"
        "1) Situation: Write one sentence describing what happened.\n"
        "2) Thought check: What thought makes the feeling stronger? Any evidence for/against it?\n"
        "3) Reframe: Try a kinder, more balanced alternative thought.\n"
        "4) Small action: Choose one helpful action you can take in the next 24 hours."
    )


def _call_openai(user_text: str, emotions: dict) -> Optional[str]:
    # Lazy import to avoid hard dependency if httpx isn't installed
    try:
        import httpx
    except Exception:
        return None

    if not OPENAI_KEY:
        return None

    system = (
        "You are a thoughtful cognitive-behavioral therapy assistant. Provide a short, gentle,"
        " actionable guidance based on the user's text and emotions. Keep it concise (<= 200 words)."
    )
    top = max(emotions, key=emotions.get) if emotions else "mixed"
    prompt = (
        f"User wrote: {user_text}\n\nDetected top emotion: {top}\n\n"
        "Provide a short CBT-style guidance with 3-4 steps, empathetic tone."
    )

    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
    body = {
        # use gpt-3.5-turbo by default (more commonly available); change if you have access to other models
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 300,
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.post(url, json=body, headers=headers)
            r.raise_for_status()
            j = r.json()
            return j["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        # print debug info to server logs (don't print the API key)
        print("OpenAI call failed:", repr(exc))
        return None


def generate_guidance(user_text: str, emotions: dict) -> str:
    # Try real provider if enabled
    if USE_REAL:
        res = _call_openai(user_text, emotions)
        if res:
            return res
        # fallback to mock if real call fails
    return _mock_guidance(user_text, emotions)
