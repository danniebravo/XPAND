"""XPAND · config.py
Lee las variables de entorno (backend\.env) una sola vez.
"""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))


def _int(name, default):
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


class Config:
    HOST = os.getenv("FLASK_HOST", "127.0.0.1")
    PORT = _int("FLASK_PORT", 5000)
    DEBUG = _bool("FLASK_DEBUG", False)

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = _int("DB_PORT", 3306)
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "xpand")

    JWT_SECRET = os.getenv("JWT_SECRET", "cambia-esto")
    JWT_EXPIRES_HOURS = _int("JWT_EXPIRES_HOURS", 12)


config = Config()
