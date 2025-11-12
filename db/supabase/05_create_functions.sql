-- ============================================
-- Calixo PWA - Funciones y Triggers Útiles
-- Ejecutar después de seed data
-- ============================================

-- ============================================
-- 1. FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para config
DROP TRIGGER IF EXISTS update_config_updated_at ON config;
CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para contacts
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE AL REGISTRARSE
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_energy, coins, streak)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    100,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
-- Nota: Esto requiere que Supabase Auth esté configurado
-- Se ejecuta cuando se crea un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 3. FUNCIÓN PARA ACTUALIZAR CONTADORES DE FEED
-- ============================================

CREATE OR REPLACE FUNCTION update_feed_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feed_items
    SET likes_count = likes_count + 1
    WHERE id = NEW.feed_item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feed_items
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.feed_item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Nota: Esto requiere una tabla de likes si existe
-- Por ahora, los likes se manejan directamente en feed_items.likes_count

-- ============================================
-- 4. FUNCIÓN PARA VALIDAR CUPONES
-- ============================================

CREATE OR REPLACE FUNCTION validate_coupon(coupon_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  coupon_record coupons%ROWTYPE;
BEGIN
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = coupon_code
    AND is_active = true
    AND valid_until > NOW()
    AND (max_uses IS NULL OR used_count < max_uses);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. FUNCIÓN PARA INCREMENTAR USO DE CUPÓN
-- ============================================

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE coupons
  SET used_count = used_count + 1
  WHERE code = coupon_code
    AND is_active = true
    AND valid_until > NOW()
    AND (max_uses IS NULL OR used_count < max_uses);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICACIÓN DE FUNCIONES CREADAS
-- ============================================

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'update_updated_at_column',
  'handle_new_user',
  'validate_coupon',
  'increment_coupon_usage'
)
ORDER BY routine_name;

