# 🗄️ Setup de Base de Datos - Calixo PWA

Este documento resume todo lo relacionado con la configuración de la base de datos para Calixo PWA.

---

## 📁 Estructura de Archivos

```
db/
├── schema.ts              # Definición del esquema con Drizzle ORM
├── index.ts               # Exportación de la instancia de DB
├── seed.ts                # Script de seeding con TypeScript (para desarrollo local)
├── rls-policies.sql       # Políticas RLS originales (referencia)
└── supabase/             # Scripts SQL para ejecutar directamente en Supabase
    ├── README.md          # Documentación general de scripts
    ├── SETUP_GUIDE.md     # Guía paso a paso de setup
    ├── 01_create_enums.sql
    ├── 02_create_tables.sql
    ├── 03_apply_rls_policies.sql
    ├── 04_seed_data.sql
    ├── 05_create_functions.sql
    └── 06_create_admin_user.sql
```

---

## 🎯 Dos Formas de Setup

### Opción 1: Scripts SQL Directos (Recomendado para Producción)

**Ubicación:** `db/supabase/`

**Ventajas:**
- ✅ Ejecutables directamente en Supabase SQL Editor
- ✅ No requiere dependencias locales
- ✅ Ideal para producción
- ✅ Fácil de revisar y auditar

**Uso:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta los scripts en orden (01 → 06)
3. Sigue la guía en `db/supabase/SETUP_GUIDE.md`

### Opción 2: Script TypeScript con Drizzle (Para Desarrollo Local)

**Ubicación:** `db/seed.ts`

**Ventajas:**
- ✅ Type-safe con TypeScript
- ✅ Usa el mismo esquema que la app
- ✅ Fácil de mantener sincronizado
- ✅ Ideal para desarrollo local

**Uso:**
```bash
npm run db:seed
```

**Requisitos:**
- `DATABASE_URL` configurada en `.env.local`
- Dependencias instaladas (`npm install`)

---

## 📊 Esquema de Base de Datos

### Tablas Principales

| Tabla | Descripción | Relaciones |
|-------|-------------|------------|
| `users` | Usuarios del sistema | Referenciada por todas las demás |
| `profiles` | Perfiles extendidos de usuarios | 1:1 con users |
| `challenges` | Retos disponibles | Referenciada por user_challenges |
| `user_challenges` | Retos asignados a usuarios | N:M entre users y challenges |
| `focus_sessions` | Sesiones de enfoque completadas | 1:N con user_challenges |
| `social_sessions` | Sesiones sociales entre usuarios | N:M entre users |
| `avatar_customizations` | Personalizaciones de avatar | N:1 con users |
| `store_items` | Items disponibles en la tienda | Referenciada por transactions |
| `transactions` | Transacciones de monedas | N:1 con users |
| `followers` | Relaciones de seguimiento | N:M entre users |
| `feed_items` | Items del feed social | N:1 con users |
| `notifications` | Notificaciones de usuarios | N:1 con users |
| `subscriptions` | Suscripciones premium | 1:1 con users |
| `coupons` | Cupones de descuento | Independiente |
| `admin_users` | Usuarios con permisos admin | 1:1 con users |
| `config` | Configuración global | Independiente |
| `reports` | Reportes de contenido | N:1 con users |

### Enums

- `challenge_type`: daily, focus, social
- `challenge_status`: pending, in_progress, completed, failed
- `notification_type`: reward, social, system, challenge
- `subscription_status`: active, canceled, past_due, unpaid
- `subscription_plan`: monthly, annual
- `admin_role`: admin, moderator
- `avatar_category`: color, shirt, background, hat, glasses, accessories

---

## 🔒 Seguridad (RLS)

Todas las tablas tienen **Row Level Security (RLS)** habilitado con políticas específicas:

- **Usuarios:** Solo pueden ver/editar sus propios datos
- **Perfiles:** Públicos por defecto, privados solo visibles para seguidores
- **Retos:** Todos pueden ver retos activos, solo admins pueden crear/editar
- **Feed:** Visible según configuración de privacidad del perfil
- **Admin:** Solo admins pueden acceder a funciones administrativas

Ver `db/supabase/03_apply_rls_policies.sql` para todas las políticas.

---

## 🌱 Datos Iniciales (Seed)

### Configuración Global (13 registros)
- Límites de retos diarios
- Precios de suscripción
- Umbrales de energía del avatar
- Recompensas por tipo de reto

### Retos (26 registros)
- 16 retos diarios
- 5 retos de enfoque
- 5 retos sociales

### Items de Tienda (40+ registros)
- 8 colores
- 8 camisetas
- 8 sombreros
- 8 gafas
- 8 fondos
- 8 accesorios

### Cupones (4 registros)
- WELCOME25 (25% descuento)
- PREMIUM50 (50% descuento)
- LAUNCH30 (30% descuento)
- FRIEND20 (20% descuento)

---

## 🔧 Funciones y Triggers

### Funciones Automáticas

1. **`update_updated_at_column()`**
   - Actualiza `updated_at` automáticamente
   - Aplicada a: profiles, subscriptions, config

2. **`handle_new_user()`**
   - Crea perfil automáticamente al registrarse
   - Trigger en `auth.users`

3. **`validate_coupon(coupon_code)`**
   - Valida si un cupón es válido

4. **`increment_coupon_usage(coupon_code)`**
   - Incrementa el contador de uso de un cupón

---

## 🚀 Quick Start

### Setup Rápido en Supabase

1. **Crea el proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Espera a que termine el setup

2. **Ejecuta los scripts SQL**
   ```bash
   # En orden:
   1. db/supabase/01_create_enums.sql
   2. db/supabase/02_create_tables.sql
   3. db/supabase/03_apply_rls_policies.sql
   4. db/supabase/04_seed_data.sql
   5. db/supabase/05_create_functions.sql
   ```

3. **Crea un usuario admin**
   - Crea usuario en Supabase Auth
   - Ejecuta `db/supabase/06_create_admin_user.sql` con el UUID

4. **Configura variables de entorno**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   DATABASE_URL=postgresql://...
   ```

5. **¡Listo!** La base de datos está configurada

---

## 📝 Notas Importantes

### Sincronización con Supabase Auth

- La tabla `users` debe sincronizarse con `auth.users`
- El trigger `handle_new_user()` crea perfiles automáticamente
- Asegúrate de que Supabase Auth esté configurado antes de usar la app

### Service Role Key

- **NUNCA** expongas el Service Role Key en el cliente
- Úsalo solo en el backend para operaciones administrativas
- Las políticas RLS no aplican al Service Role

### Migraciones

- Los scripts SQL son idempotentes (pueden ejecutarse múltiples veces)
- Usan `ON CONFLICT DO NOTHING` o `DROP IF EXISTS`
- Para cambios futuros, crea nuevos scripts de migración

---

## 🔍 Verificación

Después del setup, ejecuta estas queries:

```sql
-- Verificar tablas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar enums
SELECT COUNT(*) FROM pg_type 
WHERE typname IN ('challenge_type', 'challenge_status', ...);

-- Verificar datos seed
SELECT 'Config' as tabla, COUNT(*) FROM config
UNION ALL SELECT 'Challenges', COUNT(*) FROM challenges
UNION ALL SELECT 'Store Items', COUNT(*) FROM store_items;

-- Verificar políticas RLS
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```

---

## 📚 Recursos

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última Actualización:** Noviembre 2025  
**Versión:** 1.0.0

