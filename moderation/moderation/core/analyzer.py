from dataclasses import dataclass
from pathlib import Path
import regex as re

@dataclass
class ModResult:
    flagged: bool
    reasons: list[str]

_patterns_cache: list[re.Pattern] | None = None

def _load_patterns() -> list[re.Pattern]:
    """Carga y cachea los patrones del archivo patterns_es.txt"""
    global _patterns_cache
    if _patterns_cache is None:
        txt_path = Path(__file__).parent / "patterns_es.txt"
        txt = txt_path.read_text(encoding="utf-8") if txt_path.exists() else ""
        _patterns_cache = [
            re.compile(line.strip(), re.I)
            for line in txt.splitlines()
            if line.strip() and not line.startswith("#")
        ]
    return _patterns_cache

def analyze_report(text: str) -> ModResult:
    """Devuelve si el texto debe ser moderado y por qué"""
    text = text or ""
    reasons = [f"match:{p.pattern}" for p in _load_patterns() if p.search(text)]
    return ModResult(flagged=bool(reasons), reasons=reasons)
