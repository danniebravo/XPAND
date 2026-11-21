"""Modelo Lugar (tabla lugares)."""
from datetime import datetime

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from ..domain.estados import ESTADOS_LUGAR


class Lugar(Base):
    __tablename__ = "lugares"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(160), unique=True)
    categoria: Mapped[str | None] = mapped_column(String(40))
    barrio: Mapped[str | None] = mapped_column(String(60), index=True)
    costo: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    costo_desde: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    duracion: Mapped[str | None] = mapped_column(String(40))
    estado: Mapped[str] = mapped_column(Enum(*ESTADOS_LUGAR, name="estado_lugar"), default="borrador", server_default="borrador", index=True)
    descripcion: Mapped[str | None] = mapped_column(String(200))
    direccion: Mapped[str | None] = mapped_column(String(200))
    coords: Mapped[str | None] = mapped_column(String(60))
    horario: Mapped[str | None] = mapped_column(String(160))
    reserva: Mapped[str | None] = mapped_column(String(10))
    fuente: Mapped[str | None] = mapped_column(String(160))
    creado_por: Mapped[str | None] = mapped_column(ForeignKey("usuarios_equipo.id", ondelete="SET NULL"))
    revisor_id: Mapped[str | None] = mapped_column(ForeignKey("usuarios_equipo.id", ondelete="SET NULL"))
    comentario_revision: Mapped[str | None] = mapped_column(String(500))
    creado_en: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    def to_dict(self, creador=None):
        return {"id": self.id, "nombre": self.nombre, "categoria": self.categoria, "barrio": self.barrio,
                "costo": self.costo, "costoDesde": bool(self.costo_desde), "duracion": self.duracion,
                "estado": self.estado, "descripcion": self.descripcion, "direccion": self.direccion,
                "coords": self.coords, "horario": self.horario, "reserva": self.reserva, "fuente": self.fuente,
                "creadoPorId": self.creado_por, "creadoPor": creador, "revisorId": self.revisor_id,
                "comentarioRevision": self.comentario_revision, "creadoEn": self.creado_en,
                "actualizadoEn": self.actualizado_en}
