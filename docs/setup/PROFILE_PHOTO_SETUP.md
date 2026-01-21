# Configuración de Foto de Perfil

Esta guía explica cómo configurar la funcionalidad de fotos de perfil en Calixo.

## 1. Ejecutar SQL en Supabase

Ejecuta el siguiente SQL en el editor SQL de Supabase para añadir el campo necesario:

```sql
-- Añadir campo profile_photo_path a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_photo_path TEXT;

-- Añadir comentario al campo para documentación
COMMENT ON COLUMN users.profile_photo_path IS 'Ruta de la foto de perfil en Supabase Storage (bucket: profile-photos)';
```

## 2. Crear Bucket en Supabase Storage

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New bucket**
4. Configura el bucket con los siguientes valores:
   - **Name**: `profile-photos`
   - **Public bucket**: ✅ Marcado (para que las fotos sean accesibles públicamente)
   - **File size limit**: 5 MB (o el límite que prefieras)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

## 3. Configurar Políticas RLS (Row Level Security)

⚠️ **IMPORTANTE**: Las políticas RLS deben configurarse en la tabla `storage.objects`, no en `users`.

Ve a **Storage** → **Policies** en el dashboard de Supabase y crea las siguientes políticas:

### Política para INSERT (subir fotos)

```sql
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Política para SELECT (ver fotos)

```sql
CREATE POLICY "Anyone can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

### Política para DELETE (eliminar fotos)

```sql
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Política para UPDATE (opcional, para reemplazar fotos)

```sql
CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 4. Verificar la Configuración

Una vez completados los pasos anteriores:

1. ✅ El campo `profile_photo_path` debe existir en la tabla `users`
2. ✅ El bucket `profile-photos` debe existir en Storage
3. ✅ Las políticas RLS deben estar configuradas en `storage.objects`

## 5. Solución de Problemas

### Error: "Bucket not found"
- Verifica que el bucket `profile-photos` existe en Storage
- Verifica que el nombre del bucket es exactamente `profile-photos` (sin espacios, con guión)

### Error: "new row violates row-level security policy"
- Verifica que las políticas RLS están configuradas en `storage.objects`
- Verifica que el usuario está autenticado
- Verifica que la estructura de carpetas coincide: `{user_id}/profile-{timestamp}-{random}.{ext}`

### Error: "Permission denied"
- Verifica que el bucket es público o que las políticas RLS permiten acceso
- Verifica que el usuario tiene permisos para escribir en su carpeta

## 6. Uso

Los usuarios pueden:
- Ver su foto de perfil en la página de perfil (círculo a la derecha)
- Hacer clic en la foto para abrir un modal
- Seleccionar una imagen
- Recortar la imagen (mover, hacer zoom)
- Subir una nueva foto desde el modal
- Eliminar su foto actual
- La foto se muestra automáticamente después de subirla

## Estructura de Archivos

Las fotos se almacenan en Supabase Storage con la siguiente estructura:
```
profile-photos/
  └── {user_id}/
      └── profile-{timestamp}-{random}.{ext}
```

El campo `profile_photo_path` en la tabla `users` almacena la ruta completa como:
```
profile-photos/{user_id}/profile-{timestamp}-{random}.{ext}
```

## Notas Importantes

- **Tamaño máximo**: 5 MB por imagen
- **Formatos permitidos**: JPG, PNG, WEBP
- **Limpieza**: Cuando un usuario sube una nueva foto, la anterior se elimina automáticamente
- **Privacidad**: Las fotos son públicas (cualquiera con la URL puede verlas)
- **Seguridad**: Los usuarios solo pueden subir/eliminar fotos en su propia carpeta (`{user_id}/`)
