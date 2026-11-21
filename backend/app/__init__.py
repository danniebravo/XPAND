"""XPAND · app/__init__.py
Application factory: construye la app Flask, registra el Blueprint de cada módulo bajo /api,
maneja errores y sirve el frontend estático.
"""
import os
from datetime import datetime, timezone

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from .common.errors import ApiError, register_error_handlers
from .database import close_session

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))


def create_app():
    app = Flask(__name__, static_folder=None)
    app.json.sort_keys = False
    CORS(app)
    app.teardown_appcontext(close_session)

    @app.get("/api/health")
    def health():
        return jsonify({"ok": True, "service": "xpand-api", "time": datetime.now(timezone.utc).isoformat()})

    from .modules import (ajustes, auth, dashboard, equipo, insignias, lugares, retos, usuarios_app)
    for modulo, prefijo in ((auth, "auth"), (dashboard, "dashboard"), (lugares, "lugares"), (retos, "retos"),
                            (insignias, "insignias"), (usuarios_app, "usuarios-app"), (equipo, "equipo"),
                            (ajustes, "ajustes")):
        app.register_blueprint(modulo.bp, url_prefix=f"/api/{prefijo}")

    register_error_handlers(app)

    # Frontend estático (SPA por hash)
    @app.get("/")
    def _index():
        return send_from_directory(FRONTEND_DIR, "index.html")

    @app.get("/<path:filename>")
    def _static(filename):
        if filename.startswith("api/"):
            raise ApiError.not_found("Ruta no encontrada.")
        if os.path.isfile(os.path.join(FRONTEND_DIR, filename)):
            return send_from_directory(FRONTEND_DIR, filename)
        return send_from_directory(FRONTEND_DIR, "index.html")

    return app
