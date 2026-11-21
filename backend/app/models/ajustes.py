"""Modelos Ajustes (fila única id=1) y Meta (clave/valor del catálogo)."""
from sqlalchemy import Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Ajustes(Base):
    __tablename__ = "ajustes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mapbox: Mapped[dict] = mapped_column(JSON)
    territorio: Mapped[dict] = mapped_column(JSON)
    puntos: Mapped[dict | None] = mapped_column(JSON, nullable=True)


class Meta(Base):
    __tablename__ = "meta"

    clave: Mapped[str] = mapped_column(String(40), primary_key=True)
    valor: Mapped[int] = mapped_column(Integer)
