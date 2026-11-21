# XPAND · Panel administrativo

Panel web (tesis) para cargar y curar el catálogo gamificado de la **Comuna 10 · La Candelaria, Medellín**:
lugares, retos e insignias, con revisión editorial, usuarios de la app, equipo y ajustes.
Dos roles: **editor** (carga y envía a revisión) y **coordinador** (aprueba, publica y administra).

## Estructura del repositorio

| Carpeta | Qué contiene |
|---|---|
| `backend/` | API **Flask + MySQL**. Arquitectura en [`backend/ARQUITECTURA.md`](backend/ARQUITECTURA.md), instalación en [`backend/README.md`](backend/README.md) |
| `backend/docs/` | [`API.md`](backend/docs/API.md) (referencia de endpoints) y diagramas: modelo ER, relacional, clases y casos de uso |
| `backend/postman/` | Colección y entorno de Postman |
| `frontend/` | Panel en **JavaScript puro por componentes** (sin React ni build). Guía en [`frontend/README.md`](frontend/README.md) |

## Documentación

| Documento | Para qué sirve |
|---|---|
| [`backend/ARQUITECTURA.md`](backend/ARQUITECTURA.md) | Capas, reglas de dependencia, roles, estados, motor de puntos, modelo de datos |
| [`backend/docs/API.md`](backend/docs/API.md) | Los 44 endpoints con rol requerido y cuerpo |
| [`frontend/README.md`](frontend/README.md) | Arquitectura del SPA, rutas, permisos y recetas para crear páginas y componentes |

## Cómo correrlo

Requiere Python 3 y MySQL en ejecución. Detalle completo en [`backend/README.md`](backend/README.md).

```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        # ajusta DB_USER / DB_PASSWORD
python database/init_db.py    # crea y siembra la base "xpand"
python run.py                 # http://localhost:5000 (sirve el panel y la API en /api)
```

Cuentas de prueba (clave `xpand2026`): `coordinador@xpand.co`, `editor@xpand.co`, `juandiego@xpand.co`.

## Para leer el código (orden sugerido)

1. `backend/app/models/` — el modelo de datos (el esquema se crea desde aquí con `database/init_db.py`).
2. `backend/app/domain/` (estados, roles, catálogo) y `backend/app/modules/retos/` (controller → dto → service → repository) — permisos y motor de puntos.
3. `frontend/src/` — ver la estructura abajo.

## Frontend: estructura por componentes

JavaScript con ES modules nativos, sin React ni compilación. `h("div", {...}, hijos)` arma elementos (como JSX sin compilar) y la clase `Component` da props, estado y `setState`.

```
frontend/src/
├─ main.js            punto de entrada: monta <App/> en #root
├─ App.js             componente raíz: decide login / crear clave / panel
├─ core/              mini-framework: h(), Component, app (contexto)
├─ router/            enrutador por hash: routes.js (tabla de rutas y permisos) · router.js
├─ api/               cliente HTTP (client.js) y un archivo por recurso en endpoints/
├─ services/          auth (sesión y permisos) · store (caché de datos)
├─ utils/             helpers sin interfaz (roles, formato, nombres, svg, catálogo)
├─ components/        componentes reutilizables: Button, Chip, Field, DataTable, Modal…
├─ layouts/           estructura de pantalla: Sidebar, cambiar contraseña
└─ pages/             una página por ruta (lugares/, retos/ e insignias/ con subcomponentes), más el login y dos modales
```
