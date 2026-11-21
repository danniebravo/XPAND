"""Modelo Insignia (tabla insignias)."""
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from ..domain.estados import ESTADOS_INSIGNIA


class Insignia(Base):
    __tablename__ = "insignias"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120))
    condicion: Mapped[str | None] = mapped_column(String(200))
    requisito: Mapped[str | None] = mapped_column(String(60))
    xp: Mapped[int] = mapped_column(Integer, default=10, server_default="10")
    estado: Mapped[str] = mapped_column(Enum(*ESTADOS_INSIGNIA, name="estado_insignia"), default="borrador", server_default="borrador")
    creado_por: Mapped[str | None] = mapped_column(ForeignKey("usuarios_equipo.id", ondelete="SET NULL"))
    creado_en: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())

    def to_dict(self, creador=None):
        return {"id": self.id, "nombre": self.nombre, "condicion": self.condicion, "requisito": self.requisito,
                "xp": self.xp, "estado": self.estado, "creadoPorId": self.creado_por, "creadoPor": creador,
                "creadoEn": self.creado_en}
