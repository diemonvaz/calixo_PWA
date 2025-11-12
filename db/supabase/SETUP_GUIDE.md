# 🚀 Guía de Setup Completo - Supabase

Esta guía te ayudará a configurar completamente la base de datos de Calixo PWA en Supabase desde cero.

---

## 📋 Requisitos Previos

- ✅ Cuenta de Supabase creada
- ✅ Proyecto de Supabase creado
- ✅ Acceso al SQL Editor de Supabase
- ✅ (Opcional) Supabase CLI instalado

---

## 🎯 Opción 1: Setup Manual (Recomendado para Primera Vez)

### Paso 1: Crear Enums
1. Abre **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo `01_create_enums.sql`
3. Copia todo el contenido
4. Pega en SQL Editor
5. Click **Run** (o `Ctrl+Enter`)
6. Verifica que se crearon 7 enums

### Paso 2: Crear Tablas
1. Abre `02_create_tables.sql`
2. Copia y ejecuta en SQL Editor
3. Verifica que se crearon 17 tablas

### Paso 3: Aplicar RLS Policies
1. Abre `03_apply_rls_policies.sql`
2. Copia y ejecuta en SQL Editor
3. Verifica que se crearon 40+ políticas

### Paso 4: Insertar Datos Iniciales
1. Abre `04_seed_data.sql`
2. Copia y ejecuta en SQL Editor
3. Verifica que se insertaron:
   - 13 configuraciones
   - 26 retos
   - 40+ items de tienda
   - 4 cupones

### Paso 5: Crear Funciones y Triggers
1. Abre `05_create_functions.sql`
2. Copia y ejecuta en SQL Editor
3. Verifica que se crearon las funciones

### Paso 6: Crear Usuario Admin
1. **Primero:** Crea un usuario en Supabase Auth:
   - Ve a **Authentication** → **Users** → **Add User**
   - Crea un usuario con email y password
   - Copia el **UUID** del usuario
2. Abre `06_create_admin_user.sql`
3. Reemplaza `'USER_UUID_AQUI'` con el UUID copiado
4. Ejecuta el script
5. Verifica que el usuario ahora es admin

---

## 🎯 Opción 2: Setup con Supabase CLI

Si tienes Supabase CLI instalado:

```bash
# Conectar a tu proyecto
supabase link --project-ref tu-project-ref

# Ejecutar scripts en orden
psql $DATABASE_URL -f db/supabase/01_create_enums.sql
psql $DATABASE_URL -f db/supabase/02_create_tables.sql
psql $DATABASE_URL -f db/supabase/03_apply_rls_policies.sql
psql $DATABASE_URL -f db/supabase/04_seed_data.sql
psql $DATABASE_URL -f db/supabase/05_create_functions.sql
```

---

## ✅ Verificación Post-Setup

Ejecuta estas queries en SQL Editor para verificar:

### 1. Verificar Tablas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
**Esperado:** 17 tablas

### 2. Verificar Enums
```sql
SELECT typname FROM pg_type 
WHERE typname IN (
  'challenge_type', 'challenge_status', 'notification_type',
  'subscription_status', 'subscription_plan', 'admin_role', 'avatar_category'
);
```
**Esperado:** 7 enums

### 3. Verificar Datos Seed
```sql
SELECT 
  'Config' as tabla, COUNT(*) as registros FROM config
UNION ALL
SELECT 'Challenges', COUNT(*) FROM challenges
UNION ALL
SELECT 'Store Items', COUNT(*) FROM store_items
UNION ALL
SELECT 'Coupons', COUNT(*) FROM coupons;
```
**Esperado:**
- Config: 13
- Challenges: 26
- Store Items: 40+
- Coupons: 4

### 4. Verificar Políticas RLS
```sql
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public';
```
**Esperado:** 40+ políticas

### 5. Verificar Admin User
```sql
SELECT 
  au.user_id,
  u.email,
  au.role
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id;
```
**Esperado:** Al menos 1 admin

---

## 🔧 Configuración de Variables de Entorno

Después del setup, configura estas variables en tu proyecto:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**Encontrar estas variables:**
- Ve a **Settings** → **API**
- Copia `URL` y `anon public` key
- Ve a **Settings** → **Database**
- Copia la connection string (reemplaza `[YOUR-PASSWORD]`)

---

## 🎮 Probar la Aplicación

### 1. Login como Usuario Normal
- Crea un usuario en Supabase Auth
- Login en la app
- Verifica que se crea perfil automáticamente

### 2. Login como Admin
- Login con el usuario admin creado
- Accede a `/admin`
- Verifica que puedes ver el panel de administración

### 3. Probar Funcionalidades
- ✅ Ver retos disponibles
- ✅ Comenzar un reto
- ✅ Ver tienda de items
- ✅ Ver feed social
- ✅ Ver notificaciones

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Solución:** Las tablas ya existen. Si quieres empezar de cero:
```sql
-- CUIDADO: Esto elimina TODOS los datos
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Luego ejecuta los scripts nuevamente.

### Error: "type already exists"
**Solución:** Los enums ya existen. El script los elimina y recrea. Si persiste:
```sql
DROP TYPE IF EXISTS nombre_enum CASCADE;
```

### Error: "policy already exists"
**Solución:** El script usa `DROP POLICY IF EXISTS`, pero si persiste:
```sql
DROP POLICY IF EXISTS "nombre_policy" ON nombre_tabla;
```

### Usuario Admin No Funciona
**Verificar:**
1. El usuario existe en `auth.users`
2. El UUID es correcto en `admin_users`
3. El role es 'admin' (no 'moderator')
4. Estás usando el mismo usuario para login

### RLS Bloquea Acceso
**Verificar:**
1. Estás autenticado (`auth.uid()` no es null)
2. Las políticas están correctamente aplicadas
3. Estás usando el usuario correcto
4. Para testing, puedes temporalmente deshabilitar RLS:
```sql
ALTER TABLE nombre_tabla DISABLE ROW LEVEL SECURITY;
```
**⚠️ Solo para desarrollo, nunca en producción**

---

## 📚 Estructura de Archivos

```
db/supabase/
├── README.md                    # Documentación general
├── SETUP_GUIDE.md              # Esta guía
├── 00_setup_complete.sql       # Script maestro (no usar directamente)
├── 01_create_enums.sql         # Crear enums
├── 02_create_tables.sql        # Crear tablas
├── 03_apply_rls_policies.sql   # Aplicar RLS
├── 04_seed_data.sql            # Datos iniciales
├── 05_create_functions.sql     # Funciones y triggers
└── 06_create_admin_user.sql    # Crear admin
```

---

## 🎯 Próximos Pasos

Después del setup:

1. ✅ **Configurar Supabase Auth**
   - Habilitar Email/Password
   - Configurar redirect URLs
   - Configurar email templates

2. ✅ **Configurar Storage** (si usas imágenes)
   - Crear buckets
   - Configurar políticas de acceso

3. ✅ **Configurar Webhooks** (Stripe, etc.)
   - Configurar webhooks de Stripe
   - Configurar funciones edge si es necesario

4. ✅ **Testing**
   - Probar todas las funcionalidades
   - Verificar RLS funciona correctamente
   - Probar con múltiples usuarios

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Supabase Dashboard
2. Verifica que ejecutaste los scripts en orden
3. Verifica que no hay errores de sintaxis SQL
4. Revisa la documentación de Supabase

---

**Última Actualización:** Noviembre 2025  
**Versión:** 1.0.0

