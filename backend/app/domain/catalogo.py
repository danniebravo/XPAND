"""Catálogo de la Comuna 10 (La Candelaria, Medellín): barrios, categorías, tipos de reto y límites geográficos."""
BARRIOS = [
    "Plaza Botero", "Guayaquil", "La Veracruz", "Prado Centro", "Boston",
    "San Benito", "Prado", "Jesús Nazareno", "Corazón de Jesús",
]
BARRIOS_BASE = ["Plaza Botero", "Guayaquil", "La Veracruz", "Prado Centro", "Boston", "San Benito"]
CATEGORIAS = ["Cultura", "Gastronomía", "Arte urbano", "Historia", "Naturaleza", "Arquitectura", "Música"]
TIPOS_RETO = ["Visita", "Recorrido", "Foto", "Registro"]

# Rectángulo aproximado de la Comuna 10.
COMUNA10_BBOX = {"lat_min": 6.238, "lat_max": 6.260, "lng_min": -75.578, "lng_max": -75.558}


def parse_coords(coords):
    """'6.25, -75.56' -> (6.25, -75.56); None si no tiene ese formato."""
    if not coords or not isinstance(coords, str):
        return None
    parts = coords.split(",")
    if len(parts) != 2:
        return None
    try:
        return float(parts[0].strip()), float(parts[1].strip())
    except ValueError:
        return None


def dentro_comuna10(coords):
    p = parse_coords(coords)
    if not p:
        return False
    b = COMUNA10_BBOX
    return b["lat_min"] <= p[0] <= b["lat_max"] and b["lng_min"] <= p[1] <= b["lng_max"]
