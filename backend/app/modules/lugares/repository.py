"""Repositorio de lugares: única puerta a la BD para este módulo. No hace commit (lo hace el servicio)."""
from sqlalchemy import func, select

from ...database import get_session, siguiente_id
from ...models import Lugar, con_creador

# clave del dict de dominio -> atributo del modelo
_EDITABLES = {
    "nombre": "nombre", "categoria": "categoria", "barrio": "barrio", "costo": "costo",
    "costoDesde": "costo_desde", "duracion": "duracion", "estado": "estado",
    "descripcion": "descripcion", "direccion": "direccion", "coords": "coords",
    "horario": "horario", "reserva": "reserva", "fuente": "fuente",
    "revisorId": "revisor_id", "comentarioRevision": "comentario_revision",
}


def _filas(sel):
    return [l.to_dict(creador) for l, creador in get_session().execute(sel).all()]


def find_all():
    return _filas(con_creador(Lugar).order_by(Lugar.actualizado_en.desc()))


def find_en_revision():
    return _filas(con_creador(Lugar).where(Lugar.estado == "en_revision").order_by(Lugar.creado_en.desc()))


def find_by_id(id_):
    fila = get_session().execute(con_creador(Lugar).where(Lugar.id == id_)).first()
    return fila[0].to_dict(fila[1]) if fila else None


def find_by_nombre(nombre):
    l = get_session().scalars(select(Lugar).where(Lugar.nombre == nombre)).first()
    return {"id": l.id, "nombre": l.nombre} if l else None


def count_publicados_barrio(barrio):
    return get_session().scalar(
        select(func.count()).select_from(Lugar).where(Lugar.estado == "publicado", Lugar.barrio == barrio))


def count_categoria(categoria):
    return get_session().scalar(select(func.count()).select_from(Lugar).where(Lugar.categoria == categoria))


def conteos_por_estado():
    return {e: n for e, n in get_session().execute(select(Lugar.estado, func.count()).group_by(Lugar.estado)).all()}


def publicados_por_barrio():
    filas = get_session().execute(
        select(Lugar.barrio, func.count()).where(Lugar.estado == "publicado").group_by(Lugar.barrio)).all()
    return {b: n for b, n in filas}


def barrio_categoria(id_):
    fila = get_session().execute(select(Lugar.barrio, Lugar.categoria).where(Lugar.id == id_)).first()
    return {"barrio": fila.barrio, "categoria": fila.categoria} if fila else None


def next_id():
    return siguiente_id(Lugar, "l")


def insert(l):
    get_session().add(Lugar(
        id=l["id"], nombre=l["nombre"], categoria=l.get("categoria"), barrio=l.get("barrio"),
        costo=l.get("costo", 0), costo_desde=bool(l.get("costoDesde")), duracion=l.get("duracion"),
        estado=l["estado"], descripcion=l.get("descripcion"), direccion=l.get("direccion"),
        coords=l.get("coords"), horario=l.get("horario"), reserva=l.get("reserva"),
        fuente=l.get("fuente"), creado_por=l.get("creadoPor")))


def update(id_, patch):
    obj = get_session().get(Lugar, id_)
    for key, attr in _EDITABLES.items():
        if key in patch:
            setattr(obj, attr, patch[key])


def delete(id_):
    s = get_session()
    s.delete(s.get(Lugar, id_))
