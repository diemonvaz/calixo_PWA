# Guía de Configuración de la Tienda de Cupones - Calixo PWA

Esta guía te ayudará a configurar el sistema de tienda donde los usuarios compran cupones de descuento con monedas.

## 📋 Prerrequisitos

- Base de datos de Supabase configurada
- Acceso al SQL Editor de Supabase

---

## 🚀 Paso 1: Crear la Tabla de Cupones (Productos de la Tienda)

**IMPORTANTE: Ejecutar este script PRIMERO**

1. **Abrir SQL Editor en Supabase**
   - Ve al dashboard de Supabase
   - Click en "SQL Editor" en el menú lateral
   - Click en "New query"

2. **Ejecutar el Script SQL de Cupones**
   - Abre el archivo `docs/setup/COUPONS_SETUP.sql`
   - Copia **TODO** el contenido
   - Pégalo en el SQL Editor de Supabase
   - Click en "Run" o presiona `Ctrl + Enter`

**Este script:**
- ✅ Crea la tabla `coupons` (productos de la tienda)
- ✅ Agrega campo `price` para el precio en monedas
- ✅ Crea la tabla `user_coupons` para rastrear compras
- ✅ Configura índices y políticas RLS
- ✅ Inserta los 3 cupones iniciales:
  - **OLIMPRO** - 10% descuento, precio: 50 monedas
  - **NUDEPROJECT** - 10% descuento, precio: 50 monedas
  - **ISLAMAGICA** - 20% descuento, precio: 75 monedas

---

## 🚀 Paso 2: Crear Tabla de Transacciones

**IMPORTANTE: Ejecutar este script DESPUÉS de COUPONS_SETUP.sql**

1. **Ejecutar el Script SQL de Transacciones**
   - Abre el archivo `docs/setup/UPDATE_TRANSACTIONS_COUPON.sql`
   - Copia **TODO** el contenido
   - Pégalo en el SQL Editor de Supabase
   - Click en "Run" o presiona `Ctrl + Enter`

**Este script:**
- ✅ Crea la tabla `challenges` si no existe
- ✅ Crea la tabla `user_coupons` si no existe (ya creada en paso 1, pero seguro)
- ✅ Crea la tabla `transactions` con campo `coupon_code`
- ✅ Configura índices y políticas RLS

---

## ✅ Paso 3: Verificar la Configuración

### 3.1 Verificar que las Tablas Existen

Ejecuta esta query en el SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('coupons', 'user_coupons', 'transactions')
ORDER BY table_name;
```

Deberías ver 3 tablas:
- coupons
- transactions
- user_coupons

### 3.2 Verificar los Cupones

```sql
SELECT * FROM coupons;
```

Deberías ver 3 cupones con precios:
- OLIMPRO (50 monedas)
- NUDEPROJECT (50 monedas)
- ISLAMAGICA (75 monedas)

---

## 🎯 Paso 4: Probar el Sistema

1. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

2. **Navegar a la Tienda**
   - Ve a http://localhost:3000/store
   - Deberías ver los 3 cupones disponibles
   - Cada cupón muestra su precio en monedas

3. **Comprar un Cupón**
   - Verifica que tienes suficientes monedas
   - Click en "Comprar cupón" en uno de los cupones
   - El cupón debería aparecer en "Mi Colección"

4. **Ver Cupones Comprados**
   - Ve a `/store/purchased`
   - Deberías ver el cupón comprado con su código visible

---

## 📊 Estructura de las Tablas

### Tabla `coupons` (Productos de la Tienda)
```sql
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,              -- Código del cupón (ej: OLIMPRO)
  discount_percent INTEGER NOT NULL,       -- Porcentaje de descuento (1-100)
  partner_name TEXT NOT NULL,             -- Nombre del socio/compañía
  description TEXT,                        -- Descripción del cupón
  price INTEGER NOT NULL DEFAULT 0,        -- Precio en monedas para comprar
  valid_from TIMESTAMP WITH TIME ZONE,    -- Fecha de inicio de validez
  valid_until TIMESTAMP WITH TIME ZONE,   -- Fecha de expiración
  is_active BOOLEAN DEFAULT true,         -- Si el cupón está activo en la tienda
  max_uses INTEGER,                        -- Límite de usos del código (NULL = ilimitado)
  current_uses INTEGER DEFAULT 0,          -- Contador de usos actuales
  created_at TIMESTAMP WITH TIME ZONE,     -- Fecha de creación
  updated_at TIMESTAMP WITH TIME ZONE     -- Fecha de última actualización
);
```

### Tabla `user_coupons` (Cupones Comprados)
```sql
CREATE TABLE user_coupons (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  coupon_id INTEGER NOT NULL REFERENCES coupons(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, coupon_id)  -- Un usuario solo puede comprar cada cupón una vez
);
```

### Tabla `transactions` (Historial de Compras)
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_id INTEGER REFERENCES challenges(id),
  amount INTEGER NOT NULL,                 -- Cantidad de monedas (negativo para compras)
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  description TEXT,                        -- Descripción de la transacción
  coupon_code TEXT,                        -- Código del cupón comprado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 🔧 Agregar Nuevos Cupones a la Tienda

Para agregar nuevos cupones, ejecuta en el SQL Editor:

```sql
INSERT INTO coupons (code, discount_percent, partner_name, description, price, valid_until, is_active)
VALUES 
  ('NUEVOCODIGO', 15, 'Nombre Socio', 'Descripción del cupón', 60, '2099-12-31 23:59:59+00', true)
ON CONFLICT (code) DO UPDATE SET
  discount_percent = EXCLUDED.discount_percent,
  partner_name = EXCLUDED.partner_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active,
  updated_at = now();
```

---

## 🐛 Solución de Problemas

### Error: "relation coupons does not exist"

**Problema**: La tabla no fue creada.

**Solución**: Ejecuta primero `COUPONS_SETUP.sql` antes de `UPDATE_TRANSACTIONS_COUPON.sql`.

### Error: "relation user_coupons does not exist"

**Problema**: La tabla no fue creada.

**Solución**: Verifica que ejecutaste `COUPONS_SETUP.sql` completo.

### Los cupones no aparecen en la tienda

**Problema**: Los cupones no están activos o han expirado.

**Solución**: Verifica que `is_active = true` y `valid_until > now()`:
```sql
SELECT * FROM coupons WHERE is_active = true AND valid_until > now();
```

### No puedo comprar un cupón

**Problema**: Ya lo compraste o no tienes suficientes monedas.

**Solución**: 
1. Verifica que no lo hayas comprado antes
2. Verifica que tengas suficientes monedas
3. Revisa la consola del navegador para errores

---

## 📚 Endpoints de API

### GET `/api/store`
Obtiene todos los cupones disponibles en la tienda.

**Respuesta:**
```json
{
  "items": [
    {
      "id": 1,
      "code": "OLIMPRO",
      "discountPercent": 10,
      "partnerName": "Olimpro",
      "description": "Código de descuento en Olimpro - 10%",
      "price": 50,
      "validUntil": "2099-12-31T23:59:59.000Z",
      "owned": false,
      "canPurchase": true
    }
  ],
  "userCoins": 100,
  "isPremium": false,
  "totalItems": 3,
  "ownedCount": 0
}
```

### POST `/api/store/purchase`
Compra un cupón.

**Request:**
```json
{
  "couponId": 1
}
```

**Respuesta:**
```json
{
  "success": true,
  "newCoins": 50,
  "coupon": {
    "id": 1,
    "code": "OLIMPRO",
    "discountPercent": 10,
    "partnerName": "Olimpro",
    "description": "Código de descuento en Olimpro - 10%",
    "price": 50,
    "validUntil": "2099-12-31T23:59:59.000Z"
  },
  "purchase": {
    "id": 1,
    "purchasedAt": "2026-01-27T12:00:00.000Z"
  }
}
```

### GET `/api/store/purchased`
Obtiene todos los cupones comprados por el usuario.

**Respuesta:**
```json
{
  "items": [
    {
      "purchase": {
        "id": 1,
        "purchasedAt": "2026-01-27T12:00:00.000Z"
      },
      "coupon": {
        "id": 1,
        "code": "OLIMPRO",
        "discountPercent": 10,
        "partnerName": "Olimpro",
        "description": "Código de descuento en Olimpro - 10%",
        "price": 50,
        "validUntil": "2099-12-31T23:59:59.000Z"
      },
      "transaction": {
        "id": 1,
        "amount": -50,
        "description": "Comprado cupón: OLIMPRO - Olimpro",
        "createdAt": "2026-01-27T12:00:00.000Z"
      }
    }
  ],
  "total": 1
}
```

---

## ✅ Checklist Final

- [ ] Script `COUPONS_SETUP.sql` ejecutado exitosamente
- [ ] Script `UPDATE_TRANSACTIONS_COUPON.sql` ejecutado exitosamente
- [ ] Tabla `coupons` creada con 3 cupones y precios
- [ ] Tabla `user_coupons` creada
- [ ] Tabla `transactions` creada con campo `coupon_code`
- [ ] Políticas RLS aplicadas
- [ ] Sección de tienda visible en el header (desktop y móvil)
- [ ] Puedo ver los cupones en `/store`
- [ ] Puedo comprar un cupón
- [ ] El cupón aparece en `/store/purchased` con su código visible

---

## 💡 Características Implementadas

✅ **Tienda de Cupones:**
- Los cupones son los productos que se venden
- Cada cupón tiene un precio en monedas
- Los usuarios compran cupones con sus monedas

✅ **Sistema de Compra:**
- Validación de monedas suficientes
- Prevención de compras duplicadas
- Registro de transacciones

✅ **Colección de Cupones:**
- Página dedicada para ver cupones comprados
- Muestra el código del cupón claramente
- Información del descuento y validez
- Filtros por socio

✅ **Navegación:**
- Pestaña "Tienda" en el header (desktop)
- Icono de tienda en el menú móvil
- Enlaces rápidos entre tienda y colección

---

**¡El sistema de tienda de cupones está listo! 🎉**
