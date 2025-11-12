# 🗄️ Scripts SQL para Supabase - Calixo PWA

Scripts SQL listos para ejecutar directamente en Supabase SQL Editor. Estos scripts crean toda la estructura de la base de datos y la poblan con datos iniciales.

---

## 📋 Orden de Ejecución

**IMPORTANTE:** Ejecuta los scripts en este orden exacto:

1. **01_create_enums.sql** - Crea todos los tipos ENUM
2. **02_create_tables.sql** - Crea todas las tablas e índices
3. **03_apply_rls_policies.sql** - Aplica todas las políticas RLS
4. **04_seed_data.sql** - Inserta datos iniciales
5. **05_create_functions.sql** - Crea funciones y triggers útiles

---

## 🚀 Instrucciones de Uso

### Opción 1: Ejecutar en Supabase SQL Editor

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en [supabase.com](https://supabase.com)
   - Navega a **SQL Editor**

2. **Ejecuta cada script en orden:**
   - Copia el contenido de `01_create_enums.sql`
   - Pega en SQL Editor
   - Click **Run** o presiona `Ctrl+Enter`
   - Repite para cada script (02, 03, 04, 05)

3. **Verifica la ejecución:**
   - Cada script tiene verificaciones al final
   - Revisa que no haya errores
   - Verifica que las tablas se crearon correctamente

### Opción 2: Ejecutar Todo Junto

Si prefieres ejecutar todo de una vez, puedes concatenar todos los scripts:

```bash
# En terminal (si tienes acceso a Supabase CLI)
cat db/supabase/*.sql | psql $DATABASE_URL
```

O crear un script maestro (ver abajo).

---

## 📊 Contenido de Cada Script

### 01_create_enums.sql
- Crea 7 tipos ENUM:
  - `challenge_type` (daily, focus, social)
  - `challenge_status` (pending, in_progress, completed, failed)
  - `notification_type` (reward, social, system, challenge)
  - `subscription_status` (active, canceled, past_due, unpaid)
  - `subscription_plan` (monthly, annual)
  - `admin_role` (admin, moderator)
  - `avatar_category` (color, shirt, background, hat, glasses, accessories)

### 02_create_tables.sql
- Crea 17 tablas:
  - users, profiles, challenges, user_challenges
  - focus_sessions, social_sessions
  - avatar_customizations, store_items, transactions
  - followers, feed_items, notifications
  - subscriptions, coupons, admin_users
  - config, reports
- Crea índices para performance

### 03_apply_rls_policies.sql
- Habilita RLS en todas las tablas
- Crea 40+ políticas de seguridad
- Protege acceso según roles y permisos

### 04_seed_data.sql
- Inserta 13 configuraciones globales
- Inserta 26 retos (16 diarios, 5 enfoque, 5 sociales)
- Inserta 40+ items de tienda (8 colores, 8 camisetas, 8 sombreros, 8 gafas, 8 fondos, 8 accesorios)
- Inserta 4 cupones de ejemplo

### 05_create_functions.sql
- Función para actualizar `updated_at` automáticamente
- Función para crear perfil automáticamente al registrarse
- Funciones para validar y usar cupones
- Triggers automáticos

---

## ✅ Verificación Post-Ejecución

Después de ejecutar todos los scripts, verifica:

### 1. Tablas Creadas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```
**Debe mostrar:** 17 tablas

### 2. Enums Creados
```sql
SELECT typname FROM pg_type 
WHERE typname IN (
  'challenge_type', 'challenge_status', 'notification_type',
  'subscription_status', 'subscription_plan', 'admin_role', 'avatar_category'
);
```
**Debe mostrar:** 7 enums

### 3. Políticas RLS
```sql
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public';
```
**Debe mostrar:** 40+ políticas

### 4. Datos Seed
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
**Debe mostrar:**
- Config: 13 registros
- Challenges: 26 registros
- Store Items: 40+ registros
- Coupons: 4 registros

---

## 🔧 Troubleshooting

### Error: "type already exists"
Si un enum ya existe, el script lo elimina y recrea. Si persiste:
```sql
DROP TYPE IF EXISTS nombre_enum CASCADE;
```
Luego ejecuta el script nuevamente.

### Error: "table already exists"
Si una tabla ya existe:
```sql
DROP TABLE IF EXISTS nombre_tabla CASCADE;
```
Luego ejecuta el script nuevamente.

### Error: "policy already exists"
Las políticas se eliminan antes de crearse con `DROP POLICY IF EXISTS`. Si persiste, elimina manualmente:
```sql
DROP POLICY IF EXISTS "nombre_policy" ON nombre_tabla;
```

### Error: "function already exists"
Las funciones se recrean con `CREATE OR REPLACE FUNCTION`. No debería haber problemas.

---

## 📝 Notas Importantes

### Supabase Auth Integration
- La tabla `users` debe sincronizarse con `auth.users` de Supabase
- El trigger `on_auth_user_created` crea perfiles automáticamente
- Asegúrate de que Supabase Auth esté configurado

### Service Role
- Algunas operaciones requieren Service Role (bypass RLS)
- Usa Service Role Key solo en el backend
- Nunca expongas Service Role Key en el cliente

### Datos de Prueba
- Los datos seed son para desarrollo/testing
- En producción, considera datos más realistas
- Los cupones de ejemplo son funcionales pero pueden modificarse

---

## 🎯 Próximos Pasos

Después de ejecutar los scripts:

1. **Verificar RLS:**
   - Prueba acceso como usuario normal
   - Prueba acceso como admin
   - Verifica que las políticas funcionan

2. **Crear Usuario Admin:**
   ```sql
   -- Primero crea el usuario en Supabase Auth
   -- Luego ejecuta esto (reemplaza USER_ID con el UUID del usuario):
   INSERT INTO admin_users (user_id, role)
   VALUES ('USER_ID_AQUI', 'admin');
   ```

3. **Probar Funcionalidad:**
   - Login con usuario de prueba
   - Verificar que se crea perfil automáticamente
   - Probar acceso a retos, tienda, etc.

---

## 📚 Recursos

- [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última Actualización:** Noviembre 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para ejecutar

