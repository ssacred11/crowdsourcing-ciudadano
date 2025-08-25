-- función para timestamp de actualización
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END$$ LANGUAGE plpgsql;

-- tenants
CREATE TABLE IF NOT EXISTS tenants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- roles (global)
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- estados de incidencia (global)
CREATE TABLE IF NOT EXISTS estados_incidencia (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- categorías (por tenant)
CREATE TABLE IF NOT EXISTS categorias (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT uq_categorias_tenant_nombre UNIQUE (tenant_id, nombre)
);

-- tipos de problema (por tenant)
CREATE TABLE IF NOT EXISTS tipos_problema (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  nombre VARCHAR(150) NOT NULL,
  categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  CONSTRAINT uq_tipos_problema_tenant_nombre UNIQUE (tenant_id, nombre)
);

-- ubicaciones (por tenant)
CREATE TABLE IF NOT EXISTS ubicaciones (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  nombre VARCHAR(150) NOT NULL,
  CONSTRAINT uq_ubicaciones_tenant_nombre UNIQUE (tenant_id, nombre)
);

-- usuarios (por tenant)
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo_electronico VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_usuarios_tenant_correo UNIQUE (tenant_id, correo_electronico)
);
CREATE INDEX IF NOT EXISTS ix_usuarios_tenant_rol ON usuarios (tenant_id, rol_id);
DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- asignaciones (encargado por tipo, por tenant)
CREATE TABLE IF NOT EXISTS asignaciones (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  tipo_problema_id BIGINT NOT NULL REFERENCES tipos_problema(id) ON DELETE CASCADE,
  encargado_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  CONSTRAINT uq_asignaciones_tenant_tipo UNIQUE (tenant_id, tipo_problema_id)
);

-- incidencias
CREATE TABLE IF NOT EXISTS incidencias (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  tipo_problema_id BIGINT NOT NULL REFERENCES tipos_problema(id) ON DELETE RESTRICT,
  ubicacion_id BIGINT NOT NULL REFERENCES ubicaciones(id) ON DELETE RESTRICT,
  descripcion VARCHAR(500) NOT NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado_id BIGINT NOT NULL REFERENCES estados_incidencia(id) ON DELETE RESTRICT,
  asignado_a_usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  comentario_gestion VARCHAR(1000),
  comentario_cierre VARCHAR(1000)
);
CREATE INDEX IF NOT EXISTS ix_incidencias_tenant_estado ON incidencias (tenant_id, estado_id);
CREATE INDEX IF NOT EXISTS ix_incidencias_tenant_tipo   ON incidencias (tenant_id, tipo_problema_id);

-- likes
CREATE TABLE IF NOT EXISTS likes_incidencia (
  id BIGSERIAL PRIMARY KEY,
  incidencia_id BIGINT NOT NULL REFERENCES incidencias(id) ON DELETE CASCADE,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT uq_like_incidencia_usuario UNIQUE (incidencia_id, usuario_id)
);

-- fotografías
CREATE TABLE IF NOT EXISTS fotografias (
  id BIGSERIAL PRIMARY KEY,
  incidencia_id BIGINT NOT NULL REFERENCES incidencias(id) ON DELETE CASCADE,
  url VARCHAR(2048) NOT NULL
);

-- historial de estados
CREATE TABLE IF NOT EXISTS historial_estados (
  id BIGSERIAL PRIMARY KEY,
  incidencia_id BIGINT NOT NULL REFERENCES incidencias(id) ON DELETE CASCADE,
  estado_id BIGINT NOT NULL REFERENCES estados_incidencia(id) ON DELETE RESTRICT,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  fecha_cambio TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_historial_incidencia ON historial_estados (incidencia_id);
