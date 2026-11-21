"""Repositorio de auth: única puerta a la BD para este módulo. No hace commit (lo hace el servicio)."""
from sqlalchemy import func, select

from ...database import get_session
from ...models import UsuarioEquipo


def find_by_correo(correo):
    u = get_session().scalars(select(UsuarioEquipo).where(UsuarioEquipo.correo == correo)).first()
    return u.to_auth() if u else None


def find_by_id(user_id):
    u = get_session().get(UsuarioEquipo, user_id)
    return u.to_auth() if u else None


def marcar_clave_solicitada(correo):
    for u in get_session().scalars(select(UsuarioEquipo).where(UsuarioEquipo.correo == correo, UsuarioEquipo.activo)):
        u.clave_solicitada_en = func.now()


def set_password(user_id, password_hash):
    u = get_session().get(UsuarioEquipo, user_id)
    u.password_hash, u.debe_cambiar_clave = password_hash, False
