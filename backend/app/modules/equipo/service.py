"""Servicio de equipo: casos de uso. Hace commit una vez al final de cada uno."""
from ...common.security import clave_temporal, hash_password
from ...database import commit
from ...domain.errors import NotFound, ReglaNegocio
from . import domain
from . import repository as repo


def _get(id_):
    u = repo.find_by_id(id_)
    if not u:
        raise NotFound("Miembro del equipo no encontrado.")
    return u


def listar():
    return repo.find_all()


def invitar(data):
    correo = data["correo"].lower()
    if repo.existe_correo(correo):
        raise ReglaNegocio("Ya existe una cuenta con ese correo.", {"campo": "correo"})
    id_, clave = repo.next_id(), clave_temporal()
    repo.insert({"id": id_, "nombre": data["nombre"], "correo": correo,
                 "passwordHash": hash_password(clave), "rol": data["rol"]})
    commit()
    return {**_get(id_), "claveTemporal": clave}


def restablecer_clave(id_, actor):
    _get(id_)
    domain.validar_restablecer(actor["id"], id_)
    clave = clave_temporal()
    repo.set_clave(id_, hash_password(clave))
    commit()
    return {"claveTemporal": clave}


def set_estado(id_, activo, actor):
    u = _get(id_)
    if not activo:
        domain.validar_desactivar(actor["id"], u, repo.count_coordinadores_activos())
    repo.set_activo(id_, activo)
    commit()
    return _get(id_)


def set_rol(id_, rol, actor):
    u = _get(id_)
    domain.validar_cambio_rol(actor["id"], u, rol, repo.count_coordinadores_activos())
    repo.set_rol(id_, rol)
    commit()
    return _get(id_)
