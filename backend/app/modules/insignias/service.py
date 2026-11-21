"""Servicio de insignias: casos de uso. Hace commit una vez al final de cada uno."""
from ...database import commit
from ...domain.errors import NotFound
from ...domain.estados import FLUJO_INSIGNIA
from ..revision import service as revision
from . import domain
from . import repository as repo


def _get(id_):
    i = repo.find_by_id(id_)
    if not i:
        raise NotFound("Insignia no encontrada.")
    return i


def listar():
    return repo.find_all()


def obtener(id_):
    return _get(id_)


def create(data, user):
    id_ = repo.next_id()
    repo.insert({**data, "id": id_, "xp": data["xp"] if data.get("xp") is not None else domain.XP_POR_DEFECTO,
                 "estado": domain.estado_inicial(user["rol"]), "creadoPor": user["id"]})
    commit()
    return _get(id_)


def update(id_, data):
    _get(id_)
    repo.update(id_, {k: v for k, v in data.items() if v is not None})
    commit()
    return _get(id_)


def delete(id_):
    _get(id_)
    repo.delete(id_)
    commit()


def enviar_revision(id_, user):
    i = _get(id_)
    repo.update(id_, {"estado": FLUJO_INSIGNIA.enviar(i["estado"])})
    revision.registrar("insignia", id_, "enviar_revision", user["id"])
    commit()
    return _get(id_)


def publicar(id_, user):
    i = _get(id_)
    repo.update(id_, {"estado": FLUJO_INSIGNIA.publicar(i["estado"])})
    revision.registrar("insignia", id_, "publicar", user["id"])
    commit()
    return _get(id_)


def devolver(id_, comentario, user):
    i = _get(id_)
    repo.update(id_, {"estado": FLUJO_INSIGNIA.devolver(i["estado"])})
    revision.registrar("insignia", id_, "devolver", user["id"], comentario)
    commit()
    return _get(id_)


# ---- Consultas que otros módulos (retos, dashboard) piden a través de este servicio ----

def xp_de(insignia_id):
    return repo.xp_de(insignia_id)


def en_revision():
    return repo.find_en_revision()
