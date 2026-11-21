# XPAND · Arquitectura del backend

Arquitectura del backend del **panel de catálogo XPAND** (app gamificada de exploración urbana de la Comuna 10 · La Candelaria, Medellín).

- **API:** Flask (Python).
- **Base de datos:** MySQL, con el ORM **SQLAlchemy 2** (modelos en `app/models/`; el esquema se crea desde ellos con `Base.metadata.create_all()`).
- **Estilo:** monolito modular por capas, con una capa de **dominio**.

---

## 1. Estilo arquitectónico

Una sola aplicación desplegable (monolito) organizada en **módulos** que comparten una capa de **dominio** y la misma estructura de **capas**:

```
              HTTP (request JSON)
                     │
           ┌─────────▼─────────┐
           │    Controller     │  Blueprint de Flask: rutas + permisos (decoradores)
           └─────────┬─────────┘
                     │  DTO.parse(): valida la FORMA del JSON de entrada
           ┌─────────▼─────────┐        ┌──────────────────────────────┐
           │      Service      │───────▶│  Dominio (app/domain + el    │
           │  caso de uso +    │        │  domain.py del módulo):      │
           │  commit único     │        │  reglas puras, sin Flask/ORM │
           └─────────┬─────────┘        └──────────────────────────────┘
           ┌─────────▼─────────┐
           │    Repository     │  ÚNICA puerta a la BD (SQLAlchemy). No hace commit
           └─────────┬─────────┘
                ┌────▼────┐
                │  MySQL   │
                └─────────┘
```

Cada módulo es un paquete con estos archivos:

| Archivo | Responsabilidad |
|---|---|
| `controller.py` | Solo HTTP: arma el DTO, llama al servicio y responde JSON. Sin lógica de negocio |
| `dto.py` | **DTOs de entrada**: campos, tipos, obligatoriedad, enums y rangos (base en `app/common/dto.py`) |
| `service.py` | **Casos de uso**: orquesta dominio y repositorio y hace `commit()` **una sola vez** al final |
| `repository.py` | Acceso a datos con el ORM. Nunca hace commit |
| `domain.py` | *(si aplica)* reglas propias del módulo: puntos de retos, topes de ajustes, protección del último coordinador… |

### Capas transversales

| Paquete | Contenido |
|---|---|
| `app/domain/` | **Dominio compartido**: `catalogo.py` (barrios, categorías, tipos, rectángulo Comuna 10) · `estados.py` (estados por entidad y `Flujo` de publicación) · `roles.py` (roles + matriz de permisos) · `errors.py` (`DomainError`, `NotFound`, `ReglaNegocio`, `Validacion`, `NoAutenticado`, `Prohibido`) · `validacion.py` |
| `app/common/` | Infraestructura HTTP: `errors.py` (DomainError → código HTTP, `IntegrityError` → 409, handlers) · `security.py` (JWT, bcrypt, `require_auth`/`require_permission`) · `dto.py` (`Field`/`Dto`) |
| `app/models/` | Modelos ORM (con `Enum` reales) |
| `app/database.py` | Motor, sesión por petición, `commit()`, `siguiente_id()` |

### Reglas de dependencia (invariantes)

1. **Dirección:** `controller → service → (domain, repository)`. El dominio **no importa** Flask, SQLAlchemy ni `common/`; no sabe de HTTP.
2. **El controlador no tiene lógica de negocio.** Convierte el JSON en un DTO, llama al servicio y responde.
3. **Los servicios lanzan `DomainError`, nunca `ApiError`.** `common/errors.py` traduce: `NotFound`→404 · `Validacion`→422 · `ReglaNegocio`→409 · `NoAutenticado`→401 · `Prohibido`→403. `ApiError` queda para la capa HTTP (token ausente, ruta inexistente).
4. **Solo los repositorios tocan la BD** (sesión y modelos). Los servicios no consultan nada directamente.
5. **Un módulo usa a otro solo por su servicio, nunca por su repositorio** (p. ej. `retos` pide el contexto de un lugar a `lugares.service`; `dashboard` lee de `lugares`, `retos` e `insignias` por sus servicios).
6. **Transacción por caso de uso:** los repositorios no hacen commit; el servicio valida todo **antes** de escribir y llama a `commit()` una vez al final. Si algo falla antes, la sesión se descarta y no queda nada guardado (un reto inválido responde 422 y no deja filas a medias).
7. **Validación en dos niveles:** el DTO valida el formato; el servicio/dominio valida las reglas de negocio.
8. **Errores de base de datos:** un `IntegrityError` (duplicado, FK inválida) se devuelve como **409** en JSON, no como 500.

### Dependencias entre módulos

```
dashboard ──▶ lugares, retos, insignias, ajustes
retos     ──▶ lugares, insignias, ajustes, revision
lugares, insignias ──▶ revision
auth, equipo, usuarios_app, ajustes: independientes
```

---

## 2. Módulos

| Módulo | Responsabilidad |
|---|---|
| **auth** | Login, JWT, "¿quién soy?", cambio y solicitud de clave |
| **lugares** | CRUD de lugares + flujo de revisión; expone contexto de puntos y conteos a otros módulos |
| **retos** | CRUD de retos + **motor de puntos** (`domain.calcular_puntos`) + flujo de revisión |
| **insignias** | CRUD de insignias + flujo de revisión (el estado solo cambia por el flujo) |
| **usuarios_app** | Consulta de usuarios finales de la app + cambio de estado (`suspendida`, `activa`, `sin_actividad`) |
| **equipo** | Equipo interno, roles, invitación con clave temporal, suspender/activar |
| **ajustes** | Mapbox, territorio y reglas de puntos (valores validados por DTO) |
| **dashboard** | Datos derivados (solo lectura): estadísticas, cobertura, cola de revisión |
| **revision** | Sin rutas: historial de enviar/publicar/devolver, usado por los servicios de lugares, retos e insignias |

---

## 3. Roles y matriz de permisos

Dos roles (`domain/roles.py`). Se valida **en el servidor** (`require_permission`), nunca solo en el front.

- **Editor**: ver, crear, editar, borrar y **enviar a revisión**.
- **Coordinador**: todo lo del editor **+** publicar, devolver, ver la cola de revisión, ver el equipo, gestionar roles, ver/editar ajustes y suspender usuarios de la app.

Publicar y devolver son permisos exclusivos del coordinador, así que el editor nunca aprueba contenido (ni el suyo). El coordinador puede publicar lo que él mismo cargó.

---

## 4. Reglas de negocio clave

### 4.1 Flujo de estados (`domain/estados.py`)

Todas las entidades siguen `borrador → en_revision → (publicado | devuelto)` con la clase `Flujo`, que valida cada transición:

| Entidad | Se envía a revisión desde | Al publicar | Al devolver |
|---|---|---|---|
| Lugar | `borrador`, `incompleto` | `publicado` | `borrador` |
| Reto | `borrador` | `activo` | `borrador` |
| Insignia | `borrador`, `bloqueada` | `activa` | `bloqueada` |

- Publicar y devolver **solo** desde `en_revision`; si no, 409.
- Devolver exige `comentario` (DTO `DevolverDTO`).
- **Insignias:** `estado` ya no se acepta por POST/PUT. El coordinador las crea `activa`; las de un editor nacen en `borrador` y pasan por `enviar-revision` → `publicar`.
- Enviar/publicar un lugar exige campos obligatorios, categoría y barrio válidos y coordenadas dentro de la Comuna 10; el nombre de un lugar es único (409 si se repite).

### 4.2 Motor de puntos (retos)

`puntos del reto = lugar + tipo de reto + medalla`

| Concepto | Puntos (por defecto) | Condición |
|---|---|---|
| Lugar nuevo para el usuario | **+20** | siempre (base); sin lugar se muestra como "Reto base" y no hay bonos de barrio ni categoría |
| Barrio poco recorrido | **+30** | el barrio tiene **≤ 1** lugar publicado |
| Categoría poco visitada | **+15** | la categoría tiene **≤ 2** lugares |
| Tipo de reto | Visita +5 · Recorrido +15 · Foto +10 · Registro +5 | según el tipo elegido |
| Medalla | los **XP de la insignia** (`insignias.xp`) | si el reto otorga una insignia |

- Valores y umbrales son **editables en Ajustes** (`ajustes.puntos`, JSON; bonos 0–200, umbrales 0–20), validados en `ajustes/dto.py`.
- `puntos` siempre sale del cálculo automático (al crear y al editar); no hay ajuste manual por reto.
- Un `lugarId` o `insigniaId` inexistente en crear/actualizar responde 422. El cálculo está en `modules/retos/domain.py`.

### 4.3 Datos derivados (dashboard)

- **stats**: publicados, en revisión, borradores, barrios cubiertos, completitud (`publicados / metaLugares`).
- **cobertura**: lugares publicados por barrio.
- **cola-revision**: lugares + retos + insignias en `en_revision`.

---

## 5. Modelo de datos (MySQL)

Motor **InnoDB**, charset **utf8mb4**. IDs legibles `VARCHAR` (`l-1`, `r-2`, `i-3`, `u-4`) generados con `siguiente_id()`.
El esquema lo define el ORM (`app/models/`, con `Enum` reales); `database/init_db.py` lo crea con `Base.metadata.create_all()` y carga `database/seed.sql`.

```
usuarios_equipo ──┐ (creado_por / revisor_id)
                  ├──< lugares ──< retos >── insignias
                  └──< insignias (creado_por)

revision_log (historial; usuario_id y entidad_id sin FK)
usuarios_app (independiente)   ajustes (fila única)   meta (clave/valor)
```

Diagramas (Modelo ER, Modelo Relacional, Clases, Casos de Uso) en [`docs/`](docs/).

**Seguridad (ajustes):** el token secreto de Mapbox no se almacena: si llega `tokenSecreto` o `secretToken` en `mapbox`, se descarta (`limpiar_mapbox`). Cualquier otra clave de `mapbox` sí se guarda, así que solo debe enviarse el token público.

---

## 6. Endpoints de la API

Todo bajo `/api`. `A` = requiere JWT. El permiso entre paréntesis es el que exige el endpoint.

### auth
- `POST /api/auth/login` — `{correo, password}` → `{token, user, debeCambiarClave}`
- `POST /api/auth/solicitar-clave` — pública; marca la cuenta para que coordinación restablezca la clave
- `POST /api/auth/cambiar-clave` (A) · `GET /api/auth/me` (A) · `POST /api/auth/logout` (A)

### lugares
- `GET /api/lugares` · `GET /api/lugares/<id>` (ver_lugares)
- `POST /api/lugares` (crear) · `PUT /api/lugares/<id>` (editar) · `DELETE /api/lugares/<id>` (borrar)
- `POST /api/lugares/<id>/enviar-revision` (enviar_revision)
- `POST /api/lugares/<id>/publicar` (publicar) · `POST /api/lugares/<id>/devolver` (devolver, `comentario` obligatorio)

### retos
- `GET /api/retos` · `GET /api/retos/<id>` (ver_retos)
- `GET /api/retos/points-preview?lugarId=&tipo=&insigniaId=` (ver_retos)
- `POST /api/retos` (crear) · `PUT /api/retos/<id>` (editar) · `DELETE /api/retos/<id>` (borrar)
- `POST /api/retos/<id>/{enviar-revision|publicar|devolver}`

### insignias
- `GET /` · `GET /<id>` (ver_insignias) · `POST /` (crear) · `PUT /<id>` (editar; sin `estado`) · `DELETE /<id>` (borrar)
- `POST /<id>/enviar-revision` (enviar_revision) · `POST /<id>/publicar` · `POST /<id>/devolver` (coordinador)

### usuarios_app — `/api/usuarios-app`
- `GET /` · `GET /<id>` (ver_usuarios) · `POST /<id>/suspender` (suspender_usuario)

### equipo — `/api/equipo`
- `GET /` (ver_equipo) · `POST /` invitar, devuelve clave temporal (gestionar_roles) · `PUT /<id>/rol` · `PUT /<id>/estado` suspender/activar · `POST /<id>/restablecer-clave`

### ajustes — `/api/ajustes`
- `GET /` (ver_ajustes) · `PUT /` (editar_ajustes) — Mapbox, territorio y reglas de puntos

### dashboard — `/api/dashboard`
- `GET /stats` · `GET /cobertura` (ver_panel) · `GET /cola-revision` (ver_revision)

**Contrato de error:** `{ "error": { "code", "message", "details"? } }` con el código HTTP correcto
(401 sin token · 403 sin permiso, también login de cuenta inactiva · 404 no existe · 409 conflicto/duplicado · 422 validación).
Referencia completa de rutas, roles y cuerpos: [`docs/API.md`](docs/API.md).

Colección de Postman en [`postman/`](postman/).

---

## 7. Árbol real

```
backend/
├─ ARQUITECTURA.md · README.md · requirements.txt · run.py · .env.example
├─ database/
│  ├─ init_db.py            ← crea la BD y las tablas (ORM) y carga seed.sql
│  └─ seed.sql
├─ docs/  postman/
└─ app/
   ├─ __init__.py           ← create_app()
   ├─ config.py  database.py
   ├─ common/               ← errors.py · security.py · dto.py
   ├─ domain/               ← catalogo.py · estados.py · roles.py · errors.py · validacion.py
   ├─ models/               ← ajustes · insignia · logs · lugar · reto · usuario_app · usuario_equipo
   └─ modules/
      ├─ auth/        controller · dto · service · repository · domain
      ├─ lugares/     controller · dto · service · repository · domain
      ├─ retos/       controller · dto · service · repository · domain
      ├─ insignias/   controller · dto · service · repository · domain
      ├─ equipo/      controller · dto · service · repository · domain
      ├─ ajustes/     controller · dto · service · repository · domain
      ├─ usuarios_app/ controller · dto · service · repository
      ├─ dashboard/   controller · service · repository   (solo lectura, sin DTO)
      └─ revision/    service · repository                 (sin rutas)
```
