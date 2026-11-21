# XPAND · Backend

API del panel de catálogo XPAND, en **Flask (Python)** + **MySQL** (ORM SQLAlchemy 2), con arquitectura de
**monolito modular por capas**: una capa de **dominio** compartida y, por cada módulo,
`controller.py` · `dto.py` · `service.py` · `repository.py` (+ `domain.py` si el módulo tiene reglas propias).

Arquitectura, reglas de dependencia y modelo de datos: [`ARQUITECTURA.md`](ARQUITECTURA.md) ·
Diagramas: carpeta [`docs/`](docs/).

## Estructura

```
backend/
├─ run.py                  # punto de entrada → python run.py
├─ requirements.txt
├─ .env.example / .env
├─ database/
│  ├─ seed.sql             # datos iniciales (SQL puro; la clave se inyecta desde .env)
│  └─ init_db.py           # crea la BD, las tablas (desde los modelos ORM) y la siembra
├─ docs/                   # diagramas ER, relacional, clases y casos de uso
├─ postman/                # colección + environment para probar
└─ app/
   ├─ __init__.py          # create_app(): registra módulos, errores y sirve el frontend
   ├─ config.py            # variables de entorno
   ├─ database.py          # motor SQLAlchemy, sesión por petición, commit(), siguiente_id()
   ├─ common/              # errors (DomainError → HTTP, IntegrityError → 409) · security · dto
   ├─ domain/              # catalogo · estados (flujo de revisión) · roles · errors · validacion
   ├─ models/              # modelos ORM, uno por entidad
   └─ modules/             # un paquete por módulo
      auth · dashboard · lugares · retos · insignias · usuarios_app · equipo · ajustes · revision
```

## Puesta en marcha

Requiere **MySQL** corriendo.

```bash
cd backend
python -m venv venv
venv\Scripts\activate              # Windows  (bash: source venv/Scripts/activate)
pip install -r requirements.txt
copy .env.example .env             # ajusta DB_USER / DB_PASSWORD / SEED_PASSWORD
python database/init_db.py         # crea la base "xpand", sus tablas y la siembra
python run.py                      # API en http://localhost:5000
```

`init_db.py` **recrea** las tablas (borra los datos existentes). Salud: `GET /api/health`.

### Variables de `.env`
| Variable | Para qué |
|---|---|
| `FLASK_HOST` / `FLASK_PORT` | dónde escucha `run.py` (por defecto `127.0.0.1:5000`) |
| `FLASK_DEBUG` | `true` activa recargador y depurador (solo desarrollo; por defecto `false`) |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | conexión a MySQL |
| `JWT_SECRET` / `JWT_EXPIRES_HOURS` | firma y duración del token (si no defines `JWT_SECRET` se usa `cambia-esto`: cámbialo fuera de desarrollo) |
| `SEED_PASSWORD` | clave de las cuentas sembradas por `init_db.py` |

### Cuentas de equipo (sembradas)
| Correo | Rol |
|---|---|
| coordinador@xpand.co | coordinador |
| editor@xpand.co | editor |
| juandiego@xpand.co | editor |

Todas con la clave definida en `SEED_PASSWORD`.

## Probar en Postman

Importa `postman/XPAND.postman_collection.json` y `postman/XPAND.postman_environment.json`,
selecciona el environment, y ejecuta **Auth › Login (coordinador)** (guarda el token solo).
Ojo: **Auth › Cambiar clave** cambia la clave del coordinador a `NuevaClave123`; si la ejecutas, el login siguiente con `xpand2026` falla (re-siembra con `init_db.py`).

## Endpoints

Bajo `/api`: `auth`, `lugares`, `retos` (incluye `points-preview`), `insignias`,
`usuarios-app`, `equipo`, `ajustes`, `dashboard`. Todos (salvo login, solicitar-clave y health) requieren
`Authorization: Bearer <token>` y validan permisos por rol. Lista completa con roles y cuerpos: [`docs/API.md`](docs/API.md).

Nota: los `puntos` de los retos sembrados en `seed.sql` están escritos a mano y no coinciden con la fórmula; se recalculan al editar el reto.
Contrato de error: `{ "error": { "code", "message", "details"? } }`.
