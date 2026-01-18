-- Remove Trimestral and Cuatrimestral plans
DELETE FROM plans 
WHERE duration_type IN ('trimestral', 'cuatrimestral');
