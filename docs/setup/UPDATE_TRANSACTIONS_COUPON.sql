-- Script SQL para crear tablas necesarias y agregar campo coupon_code a transactions
-- IMPORTANTE: Ejecutar primero COUPONS_SETUP.sql antes de este script
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear tabla challenges si no existe (necesaria para la referencia)
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Crear tabla user_coupons si no existe (para rastrear cupones comprados)
CREATE TABLE IF NOT EXISTS user_coupons (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, coupon_id)
);

-- 3. Crear tabla transactions si no existe
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  description TEXT,
  coupon_code TEXT, -- Código del cupón comprado/usado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear índices para user_coupons si no existen
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_coupon_id ON user_coupons(coupon_id);

-- Crear índices para transactions si no existen
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_challenge_id ON transactions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_coupon_code ON transactions(coupon_code);

-- Habilitar RLS (Row Level Security) para user_coupons
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios solo pueden ver sus propios cupones comprados
DROP POLICY IF EXISTS "Users can view their own purchased coupons" ON user_coupons;
CREATE POLICY "Users can view their own purchased coupons"
  ON user_coupons
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política RLS: Los usuarios solo pueden insertar sus propios cupones comprados
DROP POLICY IF EXISTS "Users can insert their own purchased coupons" ON user_coupons;
CREATE POLICY "Users can insert their own purchased coupons"
  ON user_coupons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Habilitar RLS (Row Level Security) para transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política RLS: Los usuarios solo pueden ver sus propias transacciones
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política RLS: Los usuarios solo pueden insertar sus propias transacciones
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comentario para documentar el campo
COMMENT ON COLUMN transactions.coupon_code IS 'Código de cupón usado en esta transacción';
