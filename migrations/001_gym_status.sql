-- Migración: añade la columna `status` a gyms (suspender/reactivar desde el panel admin).
-- Para bases de datos ya creadas con un schema previo sin esta columna.
-- Ejecutar:  pnpm run db:migrate:status        (remoto)
--            pnpm run db:migrate:status:local  (local)
--
-- SQLite no soporta "ADD COLUMN IF NOT EXISTS"; si la columna ya existe,
-- este statement fallará — es seguro ignorar ese error en ese caso.
ALTER TABLE gyms ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
