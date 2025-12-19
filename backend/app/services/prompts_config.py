from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


_PROMPTS_CACHE: dict[str, Any] | None = None


def _config_path() -> Path:
    """
    llm_client.py / llm.py 都在 backend/app/services/
    JSON 放在 backend/app/prompts/agent_prompts.json
    services -> app -> prompts
    """
    here = Path(__file__).resolve()  # .../backend/app/services/prompt_config.py
    app_dir = here.parents[1]        # .../backend/app
    return app_dir / "prompts" / "agent_prompts.json"


def load_prompt_config() -> dict[str, Any]:
    global _PROMPTS_CACHE
    if _PROMPTS_CACHE is not None:
        return _PROMPTS_CACHE

    path = _config_path()
    with open(path, "r", encoding="utf-8") as f:
        _PROMPTS_CACHE = json.load(f)
    return _PROMPTS_CACHE


def resolve_tone(requested_tone: str, cfg: dict[str, Any]) -> str:
    tones = cfg.get("tones", {})
    default_tone = cfg.get("default_tone", "calming")
    return requested_tone if requested_tone in tones else default_tone


@dataclass(frozen=True)
class BuiltPrompts:
    system_role: str
    system_prompt: str
    user_prompt: str
    tone: str


def build_prompts(user_text: str, emotions: dict, tone: str) -> BuiltPrompts:
    cfg = load_prompt_config()
    tone_key = resolve_tone(tone, cfg)

    top_emotion = max(emotions, key=emotions.get) if emotions else "mixed"

    agent_cfg = cfg.get("agent", {})
    tones_cfg = cfg.get("tones", {})
    tone_cfg = tones_cfg.get(tone_key, {})

    system_role = agent_cfg.get("role", "system")
    system_template = agent_cfg.get("system_template", "")
    tone_instruction = tone_cfg.get("tone_instruction", "Be thoughtful and supportive.")
    user_template = tone_cfg.get("user_prompt_template", "")

    if not system_template or not user_template:
        raise ValueError("Prompt templates missing in agent_prompts.json")

    system_prompt = system_template.format(tone_instruction=tone_instruction)
    user_prompt = user_template.format(
        user_text=user_text,
        top_emotion=top_emotion,
        tone=tone_key,
    )

    return BuiltPrompts(
        system_role=system_role,
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        tone=tone_key,
    )


def build_mock_prefix(emotions: dict, tone: str) -> str:
    cfg = load_prompt_config()
    tone_key = resolve_tone(tone, cfg)
    top_emotion = max(emotions, key=emotions.get) if emotions else "mixed"

    mock_cfg = cfg.get("mock", {})
    prefixes = mock_cfg.get("prefix_templates", {})
    prefix_template = prefixes.get(tone_key) or f"Thanks for sharing. I hear {top_emotion} in what you wrote."

    return prefix_template.format(top_emotion=top_emotion, tone=tone_key)
