-- ============================================
-- Calixo PWA - Crear Usuario Admin
-- Ejecutar DESPUÉS de crear un usuario en Supabase Auth
-- ============================================

-- INSTRUCCIONES:
-- 1. Crea un usuario en Supabase Auth (Authentication > Users > Add User)
-- 2. Copia el UUID del usuario creado
-- 3. Reemplaza 'USER_UUID_AQUI' con el UUID real
-- 4. Ejecuta este script

-- ============================================
-- OPCIÓN 1: Crear Admin Manualmente
-- ============================================

-- Reemplaza 'USER_UUID_AQUI' con el UUID del usuario de Supabase Auth
INSERT INTO admin_users (user_id, role)
VALUES ('USER_UUID_AQUI', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- ============================================
-- OPCIÓN 2: Crear Admin por Email
-- ============================================

-- Si conoces el email del usuario, puedes usar esto:
-- (Requiere que el usuario ya exista en auth.users)

-- INSERT INTO admin_users (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'admin@calixo.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- ============================================
-- OPCIÓN 3: Crear Moderador
-- ============================================

-- Para crear un moderador en lugar de admin:
-- INSERT INTO admin_users (user_id, role)
-- VALUES ('USER_UUID_AQUI', 'moderator')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'moderator';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todos los admins creados
SELECT 
  au.user_id,
  u.email,
  au.role,
  au.created_at
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
ORDER BY au.created_at DESC;

-- Verificar permisos
SELECT 
  'Admin Users' as tabla,
  COUNT(*) FILTER (WHERE role = 'admin') as admins,
  COUNT(*) FILTER (WHERE role = 'moderator') as moderators,
  COUNT(*) as total
FROM admin_users;

