"""Servicio de ajustes: casos de uso. Hace commit una vez al final de cada uno."""
from ...database import commit
from ...domain.errors import NotFound
from . import domain
from . import repository as repo

META_LUGARES_DEFECTO = 19

def get_puntos():
    """Reglas vigentes para calcular puntos (las usa el módulo retos, sin exigir permiso de ajustes)."""
    a = repo.get_row()
    return domain.merge_puntos(a["puntos"] if a else None)


def meta_lugares():
    """Meta de lugares publicados del catálogo (la usa el panel; se edita en Ajustes → Territorio)."""
    a = repo.get_row()
    return (a["territorio"] or {}).get("metaLugares", META_LUGARES_DEFECTO) if a else META_LUGARES_DEFECTO


def get():
    a = repo.get_row()
    if not a:
        raise NotFound("No hay ajustes configurados.")
    return {**a, "puntos": domain.merge_puntos(a["puntos"])}


def save(patch):
    actual = get()
    mapbox = domain.limpiar_mapbox({**actual["mapbox"], **(patch.get("mapbox") or {})})
    territorio = {**actual["territorio"], **(patch.get("territorio") or {})}
    repo.save(mapbox, territorio, domain.merge_puntos(actual["puntos"], patch.get("puntos")))
    commit()
    return get()
