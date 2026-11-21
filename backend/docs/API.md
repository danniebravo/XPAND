# XPAND · Referencia de la API

Base: `http://localhost:5000/api`. Autenticación: `Authorization: Bearer <JWT>` (se obtiene en `/auth/login`).
Roles: **pub** = público · **ambos** = editor y coordinador · **coord** = solo coordinador. `*` = obligatorio.
Errores: JSON con `message` y `code`; 401 sin sesión, 403 sin permiso, 404 no existe, 409 transición inválida.

## Auth

| Método | Ruta | Rol | Qué hace | Cuerpo |
|---|---|---|---|---|
| POST | `/auth/login` | pub | Devuelve JWT (cuenta inactiva: 403) | `correo*`, `password*` |
| POST | `/auth/solicitar-clave` | pub | Marca la cuenta para restablecer clave; responde igual exista o no | `correo*` |
| GET | `/auth/me` | ambos | Usuario actual y `debeCambiarClave` | — |
| POST | `/auth/cambiar-clave` | ambos | Cambia la propia clave (mín. 8, distinta) | `actual*`, `nueva*` |
| POST | `/auth/logout` | ambos | 204; sin efecto en servidor (JWT sin revocación) | — |

## Lugares

| Método | Ruta | Rol | Qué hace |
|---|---|---|---|
| GET | `/lugares` · `/lugares/<id>` | ambos | Lista / detalle |
| POST | `/lugares` | ambos | Crea en borrador (201). Nombre único. Campos: `nombre*`, `categoria`, `barrio`, `costo`, `costoDesde`, `duracion`, `descripcion`, `direccion`, `coords`, `horario`, `reserva`, `fuente` |
| PUT | `/lugares/<id>` | ambos | Edición parcial |
| DELETE | `/lugares/<id>` | ambos | Borra (204) |
| POST | `/lugares/<id>/enviar-revision` | ambos | Valida y pasa a `en_revision` |
| POST | `/lugares/<id>/publicar` | coord | `en_revision` → `publicado` (revalida) |
| POST | `/lugares/<id>/devolver` | coord | `en_revision` → `borrador`. Cuerpo: `comentario*` (máx. 500) |

## Retos

| Método | Ruta | Rol | Qué hace |
|---|---|---|---|
| GET | `/retos` · `/retos/<id>` | ambos | Lista / detalle |
| GET | `/retos/points-preview` | ambos | Desglose de puntos sin guardar. Query: `lugarId`, `tipo`, `insigniaId` |
| POST | `/retos` | ambos | Crea en borrador (201); `puntos` se calcula. Campos: `titulo*`, `lugarId`, `insigniaId`, `tipo` (def. Visita), `instruccion` |
| PUT | `/retos/<id>` | ambos | Edita y recalcula puntos |
| DELETE | `/retos/<id>` | ambos | Borra (204) |
| POST | `/retos/<id>/enviar-revision` | ambos | `borrador` → `en_revision` |
| POST | `/retos/<id>/publicar` | coord | `en_revision` → `activo` |
| POST | `/retos/<id>/devolver` | coord | `en_revision` → `borrador`. `comentario*` |

## Insignias

| Método | Ruta | Rol | Qué hace |
|---|---|---|---|
| GET | `/insignias` · `/insignias/<id>` | ambos | Lista / detalle |
| POST | `/insignias` | ambos | Crea (201). Coordinador: `activa`; editor: `borrador`. Campos: `nombre*`, `condicion`, `requisito`, `xp` (0–500, def. 10). No acepta `estado` |
| PUT | `/insignias/<id>` | ambos | Edición parcial, sin `estado` |
| DELETE | `/insignias/<id>` | ambos | Borra (204) |
| POST | `/insignias/<id>/enviar-revision` | ambos | `borrador`/`bloqueada` → `en_revision` |
| POST | `/insignias/<id>/publicar` | coord | `en_revision` → `activa` |
| POST | `/insignias/<id>/devolver` | coord | `en_revision` → `bloqueada`. `comentario*` |

## Usuarios de la app

| Método | Ruta | Rol | Qué hace |
|---|---|---|---|
| GET | `/usuarios-app` · `/usuarios-app/<id>` | ambos | Lista / detalle |
| POST | `/usuarios-app/<id>/suspender` | coord | Fija estado (`suspendida` por defecto; también `activa` o `sin_actividad`). Cuerpo opcional: `estado` |

## Equipo (todo coord)

| Método | Ruta | Qué hace | Cuerpo |
|---|---|---|---|
| GET | `/equipo` | Lista | — |
| POST | `/equipo` | Invita (201) y devuelve `claveTemporal` | `nombre*`, `correo*`, `rol*` |
| PUT | `/equipo/<id>/rol` | Cambia rol; no el propio ni el del último coordinador | `rol*` |
| POST | `/equipo/<id>/restablecer-clave` | Nueva clave temporal; no a uno mismo | — |
| PUT | `/equipo/<id>/estado` | Activa o desactiva; no a uno mismo ni al último coordinador | `activo*` (bool) |

## Ajustes y dashboard

| Método | Ruta | Rol | Qué hace |
|---|---|---|---|
| GET / PUT | `/ajustes` | coord | Lee / guarda Mapbox, territorio y puntos |
| GET | `/dashboard/stats` | ambos | Publicados, en revisión, borradores, barrios cubiertos, completitud |
| GET | `/dashboard/cobertura` | ambos | Publicados por barrio |
| GET | `/dashboard/cola-revision` | coord | Lugares, retos e insignias en `en_revision` |
| GET | `/health` | pub | Estado del servicio |

`PUT /ajustes` acepta `mapbox`, `territorio: { metaLugares 1–500 }` y `puntos: { base, bonoBarrio, bonoCategoria (0–200); umbralBarrio, umbralCategoria (0–20); bonoTipo: { Visita, Recorrido, Foto, Registro } (0–200) }`.
