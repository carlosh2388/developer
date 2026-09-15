/* AVINEXT - Permitir controles repetidos para el mismo lote
   Permite registrar varias boletas de peso de aves o huevos para el mismo
   lote, fecha y semana, manteniendo cada una como registro independiente. */

ALTER TABLE bird_weight_controls
  DROP CONSTRAINT IF EXISTS bird_weight_controls_organization_id_flock_id_control_date__key;

ALTER TABLE egg_weight_controls
  DROP CONSTRAINT IF EXISTS egg_weight_controls_organization_id_flock_id_control_date_w_key;
