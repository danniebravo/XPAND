"""Servicio de usuarios_app: casos de uso. Hace commit una vez al final de cada uno."""
from ...database import commit
from ...domain.errors import NotFound
from . import repository as repo


def _get(id_):
    u = repo.find_by_id(id_)
    if not u:
        raise NotFound("Usuario de la app no encontrado.")
    return u


def listar():
    return repo.find_all()


def obtener(id_):
    return _get(id_)


def set_estado(id_, estado):
    _get(id_)
    repo.set_estado(id_, estado)
    commit()
    return _get(id_)
