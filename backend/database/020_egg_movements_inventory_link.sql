ALTER TABLE egg_movements
  ADD COLUMN IF NOT EXISTS inventory_document_id UUID;

ALTER TABLE egg_movements
  DROP CONSTRAINT IF EXISTS egg_movements_inventory_document_fk;

ALTER TABLE egg_movements
  ADD CONSTRAINT egg_movements_inventory_document_fk
    FOREIGN KEY (inventory_document_id) REFERENCES inventory_documents(id);

ALTER TABLE egg_movement_lines
  ADD COLUMN IF NOT EXISTS product_id UUID;

ALTER TABLE egg_movement_lines
  DROP CONSTRAINT IF EXISTS egg_movement_lines_product_fk;

ALTER TABLE egg_movement_lines
  ADD CONSTRAINT egg_movement_lines_product_fk
    FOREIGN KEY (product_id) REFERENCES products(id);

CREATE INDEX IF NOT EXISTS idx_egg_movement_lines_product
  ON egg_movement_lines (organization_id, product_id);
