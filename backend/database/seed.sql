-- XPAND · seed.sql
-- Datos iniciales. Lo carga database/init_db.py después de crear las tablas desde los modelos ORM.
-- {{PASSWORD_HASH}} lo reemplaza init_db.py por el bcrypt de SEED_PASSWORD (.env): es la clave de las cuentas de equipo.

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE revision_log;
TRUNCATE TABLE retos;
TRUNCATE TABLE insignias;
TRUNCATE TABLE lugares;
TRUNCATE TABLE usuarios_app;
TRUNCATE TABLE usuarios_equipo;
TRUNCATE TABLE ajustes;
TRUNCATE TABLE meta;
SET FOREIGN_KEY_CHECKS = 1;

-- ---- Equipo interno (cuentas de login) ------------------------------------
INSERT INTO usuarios_equipo (id, nombre, correo, password_hash, rol) VALUES
  ('u-dani', 'Daniela',      'coordinador@xpand.co', '{{PASSWORD_HASH}}', 'coordinador'),
  ('u-je',   'Juan Esteban', 'editor@xpand.co',      '{{PASSWORD_HASH}}', 'editor'),
  ('u-jd',   'Juan Diego',   'juandiego@xpand.co',   '{{PASSWORD_HASH}}', 'editor');

-- ---- Lugares ---------------------------------------------------------------
INSERT INTO lugares
  (id, nombre, categoria, barrio, costo, costo_desde, duracion, estado, descripcion, direccion, coords, horario, reserva, fuente, creado_por) VALUES
  ('l-1', 'Museo de Antioquia', 'Cultura', 'Plaza Botero', 18000, 0, '1 h 30 min', 'publicado',
   'Arte precolombino, republicano y la sala de Botero. Empieza por el tercer piso y baja: la luz de la tarde entra mejor.',
   'Cra. 52 #52-43', '6.25180, -75.56860', 'Martes a domingo, 10:00 a 17:30', 'No', 'Visita en campo · 2 sep', 'u-dani'),
  ('l-2', 'Pasaje La Bastilla', 'Gastronomía', 'La Veracruz', 9000, 1, '45 min', 'en_revision',
   'Corredor de cafés y fritanga en pleno centro. Ambiente de mediodía obrero.',
   'Cl. 52 #49-30', '6.25010, -75.56720', 'Lunes a sábado, 8:00 a 18:00', 'No', 'Visita en campo · 3 sep', 'u-je'),
  ('l-3', 'Murales de Ayacucho', 'Arte urbano', 'San Benito', 0, 0, '30 min', 'borrador',
   'Tres cuadras de mural intervenido entre la 45 y la 48.',
   'Cl. Ayacucho entre 45 y 48', '6.24720, -75.56430', 'Todo el día', 'No', 'Referencia', 'u-je'),
  ('l-4', 'Parque Berrío', 'Historia', 'Guayaquil', 0, 0, '40 min', 'publicado',
   'Corazón histórico del centro, con la iglesia de La Candelaria y la escultura de Botero.',
   'Cra. 50 con Cl. 50', '6.25060, -75.56680', 'Todo el día', 'No', 'Visita en campo · 1 sep', 'u-je'),
  ('l-5', 'Casa de la Memoria', 'Historia', 'Boston', 0, 0, NULL, 'incompleto',
   'Museo dedicado a la memoria del conflicto. Falta confirmar duración y horario.',
   'Cl. Bogotá #45-18', NULL, NULL, 'No', 'Pendiente', 'u-jd'),
  ('l-6', 'Plaza Cisneros', 'Arquitectura', 'Guayaquil', 0, 0, '35 min', 'en_revision',
   'La plaza de las luces, con sus 300 mástiles de luz. Mejor al atardecer.',
   'Cra. 52 con Cl. 44', '6.24840, -75.57000', 'Todo el día', 'No', 'Visita en campo · 4 sep', 'u-jd'),
  ('l-7', 'Iglesia de la Veracruz', 'Cultura', 'La Veracruz', 0, 0, '25 min', 'publicado',
   'Templo colonial del siglo XVIII, uno de los más antiguos de la ciudad.',
   'Cl. 51 #52-58', '6.25120, -75.56650', 'Lunes a viernes, 7:00 a 17:00', 'No', 'Visita en campo', 'u-dani'),
  ('l-8', 'Teatro Lido', 'Música', 'Plaza Botero', 25000, 1, '2 h', 'borrador',
   'Sala de conciertos y eventos culturales del centro.',
   'Cra. 48 #54-20', '6.25230, -75.56420', 'Según programación', 'Sí', 'Pendiente', 'u-dani');

-- ---- Insignias -------------------------------------------------------------
INSERT INTO insignias (id, nombre, condicion, requisito, xp, estado, creado_por) VALUES
  ('i-1', 'Primera salida', 'Registrar la primera exploración', '1 reto',     10, 'activa',    'u-dani'),
  ('i-2', 'Cinco anclas',   'Cinco lugares distintos',          '5 retos',    25, 'activa',    'u-dani'),
  ('i-3', 'Fuera de ruta',  'Tres barrios nuevos',              '3 barrios',  35, 'activa',    'u-je'),
  ('i-4', 'Coleccionista',  'Cuatro categorías distintas',      '4 categorías',40, 'activa',   'u-dani'),
  ('i-5', 'Comuna 10',      'Los 18 lugares del centro',        '18 lugares', 100, 'bloqueada', 'u-dani');

-- ---- Retos -----------------------------------------------------------------
INSERT INTO retos (id, titulo, lugar_id, puntos, insignia_id, tipo, instruccion, estado, creado_por) VALUES
  ('r-1', 'Ruta de los murales', 'l-3', 65, 'i-3', 'Recorrido',
   'Recorre las tres cuadras de Ayacucho entre la 45 y la 48 y registra el mural que más te guste.', 'activo', 'u-je'),
  ('r-2', 'Café de las 4', 'l-2', 20, NULL, 'Visita',
   'Tómate un tinto en el pasaje entre las 3 y las 5 de la tarde.', 'activo', 'u-dani'),
  ('r-3', 'Botero de cerca', 'l-1', 45, 'i-4', 'Visita',
   'Encuentra la sala de Botero en el tercer piso y registra tu obra favorita.', 'en_revision', 'u-dani'),
  ('r-4', 'Cinco plazas', NULL, 120, 'i-5', 'Recorrido',
   'Visita cinco plazas distintas de la comuna 10 en una sola jornada.', 'borrador', 'u-jd');

-- ---- Usuarios de la app ----------------------------------------------------
INSERT INTO usuarios_app (id, nombre, correo, registro, exploraciones, nivel, estado) VALUES
  ('a-1', 'Laura Restrepo',  'laura.r@correo.com',  '12 ago', 14, '3 · Explorador',  'activa'),
  ('a-2', 'Camilo Ospina',   'camilo.o@correo.com', '18 ago',  9, '2 · Caminante',   'activa'),
  ('a-3', 'Valentina Ruiz',  'v.ruiz@correo.com',   '21 ago',  6, '2 · Caminante',   'activa'),
  ('a-4', 'Andrés Gómez',    'andres.g@correo.com', '2 sep',   0, '1 · Transeúnte',  'sin_actividad'),
  ('a-5', 'Juan Pablo Mesa', 'jp.mesa@correo.com',  '30 jul',  2, '1 · Transeúnte',  'suspendida');

-- ---- Ajustes (fila única) --------------------------------------------------
INSERT INTO ajustes (id, mapbox, territorio) VALUES
  (1,
   JSON_OBJECT('conectado', TRUE, 'tokenPublico', 'pk.eyJ1IjoieHBhbmQiLCJhIjoiY2x…',
               'estilo', 'Streets v12 · claro', 'zoom', '15.2', 'centro', '6.2476, -75.5658'),
   JSON_OBJECT('poligono', 'Comuna 10 · La Candelaria', 'barriosHabilitados', '9 de 17 del centro',
               'consumo', '1.240 / 50.000 cargas', 'geocodificacion', TRUE, 'metaLugares', 19));

-- ---- Meta ------------------------------------------------------------------
INSERT INTO meta (clave, valor) VALUES ('totalBarrios', 9);
