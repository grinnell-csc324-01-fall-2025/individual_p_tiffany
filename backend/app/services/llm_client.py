from .emotions import analyze
import os
from typing import Optional

USE_REAL = os.getenv("USE_REAL_LLM", "false").lower() in ("1", "true", "yes")
OPENAI_KEY = os.getenv("OPENAI_API_KEY")


def _mock_guidance(user_text: str, emotions: dict, tone: str = "calming") -> str:
    top = max(emotions, key=emotions.get) if emotions else "mixed"
    
    # Adjust tone in the response
    tone_prefix = {
        "calming": "I understand you're feeling " + top + ". Let's take a gentle approach:",
        "cheerful": "Great that you're sharing! I sense " + top + " in your words. Let's look at the bright side:",
        "casual": "Hey, so you're feeling " + top + "? No worries, let's break it down:",
    }.get(tone, "Thanks for sharing. I hear " + top + " in what you wrote.")
    
    return (
        tone_prefix + "\n"
        "1) Situation: Write one sentence describing what happened.\n"
        "2) Thought check: What thought makes the feeling stronger? Any evidence for/against it?\n"
        "3) Reframe: Try a kinder, more balanced alternative thought.\n"
        "4) Small action: Choose one helpful action you can take in the next 24 hours."
    )


def _call_openai(user_text: str, emotions: dict, tone: str = "calming") -> Optional[str]:
    try:
        import httpx
    except Exception:
        return None

    if not OPENAI_KEY:
        return None

    # Tone-aware system prompt
    tone_instruction = {
        "calming": "Be calm, gentle, and soothing. Use reassuring language and encourage relaxation techniques.",
        "cheerful": "Be upbeat, positive, and encouraging. Use hopeful language and celebrate small wins.",
        "casual": "Be conversational and friendly, like talking to a close friend. Keep it light and relatable.",
    }.get(tone, "Be thoughtful and supportive.")
    
    system = (
        f"You are a thoughtful cognitive-behavioral therapy assistant. {tone_instruction} "
        "Provide a short, gentle, actionable guidance based on the user's text and emotions. Keep it concise (<= 200 words)."
    )
    top = max(emotions, key=emotions.get) if emotions else "mixed"
    prompt = (
        f"User wrote: {user_text}\n\nDetected top emotion: {top}\n\n"
        f"Respond in a {tone} tone. Provide short CBT-style guidance with 3-4 steps, empathetic and {tone}."
    )

    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
    body = {
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


def generate_guidance(user_text: str, emotions: dict, tone: str = "calming") -> str:
    if USE_REAL:
        res = _call_openai(user_text, emotions, tone)
        if res:
            return res
    return _mock_guidance(user_text, emotions, tone)
