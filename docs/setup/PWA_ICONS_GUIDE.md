# Guía para Generar Iconos PWA - Calixo

## 📋 Iconos Necesarios

La PWA de Calixo necesita los siguientes iconos para funcionar correctamente en diferentes dispositivos:

| Tamaño | Nombre | Uso |
|--------|--------|-----|
| 72x72 | icon-72x72.png | Android Chrome |
| 96x96 | icon-96x96.png | Android Chrome |
| 128x128 | icon-128x128.png | Android Chrome |
| 144x144 | icon-144x144.png | Android Chrome, Windows |
| 152x152 | icon-152x152.png | iOS Safari |
| 192x192 | icon-192x192.png | Android Chrome (standard) |
| 384x384 | icon-384x384.png | Android Chrome |
| 512x512 | icon-512x512.png | Android Chrome, Splash screen |

Total: **8 iconos PNG**

---

## 🎨 Especificaciones de Diseño

### Colores del Proyecto
```
- Background: #F5F0E8 (beige)
- Primary: #5A8DEE (soft blue)
- Accent Green: #22C55E
- Accent Red: #EF4444
- Dark Navy: #1E293B
- Neutral Gray: #6B7280
```

### Diseño del Icono
El icono debe representar **Calixo** - una app de desconexión digital con gamificación.

**Ideas sugeridas:**
- Logo "C" estilizado
- Avatar CALI simplificado
- Símbolo de desconexión (pantalla con X, o teléfono dormido)
- Mezcla de elementos: pantalla + naturaleza

**Requisitos:**
- Simple y reconocible a tamaños pequeños (72px)
- Funciona bien en fondos claros y oscuros
- Representa la marca Calixo
- Formato: PNG con transparencia o fondo sólido

### Maskable Icons (192x192 y 512x512)
Estos iconos necesitan **safe zone** para Android adaptive icons.

- Area total: 100%
- Safe zone: 80% del centro
- Elementos importantes dentro del círculo central del 80%

---

## 🚀 Opción 1: Usar Herramientas Online (RECOMENDADO)

### PWA Asset Generator
1. Visitar: https://www.pwabuilder.com/imageGenerator
2. Subir una imagen PNG de 512x512 px mínimo
3. Descargar el paquete completo de iconos
4. Copiar todos los PNG a `public/icons/`

### RealFaviconGenerator
1. Visitar: https://realfavicongenerator.net/
2. Subir tu logo/icono base (SVG o PNG de alta resolución)
3. Configurar para PWA
4. Descargar el paquete
5. Copiar los iconos a `public/icons/`

---

## 🖌️ Opción 2: Generar con Herramientas Locales

### Usando Figma/Adobe XD
1. Crear un artboard de 512x512 px
2. Diseñar el icono siguiendo las especificaciones
3. Exportar a PNG en los tamaños listados arriba
4. Para maskable icons:
   - Asegurar que elementos importantes estén dentro del 80% central
   - Añadir padding de 10% en todos los lados

### Usando ImageMagick (CLI)
Si ya tienes un icono base (`icon-source.png` de 512x512):

```bash
# Instalar ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Generar todos los tamaños
cd public/icons/

magick convert icon-source.png -resize 72x72 icon-72x72.png
magick convert icon-source.png -resize 96x96 icon-96x96.png
magick convert icon-source.png -resize 128x128 icon-128x128.png
magick convert icon-source.png -resize 144x144 icon-144x144.png
magick convert icon-source.png -resize 152x152 icon-152x152.png
magick convert icon-source.png -resize 192x192 icon-192x192.png
magick convert icon-source.png -resize 384x384 icon-384x384.png
magick convert icon-source.png -resize 512x512 icon-512x512.png
```

---

## 🎯 Opción 3: Placeholder SVG → PNG

Mientras diseñas el icono final, puedes usar un placeholder simple.

### Generar Placeholder con Node.js

```bash
# Instalar sharp
npm install sharp

# Crear script
node scripts/generate-icons.js
```

```javascript
// scripts/generate-icons.js
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#5A8DEE" rx="80"/>
  <text x="256" y="320" 
        font-size="280" 
        font-family="Arial" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="#F5F0E8">C</text>
</svg>
`;

async function generateIcons() {
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .toFile(`public/icons/icon-${size}x${size}.png`);
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }
  console.log('✅ All icons generated!');
}

generateIcons();
```

---

## 📦 Opción 4: Usar Canva (No-Code)

1. Crear cuenta gratuita en [Canva](https://www.canva.com/)
2. Crear diseño personalizado de 512x512 px
3. Diseñar el icono usando elementos de Canva
4. Exportar como PNG
5. Usar una herramienta online para generar tamaños

---

## ✅ Checklist de Verificación

Después de generar los iconos:

- [ ] Todos los 8 tamaños están en `public/icons/`
- [ ] Iconos son PNG (no JPG)
- [ ] Iconos tienen el tamaño correcto (verificar con propiedades del archivo)
- [ ] Icono 192x192 y 512x512 son maskable (safe zone 80%)
- [ ] Iconos se ven bien en fondo claro y oscuro
- [ ] `manifest.json` apunta correctamente a `/icons/icon-XXxXX.png`

---

## 🔍 Verificar Instalación

### Método 1: Lighthouse en Chrome DevTools
1. Abrir Chrome DevTools (F12)
2. Ir a tab "Lighthouse"
3. Seleccionar "Progressive Web App"
4. Hacer click en "Analyze page load"
5. Verificar que "Installable" pase todas las pruebas

### Método 2: Verificar Manualmente
1. Abrir `http://localhost:3000/manifest.json`
2. Verificar que todos los iconos existan
3. Abrir cada URL de icono: `http://localhost:3000/icons/icon-72x72.png`
4. Confirmar que se carga correctamente

---

## 🎨 Recursos de Diseño

### Iconos de Inspiración
- https://www.flaticon.com/ (iconos gratuitos)
- https://www.iconfinder.com/ (iconos premium y gratuitos)
- https://fonts.google.com/icons (Material Icons)

### Paletas de Colores
- Coolors: https://coolors.co/
- Adobe Color: https://color.adobe.com/

### Herramientas de Diseño
- Figma (gratis): https://www.figma.com/
- Canva (gratis): https://www.canva.com/
- Inkscape (gratis, local): https://inkscape.org/

---

## 🐛 Troubleshooting

### "Icon not found" en Lighthouse
- Verificar que los archivos PNG existan en `public/icons/`
- Confirmar nombres exactos en `manifest.json`
- Verificar permisos de archivos

### Icons no se ven en dispositivo Android
- Asegurar que iconos 192x192 y 512x512 existan
- Verificar que sean maskable (safe zone)
- Limpiar cache del navegador

### Icons no se ven en iOS
- Agregar `<link rel="apple-touch-icon" href="/icons/icon-180x180.png">` en `<head>`
- Crear icon-180x180.png adicional
- Verificar que sea PNG sin transparencia para iOS

---

## 📝 Estado Actual

**Iconos generados:** ❌ NO (pendiente)  
**Manifest.json:** ✅ Configurado (esperando iconos)  
**Script helper:** ⏳ Disponible arriba

**Próximo paso:** Genera los iconos siguiendo cualquiera de las opciones y colócalos en `public/icons/`.

---

**Última actualización:** 11 de noviembre de 2025  
**Versión:** 1.0.0

