from moderation.core.analyzer import analyze_report

def test_ok():
    r = analyze_report("Se rompió una ventana en 2°B")
    assert r.flagged is False

def test_flag():
    r = analyze_report("ese qlo rompió la ventana")
    assert r.flagged is True
