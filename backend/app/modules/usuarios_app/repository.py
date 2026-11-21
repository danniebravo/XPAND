"""Repositorio de usuarios_app: única puerta a la BD para este módulo. No hace commit (lo hace el servicio)."""
from sqlalchemy import select

from ...database import get_session
from ...models import UsuarioApp


def find_all():
    return [u.to_dict() for u in get_session().scalars(select(UsuarioApp).order_by(UsuarioApp.nombre))]


def find_by_id(id_):
    u = get_session().get(UsuarioApp, id_)
    return u.to_dict() if u else None


def set_estado(id_, estado):
    get_session().get(UsuarioApp, id_).estado = estado
