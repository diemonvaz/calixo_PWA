-- Script SQL para crear/verificar la tabla de cupones (códigos de descuento)
-- Ejecutar este script en el SQL Editor de Supabase

-- Crear tabla coupons si no existe (estos son los productos de la tienda)
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  partner_name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0), -- Precio en monedas para comprar el cupón
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_uses INTEGER, -- Límite de usos del código de descuento en la tienda externa
  current_uses INTEGER DEFAULT 0, -- Usos actuales del código de descuento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índice para búsquedas rápidas por código
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, valid_until);

-- Habilitar RLS (Row Level Security)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Política RLS: Todos pueden leer cupones activos
CREATE POLICY "Anyone can view active coupons"
  ON coupons
  FOR SELECT
  USING (is_active = true AND valid_until > now());

-- Crear tabla user_coupons para rastrear cupones comprados por usuarios
CREATE TABLE IF NOT EXISTS user_coupons (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, coupon_id)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon_id ON user_coupons(coupon_id);

-- Habilitar RLS para user_coupons
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios solo pueden ver sus propios cupones comprados
CREATE POLICY "Users can view their own purchased coupons"
  ON user_coupons
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política RLS: Los usuarios solo pueden insertar sus propios cupones comprados
CREATE POLICY "Users can insert their own purchased coupons"
  ON user_coupons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insertar los 3 códigos de descuento estáticos (productos de la tienda)
INSERT INTO coupons (code, discount_percent, partner_name, description, price, valid_until, is_active)
VALUES 
  ('OLIMPRO', 10, 'Olimpro', 'Código de descuento en Olimpro - 10%', 50, '2099-12-31 23:59:59+00', true),
  ('NUDEPROJECT', 10, 'Nude Project', 'Código de descuento en Nude Project - 10%', 50, '2099-12-31 23:59:59+00', true),
  ('ISLAMAGICA', 20, 'Isla Mágica', 'Código de descuento en Isla Mágica - 20%', 75, '2099-12-31 23:59:59+00', true)
ON CONFLICT (code) DO UPDATE SET
  discount_percent = EXCLUDED.discount_percent,
  partner_name = EXCLUDED.partner_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_coupons_updated_at_trigger ON coupons;
CREATE TRIGGER update_coupons_updated_at_trigger
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();
