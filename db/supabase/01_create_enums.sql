-- ============================================
-- Calixo PWA - Creación de Enums
-- Ejecutar primero en Supabase SQL Editor
-- ============================================

-- Eliminar enums si existen (para desarrollo)
DROP TYPE IF EXISTS challenge_type CASCADE;
DROP TYPE IF EXISTS challenge_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
DROP TYPE IF EXISTS admin_role CASCADE;
DROP TYPE IF EXISTS avatar_category CASCADE;

-- Crear enums
CREATE TYPE challenge_type AS ENUM ('daily', 'focus', 'social');
CREATE TYPE challenge_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE notification_type AS ENUM ('reward', 'social', 'system', 'challenge');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'annual');
CREATE TYPE admin_role AS ENUM ('admin', 'moderator');
CREATE TYPE avatar_category AS ENUM ('color', 'shirt', 'background', 'hat', 'glasses', 'accessories');

-- Verificar creación
SELECT typname FROM pg_type WHERE typname IN (
  'challenge_type',
  'challenge_status',
  'notification_type',
  'subscription_status',
  'subscription_plan',
  'admin_role',
  'avatar_category'
);

