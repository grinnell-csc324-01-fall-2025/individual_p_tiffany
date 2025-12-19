from __future__ import annotations

import os
from typing import Optional

from .prompts_config import build_prompts

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")


def call_llm(user_text: str, emotions: dict, tone: str = "calming") -> Optional[str]:
    """
    Calls the LLM using prompts built from external JSON config (abstraction).
    """
    if not OPENAI_KEY:
        return None

    try:
        import httpx
    except Exception:
        return None

    built = build_prompts(user_text=user_text, emotions=emotions, tone=tone)

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": built.system_role, "content": built.system_prompt},
            {"role": "user", "content": built.user_prompt},
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
        print("OpenAI call failed:", repr(exc))
        return None
