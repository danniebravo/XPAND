"""Repositorio de equipo: única puerta a la BD para este módulo. No hace commit (lo hace el servicio)."""
from sqlalchemy import func, select

from ...database import get_session, siguiente_id
from ...models import UsuarioEquipo


def find_all():
    return [u.to_public() for u in get_session().scalars(select(UsuarioEquipo).order_by(UsuarioEquipo.creado_en))]


def find_by_id(id_):
    u = get_session().get(UsuarioEquipo, id_)
    return u.to_public() if u else None


def existe_correo(correo):
    return get_session().scalars(select(UsuarioEquipo.id).where(UsuarioEquipo.correo == correo)).first() is not None


def count_coordinadores_activos():
    return get_session().scalar(
        select(func.count()).select_from(UsuarioEquipo).where(UsuarioEquipo.rol == "coordinador", UsuarioEquipo.activo))


def next_id():
    return siguiente_id(UsuarioEquipo, "u")


def insert(u):
    get_session().add(UsuarioEquipo(id=u["id"], nombre=u["nombre"], correo=u["correo"],
                                    password_hash=u["passwordHash"], rol=u["rol"], debe_cambiar_clave=True))


def set_clave(id_, password_hash):
    u = get_session().get(UsuarioEquipo, id_)
    u.password_hash, u.debe_cambiar_clave, u.clave_solicitada_en = password_hash, True, None


def set_activo(id_, activo):
    get_session().get(UsuarioEquipo, id_).activo = bool(activo)


def set_rol(id_, rol):
    get_session().get(UsuarioEquipo, id_).rol = rol
