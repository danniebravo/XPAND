"""Reglas propias de ajustes: valores por defecto y topes de las reglas de puntos."""
PUNTOS_DEFAULT = {"base": 20, "bonoBarrio": 30, "bonoCategoria": 15, "umbralBarrio": 1, "umbralCategoria": 2,
                  "bonoTipo": {"Visita": 5, "Recorrido": 15, "Foto": 10, "Registro": 5}}
# (mínimo, máximo) de cada valor numérico editable
LIMITE_BONO = (0, 200)
LIMITE_UMBRAL = (0, 20)


def merge_puntos(guardado, nuevos=None):
    """Defaults < lo guardado < lo nuevo, fusionando también el sub-objeto bonoTipo."""
    g, n = guardado or {}, nuevos or {}
    return {**PUNTOS_DEFAULT, **g, **n,
            "bonoTipo": {**PUNTOS_DEFAULT["bonoTipo"], **(g.get("bonoTipo") or {}), **(n.get("bonoTipo") or {})}}


def limpiar_mapbox(mapbox):
    """El token secreto de Mapbox nunca se guarda ni se expone por la API."""
    return {k: v for k, v in mapbox.items() if k not in ("tokenSecreto", "secretToken")}
