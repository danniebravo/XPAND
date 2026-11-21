"""Servicio de lugares: casos de uso. Orquesta dominio y repositorio; hace commit una vez al final de cada uno."""
from ...database import commit
from ...domain.errors import NotFound, ReglaNegocio
from ...domain.estados import FLUJO_LUGAR
from ..revision import service as revision
from . import domain
from . import repository as repo


def _get(id_):
    l = repo.find_by_id(id_)
    if not l:
        raise NotFound("Lugar no encontrado.")
    return l


def _exigir_nombre_libre(nombre, ignore_id=None):
    existente = repo.find_by_nombre(nombre)
    if existente and existente["id"] != ignore_id:
        raise ReglaNegocio(f'Ya existe un lugar llamado "{nombre}".', {"campo": "nombre"})


def listar():
    return repo.find_all()


def obtener(id_):
    return _get(id_)


def create(data, user):
    _exigir_nombre_libre(data["nombre"])
    id_ = repo.next_id()
    repo.insert({**data, "id": id_, "costo": data.get("costo") or 0, "estado": "borrador", "creadoPor": user["id"]})
    commit()
    return _get(id_)


def update(id_, patch):
    actual = _get(id_)
    if "nombre" in patch and patch["nombre"] != actual["nombre"]:
        _exigir_nombre_libre(patch["nombre"], ignore_id=id_)
    if "costo" in patch:
        patch["costo"] = patch["costo"] or 0
    repo.update(id_, patch)
    commit()
    return _get(id_)


def delete(id_):
    _get(id_)
    repo.delete(id_)
    commit()


def enviar_revision(id_, user):
    l = _get(id_)
    estado = FLUJO_LUGAR.enviar(l["estado"])
    domain.validar_para_revision(l)
    repo.update(id_, {"estado": estado, "comentarioRevision": None})
    revision.registrar("lugar", id_, "enviar_revision", user["id"])
    commit()
    return _get(id_)


def publicar(id_, user):
    l = _get(id_)
    estado = FLUJO_LUGAR.publicar(l["estado"])
    domain.validar_para_revision(l)
    repo.update(id_, {"estado": estado, "revisorId": user["id"], "comentarioRevision": None})
    revision.registrar("lugar", id_, "publicar", user["id"])
    commit()
    return _get(id_)


def devolver(id_, comentario, user):
    l = _get(id_)
    estado = FLUJO_LUGAR.devolver(l["estado"])
    repo.update(id_, {"estado": estado, "revisorId": user["id"], "comentarioRevision": comentario})
    revision.registrar("lugar", id_, "devolver", user["id"], comentario)
    commit()
    return _get(id_)


# ---- Consultas que otros módulos (retos, dashboard) piden a través de este servicio ----

def contexto_puntos(id_):
    """Barrio/categoría del lugar y cuántos lugares los comparten; None si el lugar no existe."""
    l = repo.barrio_categoria(id_)
    if not l:
        return None
    return {**l, "publicadosBarrio": repo.count_publicados_barrio(l["barrio"]),
            "enCategoria": repo.count_categoria(l["categoria"])}


def conteos_por_estado():
    return repo.conteos_por_estado()


def publicados_por_barrio():
    return repo.publicados_por_barrio()


def en_revision():
    return repo.find_en_revision()
