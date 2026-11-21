"""Modelo UsuarioApp (tabla usuarios_app): consumidores de la app móvil."""
from sqlalchemy import Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from ..domain.estados import ESTADOS_USUARIO_APP


class UsuarioApp(Base):
    __tablename__ = "usuarios_app"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120))
    correo: Mapped[str] = mapped_column(String(160), unique=True)
    registro: Mapped[str | None] = mapped_column(String(40))
    exploraciones: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    nivel: Mapped[str | None] = mapped_column(String(40))
    estado: Mapped[str] = mapped_column(Enum(*ESTADOS_USUARIO_APP, name="estado_usuario_app"), default="activa", server_default="activa")

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre, "correo": self.correo, "registro": self.registro,
                "exploraciones": self.exploraciones, "nivel": self.nivel, "estado": self.estado}
