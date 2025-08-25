# Moderation Module

Módulo de **moderación de incidencias** para *crowdsourcing-ciudadano*. Detecta lenguaje inapropiado, amenazas, violencia o spam antes de que el reporte entre al flujo normal.

---

## ✨ Firma y salida

```python
from moderation.core.analyzer import analyze_report

res = analyze_report("ese imbécil rompió la ventana")
print(res.flagged, res.reasons, res.severity)
# True ['match:\b(...)\b [insulto+2]'] 'medium'
```

**Firma real:**
```python
analyze_report(text: str) -> ModResult(
  flagged: bool,
  reasons: list[str],
  severity: Literal["low","medium","high"]
)
```

> Nota para backend: si quieres severidad en español, mapea así:
> ```python
> SEV_ES = {"low":"leve", "medium":"media", "high":"grave"}
> es = SEV_ES[res.severity]
> ```

---

## 📂 Estructura

```
moderation/
├─ core/
│  ├─ analyzer.py        # Lógica principal
│  └─ patterns_es.txt    # Patrones regex categorizados
├─ tests/
│  └─ test_analyzer.py   # Pruebas unitarias (pytest)
└─ README.md
```

---

## 🧪 Ejecutar tests

```bash
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pytest moderation/
```

Todos los tests deben pasar ✅.

---

## 🧩 Patrones y categorías

Patrones en `moderation/core/patterns_es.txt`.  
Cada línea es un regex con categoría al inicio entre llaves:

```text
{insulto}\b(weon|weón|qlo|culiao|idiota|imbécil|estúpido)\b
{amenaza}\b(te (voy|iremos) a (pegar|golpear|romper|reventar))\b
{violencia}\b(arma|cuchillo|pistola|golp(e|ear)|pelea|agresión)\b
{contenido_sensible}\b(acoso|bullying|hostigar|amenazar)\b
{spam}gratis\s*100%
```

Las categorías tienen pesos heurísticos y generan una **severity**:
- `low` | `medium` | `high`
- Modo estricto (más sensible): `MOD_STRICT=true`

---

## 🔌 Integración en backend (FastAPI)

En `POST /incidents`, unir `title + description`, llamar al analizador y guardar campos:

```python
from moderation.core.analyzer import analyze_report

payload_text = f"{title} {description}".strip()
res = analyze_report(payload_text)

incident.moderation_flag = res.flagged
incident.moderation_reasons = res.reasons
# opcional: severidad en español
SEV_ES = {"low":"leve", "medium":"media", "high":"grave"}
incident.moderation_severity = SEV_ES[res.severity]
```

**Contrato sugerido (OpenAPI v0.1.1):**
```json
{
  "moderation_flag": true,
  "moderation_reasons": ["insulto", "amenaza"],
  "severity": "media"
}
```

Fail-open recomendado: si el módulo falla, crear igualmente la incidencia con `moderation_flag=false`.

---

## 🔄 Calidad y CI (sugerido)
- GitHub Actions: job que corra `pytest moderation/` en cada PR.
- `pre-commit` (black/ruff) y `CODEOWNERS` para asignar `/moderation` al owner del módulo.

---
