"""Repositorio de revision: acceso a datos (ORM) del historial. No hace commit."""
from ...database import get_session
from ...models import RevisionLog


def insert(entidad, entidad_id, accion, usuario_id, comentario=None):
    get_session().add(RevisionLog(entidad=entidad, entidad_id=entidad_id, accion=accion,
                                  usuario_id=usuario_id, comentario=comentario))
