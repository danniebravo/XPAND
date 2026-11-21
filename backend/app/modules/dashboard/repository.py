"""Repositorio de dashboard: solo lee su propia tabla (meta). Lugares, retos e insignias llegan por sus servicios."""
from sqlalchemy import select

from ...database import get_session
from ...models import Meta


def meta():
    return {m.clave: m.valor for m in get_session().scalars(select(Meta))}
