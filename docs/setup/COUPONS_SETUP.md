# Guía de Configuración de Códigos de Descuento - Calixo PWA

Esta guía te ayudará a configurar el sistema de códigos de descuento en la tienda de Calixo.

## 📋 Prerrequisitos

- Base de datos de Supabase configurada
- Acceso al SQL Editor de Supabase

---

## 🚀 Paso 1: Crear la Tabla de Cupones

1. **Abrir SQL Editor en Supabase**
   - Ve al dashboard de Supabase
   - Click en "SQL Editor" en el menú lateral
   - Click en "New query"

2. **Ejecutar el Script SQL**
   - Abre el archivo `docs/setup/COUPONS_SETUP.sql`
   - Copia **TODO** el contenido
   - Pégalo en el SQL Editor de Supabase
   - Click en "Run" o presiona `Ctrl + Enter`

**Este script:**
- ✅ Crea la tabla `coupons` si no existe
- ✅ Configura índices para búsquedas rápidas
- ✅ Habilita Row Level Security (RLS)
- ✅ Crea políticas de seguridad para acceso público a cupones activos
- ✅ Inserta los 3 códigos de descuento estáticos:
  - **OLIMPRO** - 10% de descuento en Olimpro
  - **NUDEPROJECT** - 10% de descuento en Nude Project
  - **ISLAMAGICA** - 20% de descuento en Isla Mágica

---

## ✅ Paso 2: Verificar la Configuración

### 2.1 Verificar que la Tabla Existe

Ejecuta esta query en el SQL Editor:

```sql
SELECT * FROM coupons;
```

Deberías ver 3 cupones:
- OLIMPRO (10%)
- NUDEPROJECT (10%)
- ISLAMAGICA (20%)

### 2.2 Verificar las Políticas RLS

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'coupons';
```

Deberías ver la política: "Anyone can view active coupons"

---

## 🎯 Paso 3: Probar el Sistema

1. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

2. **Navegar a la Tienda**
   - Ve a http://localhost:3000/store
   - Deberías ver la sección "🎟️ Códigos de Descuento" en el sidebar

3. **Probar un Código**
   - Ingresa uno de los códigos: `OLIMPRO`, `NUDEPROJECT`, o `ISLAMAGICA`
   - Click en "Aplicar"
   - Deberías ver un mensaje de éxito con el descuento aplicado

4. **Comprar un Item con Descuento**
   - Selecciona un item de la tienda
   - Click en "Comprar"
   - El precio debería reflejar el descuento aplicado
   - La transacción debería mostrar el descuento en la descripción

---

## 📊 Estructura de la Tabla `coupons`

```sql
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,              -- Código único del cupón
  discount_percent INTEGER NOT NULL,       -- Porcentaje de descuento (1-100)
  partner_name TEXT,                      -- Nombre del socio/compañía
  description TEXT,                       -- Descripción del cupón
  valid_from TIMESTAMP WITH TIME ZONE,    -- Fecha de inicio de validez
  valid_until TIMESTAMP WITH TIME ZONE,   -- Fecha de expiración
  is_active BOOLEAN DEFAULT true,         -- Si el cupón está activo
  max_uses INTEGER,                        -- Límite de usos (NULL = ilimitado)
  current_uses INTEGER DEFAULT 0,          -- Contador de usos actuales
  created_at TIMESTAMP WITH TIME ZONE,     -- Fecha de creación
  updated_at TIMESTAMP WITH TIME ZONE     -- Fecha de última actualización
);
```

---

## 🔧 Agregar Nuevos Códigos de Descuento

Para agregar nuevos códigos de descuento, ejecuta en el SQL Editor:

```sql
INSERT INTO coupons (code, discount_percent, partner_name, description, valid_until, is_active)
VALUES 
  ('CODIGO1', 15, 'Nombre Socio', 'Descripción del descuento', '2099-12-31 23:59:59+00', true)
ON CONFLICT (code) DO UPDATE SET
  discount_percent = EXCLUDED.discount_percent,
  partner_name = EXCLUDED.partner_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();
```

---

## 🐛 Solución de Problemas

### Error: "relation coupons does not exist"

**Problema**: La tabla no fue creada.

**Solución**: Ejecuta el script `COUPONS_SETUP.sql` completo en el SQL Editor.

### Error: "permission denied for table coupons"

**Problema**: Las políticas RLS están bloqueando el acceso.

**Solución**: Verifica que ejecutaste la política RLS en el script:
```sql
CREATE POLICY "Anyone can view active coupons"
  ON coupons
  FOR SELECT
  USING (is_active = true AND valid_until > now());
```

### Los códigos no aparecen en la tienda

**Problema**: Los cupones no están activos o han expirado.

**Solución**: Verifica que `is_active = true` y `valid_until > now()`:
```sql
SELECT * FROM coupons WHERE is_active = true AND valid_until > now();
```

### El descuento no se aplica al comprar

**Problema**: El código no se está pasando correctamente al endpoint.

**Solución**: 
1. Verifica que el código está aplicado antes de comprar (debe aparecer en verde)
2. Revisa la consola del navegador para errores
3. Verifica los logs del servidor

---

## 📚 Endpoints de API

### GET `/api/store/coupons`
Obtiene todos los códigos de descuento activos disponibles.

**Respuesta:**
```json
{
  "coupons": [
    {
      "id": 1,
      "code": "OLIMPRO",
      "discount_percent": 10,
      "partner_name": "Olimpro",
      "description": "Código de descuento en Olimpro - 10%",
      "valid_until": "2099-12-31T23:59:59.000Z"
    }
  ],
  "total": 1
}
```

### POST `/api/store/coupons/validate`
Valida un código de descuento.

**Request:**
```json
{
  "code": "OLIMPRO"
}
```

**Respuesta:**
```json
{
  "valid": true,
  "coupon": {
    "id": 1,
    "code": "OLIMPRO",
    "discountPercent": 10,
    "partnerName": "Olimpro",
    "description": "Código de descuento en Olimpro - 10%"
  }
}
```

### POST `/api/store/purchase` (Actualizado)
Compra un item con descuento opcional.

**Request:**
```json
{
  "itemId": 1,
  "couponCode": "OLIMPRO"  // Opcional
}
```

**Respuesta:**
```json
{
  "success": true,
  "newCoins": 90,
  "originalPrice": 100,
  "finalPrice": 90,
  "discountApplied": 10,
  "couponUsed": {
    "code": "OLIMPRO",
    "discountPercent": 10,
    "partnerName": "Olimpro"
  },
  "item": { ... },
  "customization": { ... }
}
```

---

## ✅ Checklist Final

- [ ] Script SQL ejecutado exitosamente
- [ ] Tabla `coupons` creada con 3 cupones
- [ ] Políticas RLS aplicadas
- [ ] Sección de códigos de descuento visible en la tienda
- [ ] Puedo aplicar un código de descuento
- [ ] El descuento se aplica correctamente al comprar
- [ ] La transacción muestra el descuento aplicado

---

## 💡 Próximos Pasos

Una vez configurado el sistema de códigos de descuento:

1. ✅ Los usuarios pueden ver códigos disponibles en la tienda
2. ✅ Los usuarios pueden aplicar códigos antes de comprar
3. ✅ Los descuentos se aplican automáticamente
4. 🔜 Agregar más códigos de descuento según necesidades
5. 🔜 Implementar límites de uso por usuario (opcional)
6. 🔜 Panel de administración para gestionar cupones (ya existe en `/admin/coupons`)

---

**¡El sistema de códigos de descuento está listo! 🎉**
