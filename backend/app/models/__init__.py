"""Modelos ORM (SQLAlchemy), uno por entidad. `Base.metadata.create_all()` crea el esquema a partir de ellos."""
from sqlalchemy import select

from .ajustes import Ajustes, Meta
from .insignia import Insignia
from .logs import RevisionLog
from .lugar import Lugar
from .reto import Reto
from .usuario_app import UsuarioApp
from .usuario_equipo import UsuarioEquipo


def con_creador(modelo):
    """SELECT de `modelo` junto con el nombre de quien lo creó (LEFT JOIN a usuarios_equipo)."""
    return select(modelo, UsuarioEquipo.nombre).outerjoin(UsuarioEquipo, UsuarioEquipo.id == modelo.creado_por)
