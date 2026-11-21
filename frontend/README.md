# XPAND · Frontend

SPA en **JavaScript puro con módulos ES**, sin framework ni build. Un mini-framework propio (`h`, `Component`, `app`) renderiza el panel.

## Cómo correrlo

- **Con Flask (recomendado):** `python run.py` en `backend/` sirve panel y API en http://localhost:5000.
- **Con Live Server:** abre `http://127.0.0.1:5500/frontend/`; el front llama a la API en `http://localhost:5000`, así que el backend debe estar corriendo.
- No sirve abrirlo por `file://` (los módulos ES no cargan).
- La URL de la API se decide en `src/api/client.js`: si el puerto es 5000 usa rutas relativas; si no, `http://localhost:5000`.

## Estructura

```
frontend/
├─ index.html          carga Manrope, css/styles.css y src/main.js
├─ css/styles.css      estilos y tokens de marca
├─ img/                logo-xpand, logo-wordmark, mascota, favicon
└─ src/
   ├─ main.js          monta App en #root
   ├─ App.js           sesión, login y navegación por hash
   ├─ core/            h, Component, mount, app
   ├─ router/          routes.js (tabla de rutas) y router.js
   ├─ api/             client.js + endpoints/ (un archivo por recurso)
   ├─ services/        auth.js (sesión, permisos) y store.js (caché)
   ├─ utils/           roles, format, nombres, svg, catalogo
   ├─ components/      piezas reutilizables (barrel index.js)
   ├─ layouts/         Sidebar y CambiarClaveModal
   └─ pages/           una página por ruta; lugares/, retos/ e insignias/ tienen subcomponentes
```

## Núcleo (`src/core`)

- `h(tag, props, ...hijos)`: crea nodos DOM. `tag` puede ser un string, una función (componente funcional, recibe `props.children`) o una clase `Component`. Los textos se escapan solos; `on*` son listeners; `class` acepta arrays.
- `Component`: tiene `props`, `state` y `el`. `setState(patch | fn)` redibuja solo ese componente. Ciclo de vida: `onMount`, `onUpdate`, `onUnmount` (aquí se quitan los listeners de `document`).
- `app.go(hash)`: única vía de navegación.

## Rutas y roles

Las rutas viven en `src/router/routes.js` (`ROUTES[id] = { Page, permiso, label, icon }`); esa tabla alimenta el router y el menú. Si la ruta no existe o no hay permiso, se redirige a `#panel`.

| Hash | Archivo | Quién la ve |
|---|---|---|
| `#panel` | `PanelPage.js` | Editor y coordinador |
| `#lugares[/id]` | `LugaresPage.js` + `lugares/` | Ambos |
| `#retos[/id]` | `RetosPage.js` + `retos/` | Ambos |
| `#insignias[/id]` | `InsigniasPage.js` + `insignias/` | Ambos |
| `#usuarios[/id]` | `UsuariosPage.js` | Ambos |
| `#revision` | `RevisionPage.js` | Coordinador |
| `#equipo[/id]` | `EquipoPage.js` | Coordinador |
| `#ajustes` | `AjustesPage.js` | Coordinador |

`LoginPage.js`, `EnviadoARevision.js` y `PublicacionConfirmada.js` no son rutas.

**Permisos:** `services/auth.js` (`can()`) replica la matriz de `backend/app/domain/roles.py`. El front solo oculta; **quien protege de verdad es el backend**.

- **Editor:** crea, edita y borra lugares, retos e insignias, y los envía a revisión. Sus insignias nacen en borrador.
- **Coordinador:** además publica y devuelve (con comentario obligatorio), suspende usuarios de la app, administra el equipo y edita Ajustes.

## Datos

- `api/client.js`: `api(method, path, body)` devuelve el JSON (`null` con 204) o lanza `Error` con `status`, `code` y `details`. Envía el token Bearer guardado en localStorage; un 401 cierra la sesión.
- `api/endpoints/_recurso.js`: `crearRecurso(base)` da `listar, obtener, crear, actualizar, borrar, enviarRevision, publicar, devolver` (lugares, retos e insignias).
- `services/store.js`: caché de colecciones; las lecturas son síncronas y cada escritura llama a la API y recarga.

## Componentes (`src/components`)

`Button`, `IconButton`, `Chip`, `DataTable`, `Field`, `Select`, `Alert`, `FormError`, `Icon`, `Logo`, `PageHeader`, `DetailHeader`, `DetailField`, `StatCard`, `FilterPills` y los modales (`openModal`, `confirmDialog`, `closeModal`, `toast`, `fail`). Siempre se importan desde `components/index.js`.

## Recetas

**Página nueva** (ejemplo `reportes`):
1. Crear `src/pages/ReportesPage.js` con `export function ReportesPage({ param })`; usa `InsigniasPage.js` como modelo.
2. Registrarla en `router/routes.js`: `reportes: { Page: ReportesPage, permiso: "ver_reportes", label: "Reportes", icon: "▤" }`. El orden del objeto fija el orden del menú.
3. Añadir el permiso en `services/auth.js` (`can()`) y espejarlo en `backend/app/domain/roles.py`; sin eso la página nunca aparece.
4. Si usa datos: crear `api/endpoints/reportes.js`, reexportarlo en `api/index.js` y, si va en caché, sumarlo a `store.js`.

**Componente nuevo:**
1. Crear `src/components/Tag.js`, por ejemplo `export function Tag({ tono = "gris", children }) { return h("span", { class: ["chip", "chip-" + tono] }, children); }`.
2. Exportarlo en `components/index.js`.
3. Si necesita estado, usar una clase que extienda `Component` (modelo: `FilterPills.js`). Los componentes no tocan el store; reciben callbacks por props.

## Marca y estilos

- Tokens en `:root` de `css/styles.css`: `--azul` `#28534C` (verde de marca; el nombre es heredado), `--amarillo` `#ED6A3E` (naranja de acento), `--rojo`, `--tinta`, `--gris`, `--fondo`, `--verde`. Tipografía Manrope.
- **Los logos no se alteran** (color, forma ni tipografía). Se usan los archivos de `img/` tal cual: `logo-xpand.png` (grande), `logo-wordmark.png` (pequeño), `mascota.png`, `favicon.png`.
