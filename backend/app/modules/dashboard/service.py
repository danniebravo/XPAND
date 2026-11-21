"""Servicio de dashboard: solo lectura. Combina los servicios de lugares, retos e insignias."""
from ...domain.catalogo import BARRIOS, BARRIOS_BASE
from ..ajustes import service as ajustes
from ..insignias import service as insignias
from ..lugares import service as lugares
from ..retos import service as retos
from . import repository as repo

# Campos que la cola de revisión expone de cada entidad.
_LUGAR = ("id", "nombre", "categoria", "barrio", "costo", "costoDesde", "duracion", "estado", "descripcion",
          "direccion", "coords", "horario", "reserva", "fuente", "creadoPor")
_RETO = ("id", "titulo", "lugarId", "puntos","insigniaId", "tipo", "instruccion", "estado", "creadoPor")
_INSIGNIA = ("id", "nombre", "condicion", "requisito", "estado", "creadoPor")


def _recortar(filas, campos):
    return [{k: v for k, v in f.items() if k in campos} for f in filas]


def stats():
    por_estado = lugares.conteos_por_estado()
    m = repo.meta()
    publicados = por_estado.get("publicado", 0)
    meta_lugares = ajustes.meta_lugares()
    return {
        "publicados": publicados,
        "enRevision": por_estado.get("en_revision", 0),
        "borradores": por_estado.get("borrador", 0) + por_estado.get("incompleto", 0),
        "barriosCubiertos": len(lugares.publicados_por_barrio()),
        "totalBarrios": m.get("totalBarrios", 9),
        "metaLugares": meta_lugares,
        "completitud": round((publicados / meta_lugares) * 100) if meta_lugares else 0,
    }


def cobertura():
    conteo = {b: 0 for b in BARRIOS}
    conteo.update(lugares.publicados_por_barrio())
    return [{"barrio": b, "lugares": conteo[b]} for b in BARRIOS if conteo[b] > 0 or b in BARRIOS_BASE]


def cola_revision():
    return {
        "lugares": _recortar(lugares.en_revision(), _LUGAR),
        "retos": _recortar(retos.en_revision(), _RETO),
        "insignias": _recortar(insignias.en_revision(), _INSIGNIA),
    }
