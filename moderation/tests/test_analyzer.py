from moderation.core.analyzer import analyze_report

def test_ok():
    r = analyze_report("Se rompió una ventana en 2°B")
    assert r.flagged is False

def test_flag():
    r = analyze_report("ese qlo rompió la ventana")
    assert r.flagged is True

# --- Tests 2.0 (si añadiste severidad) ---
def test_severity_low_when_no_match():
    r = analyze_report("Se cortó la luz en la sala")
    assert r.flagged is False
    assert hasattr(r, "severity")
    assert r.severity == "low"

def test_severity_medium_for_insult():
    r = analyze_report("ese imbécil rompió la ventana")
    assert r.flagged is True
    assert r.severity in ("medium", "high")

def test_severity_high_for_threats():
    r = analyze_report("te voy a pegar y te voy a romper la cara")
    assert r.flagged is True
    assert r.severity in ("high", "medium")

def test_strict_mode_is_more_sensitive(monkeypatch):
    monkeypatch.setenv("MOD_STRICT", "true")
    r = analyze_report("eres un idiota")
    assert r.flagged is True
    assert r.severity in ("medium", "high")
