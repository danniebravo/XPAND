"""XPAND · database/init_db.py
Recrea la base de datos: la crea si no existe, borra y vuelve a crear las tablas desde los modelos ORM
(Base.metadata.create_all) y carga seed.sql. La clave de las cuentas sembradas sale de SEED_PASSWORD en .env.
Uso (desde backend\\, con el venv):  venv\\Scripts\\python.exe database\\init_db.py
"""
import os
import sys

import pymysql
from pymysql.constants import CLIENT

# Permite importar el paquete app desde la raíz de backend\.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.common.security import hash_password  # noqa: E402
from app.config import config  # noqa: E402
from app.database import Base, engine  # noqa: E402
import app.models  # noqa: E402,F401  (registra las tablas en Base.metadata)

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    clave = os.getenv("SEED_PASSWORD")
    if not clave:
        sys.exit("[XPAND] Falta SEED_PASSWORD en backend\\.env (clave de las cuentas sembradas).")

    conn = pymysql.connect(host=config.DB_HOST, port=config.DB_PORT, user=config.DB_USER,
                           password=config.DB_PASSWORD, charset="utf8mb4", autocommit=True,
                           client_flag=CLIENT.MULTI_STATEMENTS)
    try:
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{config.DB_NAME}` "
                        f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    finally:
        conn.close()

    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    with open(os.path.join(HERE, "seed.sql"), encoding="utf-8") as f:
        seed = f.read().replace("{{PASSWORD_HASH}}", hash_password(clave))
    conn = pymysql.connect(host=config.DB_HOST, port=config.DB_PORT, user=config.DB_USER,
                           password=config.DB_PASSWORD, database=config.DB_NAME, charset="utf8mb4",
                           autocommit=True, client_flag=CLIENT.MULTI_STATEMENTS)
    try:
        with conn.cursor() as cur:
            cur.execute(seed)
            while cur.nextset():  # consume los result sets del script multi-statement
                pass
    finally:
        conn.close()
    print(f'[XPAND] Base de datos "{config.DB_NAME}" recreada desde los modelos y sembrada.')


if __name__ == "__main__":
    main()
