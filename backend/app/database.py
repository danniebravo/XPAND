"""XPAND · database.py
Motor SQLAlchemy + sesión ligada a la petición. Solo los repositorios usan la sesión; los servicios llaman a
`commit()` una vez al final de cada caso de uso (si algo falla antes, la sesión se descarta y no queda nada guardado).
"""
from flask import g
from sqlalchemy import create_engine, select
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import config


class Base(DeclarativeBase):
    __table_args__ = {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"}


engine = create_engine(
    URL.create("mysql+pymysql", username=config.DB_USER, password=config.DB_PASSWORD, host=config.DB_HOST,
               port=config.DB_PORT, database=config.DB_NAME, query={"charset": "utf8mb4"}),
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine)


def get_session():
    """Sesión reutilizada dentro de la misma petición (guardada en flask.g)."""
    if "db_session" not in g:
        g.db_session = SessionLocal()
    return g.db_session


def commit():
    """Cierra la transacción del caso de uso. Un IntegrityError aquí lo traduce common/errors.py a 409."""
    get_session().commit()


def close_session(exc=None):
    s = g.pop("db_session", None)
    if s is not None:
        s.rollback()  # lo no confirmado con commit() se descarta
        s.close()


def siguiente_id(modelo, prefijo):
    """ID legible siguiente ('l-9', 'r-5'…). Para uso de los repositorios."""
    ids = get_session().scalars(select(modelo.id).where(modelo.id.like(f"{prefijo}-%"))).all()
    numeros = [int(i[len(prefijo) + 1:]) for i in ids if i[len(prefijo) + 1:].isdigit()]
    return f"{prefijo}-{max(numeros, default=0) + 1}"
