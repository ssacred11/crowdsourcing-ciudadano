INSERT INTO roles (nombre) VALUES
 ('Administrador'), ('Estudiante'), ('Profesor'), ('Encargado')
ON CONFLICT DO NOTHING;

INSERT INTO estados_incidencia (nombre) VALUES
 ('Recibido'), ('En Evaluación'), ('En Progreso'), ('Resuelto'), ('Rechazado')
ON CONFLICT DO NOTHING;

INSERT INTO tenants (name) VALUES ('default')
ON CONFLICT DO NOTHING;

-- usuario admin de ejemplo (coloca un hash real luego)
INSERT INTO usuarios (tenant_id, nombre, apellido, correo_electronico, password_hash, rol_id)
VALUES (1,'Admin','Local','admin@local.test','<hash-pendiente>',
        (SELECT id FROM roles WHERE nombre='Administrador'))
ON CONFLICT DO NOTHING;

INSERT INTO categorias (tenant_id, nombre) VALUES
 (1,'Infraestructura'), (1,'Académico'), (1,'Convivencia'), (1,'Administrativo')
ON CONFLICT DO NOTHING;

INSERT INTO ubicaciones (tenant_id, nombre) VALUES
 (1,'Patio'), (1,'Baños'), (1,'Biblioteca')
ON CONFLICT DO NOTHING;

INSERT INTO tipos_problema (tenant_id, nombre, categoria_id)
SELECT 1,'Fuga de agua', c.id
FROM categorias c
WHERE c.tenant_id=1 AND c.nombre='Infraestructura'
ON CONFLICT DO NOTHING;
