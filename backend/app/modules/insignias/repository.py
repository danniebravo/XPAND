"""Repositorio de insignias: única puerta a la BD para este módulo. No hace commit (lo hace el servicio)."""
from ...database import get_session, siguiente_id
from ...models import Insignia, con_creador

_EDITABLES = ("nombre", "condicion", "requisito", "xp", "estado")


def _filas(sel):
    return [i.to_dict(creador) for i, creador in get_session().execute(sel).all()]


def find_all():
    return _filas(con_creador(Insignia).order_by(Insignia.creado_en.desc()))


def find_en_revision():
    return _filas(con_creador(Insignia).where(Insignia.estado == "en_revision").order_by(Insignia.creado_en.desc()))


def find_by_id(id_):
    fila = get_session().execute(con_creador(Insignia).where(Insignia.id == id_)).first()
    return fila[0].to_dict(fila[1]) if fila else None


def xp_de(id_):
    i = get_session().get(Insignia, id_)
    return {"nombre": i.nombre, "xp": i.xp} if i else None


def next_id():
    return siguiente_id(Insignia, "i")


def insert(i):
    get_session().add(Insignia(id=i["id"], nombre=i["nombre"], condicion=i.get("condicion"),
                               requisito=i.get("requisito"), xp=i["xp"], estado=i["estado"],
                               creado_por=i.get("creadoPor")))


def update(id_, patch):
    obj = get_session().get(Insignia, id_)
    for campo in _EDITABLES:
        if campo in patch:
            setattr(obj, campo, patch[campo])


def delete(id_):
    s = get_session()
    s.delete(s.get(Insignia, id_))
