"""Modelo UsuarioEquipo (tabla usuarios_equipo): cuentas de login del panel."""
from datetime import datetime

from sqlalchemy import Boolean, Enum, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from ..domain.roles import ROLES


class UsuarioEquipo(Base):
    __tablename__ = "usuarios_equipo"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120))
    correo: Mapped[str] = mapped_column(String(160), unique=True)
    password_hash: Mapped[str] = mapped_column(String(100))
    rol: Mapped[str] = mapped_column(Enum(*ROLES, name="rol_equipo"))
    activo: Mapped[bool] = mapped_column(Boolean, default=True, server_default="1")
    debe_cambiar_clave: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    clave_solicitada_en: Mapped[datetime | None] = mapped_column(TIMESTAMP, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())

    def to_public(self):
        return {"id": self.id, "nombre": self.nombre, "correo": self.correo, "rol": self.rol,
                "activo": bool(self.activo), "creadoEn": self.creado_en,
                "claveSolicitada": self.clave_solicitada_en is not None}

    def to_auth(self):
        return {"id": self.id, "nombre": self.nombre, "correo": self.correo, "passwordHash": self.password_hash,
                "rol": self.rol, "activo": bool(self.activo), "debeCambiarClave": bool(self.debe_cambiar_clave)}
