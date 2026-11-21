"""Repositorio de ajustes: única puerta a la BD para este módulo. No hace commit (lo hace el servicio)."""
from ...database import get_session
from ...models import Ajustes


def get_row():
    a = get_session().get(Ajustes, 1)
    return {"mapbox": a.mapbox, "territorio": a.territorio, "puntos": a.puntos} if a else None


def save(mapbox, territorio, puntos):
    s = get_session()
    a = s.get(Ajustes, 1)
    if a is None:
        a = Ajustes(id=1)
        s.add(a)
    a.mapbox, a.territorio, a.puntos = mapbox, territorio, puntos
