/* AVINEXT - Detalles adicionales para productos tipo vacuna */

ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS has_diluent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vaccine_strain_code VARCHAR(30),
  ADD COLUMN IF NOT EXISTS application_mode_code VARCHAR(30);
