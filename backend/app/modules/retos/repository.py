"""Repositorio de retos: única puerta a la BD para este módulo. No hace commit (lo hace el servicio)."""
from ...database import get_session, siguiente_id
from ...models import Reto, con_creador

_EDITABLES = {
    "titulo": "titulo", "lugarId": "lugar_id", "puntos": "puntos",
    "insigniaId": "insignia_id", "tipo": "tipo", "instruccion": "instruccion", "estado": "estado",
    "revisorId": "revisor_id", "comentarioRevision": "comentario_revision",
}


def _filas(sel):
    return [r.to_dict(creador) for r, creador in get_session().execute(sel).all()]


def find_all():
    return _filas(con_creador(Reto).order_by(Reto.actualizado_en.desc()))


def find_en_revision():
    return _filas(con_creador(Reto).where(Reto.estado == "en_revision").order_by(Reto.creado_en.desc()))


def find_by_id(id_):
    fila = get_session().execute(con_creador(Reto).where(Reto.id == id_)).first()
    return fila[0].to_dict(fila[1]) if fila else None


def next_id():
    return siguiente_id(Reto, "r")


def insert(r):
    get_session().add(Reto(id=r["id"], titulo=r["titulo"], lugar_id=r.get("lugarId"), puntos=r.get("puntos", 0),
                           insignia_id=r.get("insigniaId"),
                           tipo=r.get("tipo"), instruccion=r.get("instruccion"), estado=r["estado"],
                           creado_por=r.get("creadoPor")))


def update(id_, patch):
    obj = get_session().get(Reto, id_)
    for key, attr in _EDITABLES.items():
        if key in patch:
            setattr(obj, attr, patch[key])


def delete(id_):
    s = get_session()
    s.delete(s.get(Reto, id_))
