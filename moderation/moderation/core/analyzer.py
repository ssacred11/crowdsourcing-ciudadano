from dataclasses import dataclass
from pathlib import Path
import os
import regex as re
from typing import List, Tuple

@dataclass
class ModResult:
    flagged: bool
    reasons: List[str]
    severity: str = "low"  # low | medium | high

# Cache de (pattern_compilado, categoria)
_patterns_cache: List[Tuple[re.Pattern, str]] | None = None

CATEGORIES = {
    "insulto": 2,
    "amenaza": 3,
    "violencia": 3,
    "spam": 1,
    "contenido_sensible": 2,
}

# Regex para separar etiqueta opcional {cat} del patrón real
LINE_RE = re.compile(r'^\s*(?:\{(?P<cat>\w+)\})?\s*(?P<patt>.+?)\s*$')

def _load_patterns() -> List[Tuple[re.Pattern, str]]:
    global _patterns_cache
    if _patterns_cache is not None:
        return _patterns_cache

    txt_path = Path(__file__).parent / "patterns_es.txt"
    txt = txt_path.read_text(encoding="utf-8") if txt_path.exists() else ""
    pairs: List[Tuple[re.Pattern, str]] = []

    for raw in txt.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = LINE_RE.match(line)
        if not m:
            continue
        cat = (m.group("cat") or "spam").lower()
        patt = m.group("patt")
        compiled = re.compile(patt, re.I)  # compilar SOLO el patrón sin {cat}
        pairs.append((compiled, cat))

    _patterns_cache = pairs
    return _patterns_cache

def _severity_from_score(score: int, strict: bool) -> str:
    if strict:
        return "high" if score >= 3 else ("medium" if score >= 2 else "low")
    return "high" if score >= 4 else ("medium" if score >= 2 else "low")

def analyze_report(text: str) -> ModResult:
    text = text or ""
    strict = os.getenv("MOD_STRICT", "false").lower() == "true"

    reasons: List[str] = []
    score = 0

    for patt, cat in _load_patterns():
        if patt.search(text):
            weight = CATEGORIES.get(cat, 1)
            score += weight
            reasons.append(f"match:{patt.pattern} [{cat}+{weight}]")

    severity = _severity_from_score(score, strict)
    flagged = score > 0
    return ModResult(flagged=flagged, reasons=reasons, severity=severity)
