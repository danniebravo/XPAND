"""XPAND · run.py — punto de entrada de la API Flask (host, puerto y debug salen de .env)."""
from app import create_app
from app.config import config

app = create_app()

if __name__ == "__main__":
    print(f"[XPAND] API Flask + frontend en http://localhost:{config.PORT}  (host {config.HOST}, debug={config.DEBUG})")
    print(f"[XPAND] Salud: http://localhost:{config.PORT}/api/health")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
