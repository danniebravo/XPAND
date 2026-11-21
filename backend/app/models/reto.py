"""Modelo Reto (tabla retos)."""
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Integer, String, Text, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from ..domain.catalogo import TIPOS_RETO
from ..domain.estados import ESTADOS_RETO


class Reto(Base):
    __tablename__ = "retos"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    titulo: Mapped[str] = mapped_column(String(160))
    lugar_id: Mapped[str | None] = mapped_column(ForeignKey("lugares.id", ondelete="SET NULL"))
    puntos: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    insignia_id: Mapped[str | None] = mapped_column(ForeignKey("insignias.id", ondelete="SET NULL"))
    tipo: Mapped[str] = mapped_column(Enum(*TIPOS_RETO, name="tipo_reto"), default="Visita", server_default="Visita")
    instruccion: Mapped[str | None] = mapped_column(Text)
    estado: Mapped[str] = mapped_column(Enum(*ESTADOS_RETO, name="estado_reto"), default="borrador", server_default="borrador", index=True)
    creado_por: Mapped[str | None] = mapped_column(ForeignKey("usuarios_equipo.id", ondelete="SET NULL"))
    revisor_id: Mapped[str | None] = mapped_column(ForeignKey("usuarios_equipo.id", ondelete="SET NULL"))
    comentario_revision: Mapped[str | None] = mapped_column(String(500))
    creado_en: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    def to_dict(self, creador=None):
        return {"id": self.id, "titulo": self.titulo, "lugarId": self.lugar_id, "puntos": self.puntos,
                "insigniaId": self.insignia_id, "tipo": self.tipo,
                "instruccion": self.instruccion, "estado": self.estado, "creadoPorId": self.creado_por,
                "creadoPor": creador, "revisorId": self.revisor_id, "comentarioRevision": self.comentario_revision,
                "creadoEn": self.creado_en, "actualizadoEn": self.actualizado_en}
