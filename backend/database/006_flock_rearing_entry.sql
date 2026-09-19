/* AVINEXT - Fecha de ingreso a crianza para lotes */

ALTER TABLE IF EXISTS flocks
  ADD COLUMN IF NOT EXISTS rearing_entry_on DATE;
