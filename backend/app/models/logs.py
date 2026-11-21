"""Modelo de auditoría: RevisionLog (flujo de revisión)."""
from datetime import datetime

from sqlalchemy import Enum, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from ..domain.estados import ACCIONES_REVISION, ENTIDADES_REVISION


class RevisionLog(Base):
    __tablename__ = "revision_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entidad: Mapped[str] = mapped_column(Enum(*ENTIDADES_REVISION, name="entidad_revision"))
    entidad_id: Mapped[str] = mapped_column(String(40))
    accion: Mapped[str] = mapped_column(Enum(*ACCIONES_REVISION, name="accion_revision"))
    usuario_id: Mapped[str] = mapped_column(String(40))
    comentario: Mapped[str | None] = mapped_column(String(500))
    creado_en: Mapped[datetime] = mapped_column(TIMESTAMP, server_default=func.now())
