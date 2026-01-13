-- =============================================
-- 678FIT - Sistema de Inscripción de Membresías
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. TABLA DE PLANES
-- Almacena todos los planes disponibles (editables desde admin)
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,                          -- Oro, Plata, Bronce, -18+60, Inscripción, Personalizado
    duration_type TEXT NOT NULL,                 -- mensual, trimestral, cuatrimestral
    schedule TEXT,                               -- Horario (ej: "Lunes a Viernes 7am-8pm")
    includes TEXT,                               -- Qué incluye
    price_cash INTEGER,                          -- Precio de contado (Ref)
    price_installments INTEGER,                  -- Precio en cuotas (Ref)
    is_active BOOLEAN DEFAULT true,              -- Si está disponible para inscripción
    display_order INTEGER DEFAULT 0              -- Orden de visualización
);

-- 2. TABLA DE MIEMBROS
-- Almacena información de usuarios inscritos
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Información Personal
    full_name TEXT NOT NULL,
    cedula TEXT NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    age INTEGER,
    
    -- Datos Físicos
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    
    -- Contacto
    profession TEXT,
    address TEXT,
    phone TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    
    -- Información Médica
    has_insurance BOOLEAN DEFAULT false,
    allergies TEXT,
    medical_conditions TEXT,
    has_biopolymers BOOLEAN DEFAULT false,
    
    -- Foto y Plan
    selfie_url TEXT,
    plan_id UUID REFERENCES plans(id),
    payment_method TEXT CHECK (payment_method IN ('cash', 'installments')),
    
    -- Estado y Fechas
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired')),
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- QR único
    qr_code TEXT UNIQUE
);

-- 3. TABLA DE CONFIGURACIÓN
-- Parámetros del sistema
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

-- Insertar configuración inicial
INSERT INTO settings (key, value, description) VALUES
    ('expiration_days', '7', 'Días para marcar inscripción como vencida si no paga')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- SEED DATA: Planes según las imágenes
-- =============================================

-- PLANES MENSUALES
INSERT INTO plans (name, duration_type, schedule, includes, price_cash, price_installments, display_order) VALUES
    ('Oro', 'mensual', 'Lunes a Viernes de 7:00am a 8:00pm', 'Clases de salón y monitoreo en musculación', 50, NULL, 1),
    ('Plata', 'mensual', 'Lunes a Viernes de 7:00am a 8:00pm (4 días a la semana)', 'Clases de salón y monitoreo en musculación', 45, NULL, 2),
    ('Bronce', 'mensual', 'Lunes a Viernes de 10:00am a 4:00pm', 'Monitoreo en sala de musculación', 40, NULL, 3),
    ('-18 + 60', 'mensual', 'Lunes a Viernes de 7:00am a 8:00pm', 'Clases de salón y monitoreo en musculación (-18 +60 años)', 40, NULL, 4),
    ('Inscripción', 'mensual', 'Pago único (si no asiste un mes completo debe volver a cancelar)', 'Uso de las instalaciones de 678 FIT', 10, NULL, 5),
    ('Personalizado', 'mensual', 'Consultar con Instructor', 'Entrenamiento personalizado, horario a conveniencia', NULL, NULL, 6);

-- PLANES TRIMESTRALES (Feb-Mar-Abr)
INSERT INTO plans (name, duration_type, schedule, includes, price_cash, price_installments, display_order) VALUES
    ('Oro', 'trimestral', 'Febrero - Marzo - Abril', 'Acceso completo 3 meses', 115, 120, 1),
    ('Plata', 'trimestral', 'Febrero - Marzo - Abril', 'Acceso 4 días/semana por 3 meses', 110, 115, 2),
    ('Bronce', 'trimestral', 'Febrero - Marzo - Abril', 'Acceso horario reducido 3 meses', 100, 105, 3),
    ('-18 + 60', 'trimestral', 'Febrero - Marzo - Abril', 'Plan especial 3 meses', 100, 105, 4);

-- PLANES CUATRIMESTRALES (Feb-Mar-Abr-May)
INSERT INTO plans (name, duration_type, schedule, includes, price_cash, price_installments, display_order) VALUES
    ('Oro', 'cuatrimestral', 'Febrero - Marzo - Abril - Mayo', 'Acceso completo 4 meses', 155, 160, 1),
    ('Plata', 'cuatrimestral', 'Febrero - Marzo - Abril - Mayo', 'Acceso 4 días/semana por 4 meses', 140, 145, 2),
    ('Bronce', 'cuatrimestral', 'Febrero - Marzo - Abril - Mayo', 'Acceso horario reducido 4 meses', 125, 130, 3),
    ('-18 + 60', 'cuatrimestral', 'Febrero - Marzo - Abril - Mayo', 'Plan especial 4 meses', 125, 130, 4);

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- PLANS: Lectura pública, escritura solo admin
CREATE POLICY "Public Read Plans" ON plans FOR SELECT USING (true);
CREATE POLICY "Admin Manage Plans" ON plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MEMBERS: Inserción pública, lectura/escritura solo admin
CREATE POLICY "Public Insert Members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Read Members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin Update Members" ON members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete Members" ON members FOR DELETE TO authenticated USING (true);

-- SETTINGS: Solo admin
CREATE POLICY "Admin Manage Settings" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STORAGE: Bucket para selfies
-- =============================================
-- NOTA: Esto se debe hacer desde el panel de Supabase > Storage
-- 1. Crear bucket llamado "member-selfies"
-- 2. Configurar como público para lectura
-- 3. Permitir uploads anónimos

-- Si prefieres hacerlo por SQL (requiere permisos):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('member-selfies', 'member-selfies', true);
