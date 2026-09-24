INSERT INTO egg_quality_grades (code, label, egg_class, sort_order, is_active)
SELECT 'INC_MIXED', 'Mixto', 'INCUBABLE',
       COALESCE((SELECT MAX(sort_order) + 1 FROM egg_quality_grades WHERE egg_class='INCUBABLE'), 99),
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM egg_quality_grades WHERE code='INC_MIXED');

INSERT INTO egg_quality_grades (code, label, egg_class, sort_order, is_active)
SELECT 'COM_MIXED', 'Mixto', 'COMMERCIAL',
       COALESCE((SELECT MAX(sort_order) + 1 FROM egg_quality_grades WHERE egg_class='COMMERCIAL'), 99),
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM egg_quality_grades WHERE code='COM_MIXED');
