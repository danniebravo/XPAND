"""Servicio de retos: casos de uso. Todo se valida ANTES de escribir y el commit va una sola vez al final,
así un reto que no pasa la validación no queda guardado a medias."""
from ...database import commit
from ...domain.errors import NotFound, Validacion
from ...domain.estados import FLUJO_RETO
from ..ajustes import service as ajustes
from ..insignias import service as insignias
from ..lugares import service as lugares
from ..revision import service as revision
from . import domain
from . import repository as repo


def _get(id_):
    r = repo.find_by_id(id_)
    if not r:
        raise NotFound("Reto no encontrado.")
    return r


def calcular_puntos(lugar_id, tipo=None, insignia_id=None):
    """Vista previa y cálculo: no falla si el lugar o la medalla no existen (solo no suman)."""
    lugar = lugares.contexto_puntos(lugar_id) if lugar_id else None
    medalla = insignias.xp_de(insignia_id) if insignia_id else None
    return domain.calcular_puntos(ajustes.get_puntos(), lugar, tipo, medalla)


def _exigir_referencias(lugar_id, insignia_id):
    if lugar_id and lugares.contexto_puntos(lugar_id) is None:
        raise Validacion("El lugar indicado no existe.", {"campo": "lugarId"})
    if insignia_id and insignias.xp_de(insignia_id) is None:
        raise Validacion("La insignia indicada no existe.", {"campo": "insigniaId"})


def listar():
    return repo.find_all()


def obtener(id_):
    return _get(id_)


def create(data, user):
    lugar_id, insignia_id = data.get("lugarId") or None, data.get("insigniaId") or None
    tipo = data.get("tipo") or "Visita"
    _exigir_referencias(lugar_id, insignia_id)
    id_ = repo.next_id()
    repo.insert({"id": id_, "titulo": data["titulo"], "lugarId": lugar_id, "insigniaId": insignia_id, "tipo": tipo,
                 "puntos": calcular_puntos(lugar_id, tipo, insignia_id)["total"],
                 "instruccion": data.get("instruccion"), "estado": "borrador", "creadoPor": user["id"]})
    commit()
    return _get(id_)


def update(id_, data, user):
    actual = _get(id_)
    lugar_id = (data["lugarId"] or None) if "lugarId" in data else actual["lugarId"]
    insignia_id = (data["insigniaId"] or None) if "insigniaId" in data else actual["insigniaId"]
    tipo = data.get("tipo") or actual["tipo"]
    _exigir_referencias(lugar_id, insignia_id)
    repo.update(id_, {
        "titulo": data.get("titulo", actual["titulo"]), "lugarId": lugar_id, "insigniaId": insignia_id, "tipo": tipo,
        "puntos": calcular_puntos(lugar_id, tipo, insignia_id)["total"],
        "instruccion": data["instruccion"] if "instruccion" in data else actual["instruccion"]})
    commit()
    return _get(id_)


def delete(id_):
    _get(id_)
    repo.delete(id_)
    commit()


def enviar_revision(id_, user):
    r = _get(id_)
    estado = FLUJO_RETO.enviar(r["estado"])
    domain.validar_para_revision(r)
    repo.update(id_, {"estado": estado, "comentarioRevision": None})
    revision.registrar("reto", id_, "enviar_revision", user["id"])
    commit()
    return _get(id_)


def publicar(id_, user):
    r = _get(id_)
    repo.update(id_, {"estado": FLUJO_RETO.publicar(r["estado"]), "revisorId": user["id"], "comentarioRevision": None})
    revision.registrar("reto", id_, "publicar", user["id"])
    commit()
    return _get(id_)


def devolver(id_, comentario, user):
    r = _get(id_)
    repo.update(id_, {"estado": FLUJO_RETO.devolver(r["estado"]), "revisorId": user["id"],
                      "comentarioRevision": comentario})
    revision.registrar("reto", id_, "devolver", user["id"], comentario)
    commit()
    return _get(id_)


def en_revision():
    return repo.find_en_revision()
