# Granja Piloño — Web oficial

Web de la granja de cerdos de **Ignacio**, en Santa María de Piloño (Villa de Cruces, Pontevedra, Galicia). Granja moderna desde 1987: cerdos **estabulados en las mejores condiciones** — establos amplios y luminosos, cama seca, ventilación cuidada, alimentación de primera y pleno cumplimiento de la normativa de bienestar animal.

## Estructura del proyecto

```
granja-cerdos/
├── index.html          → Estructura y contenido de la página principal
├── legal.html          → Aviso legal, Política de Privacidad (RGPD) y Cookies
├── enviar.php          → Recepción y validación del formulario de contacto
├── README.md           → Este archivo
└── assets/
    ├── css/style.css   → Todos los estilos (diseño, animaciones, responsive, accesibilidad)
    ├── js/main.js      → Interacciones (menú, reveals, contadores, formulario con RGPD…)
    └── img/            → 14 fotografías optimizadas en WebP de última generación
```

**¿Por qué separado?** Cada archivo tiene un rol: el navegador guarda `style.css` y `main.js` en caché, así las visitas repetidas cargan más rápido, y editar el texto (HTML) nunca rompe el diseño (CSS) ni la lógica (JS).

## Verla en local

- **Sin instalar nada:** doble clic en `index.html`. Todo funciona salvo el envío real del formulario (avisa con el email alternativo).
- **Con servidor local (para probar el PHP):**
  ```powershell
  # Requiere PHP instalado (https://windows.php.net/download/)
  cd D:\granja\granja-cerdos
  php -S localhost:8080
  # Abrir http://localhost:8080
  ```

## Publicar en internet

Cualquier hosting básico sirve (Hostinger, IONOS, Piensa Solutions, OVH…):

1. Sube **toda la carpeta** por FTP al directorio público (`public_html` o similar).
2. Comprueba que tu plan tenga **PHP 8+** (todos los básicos lo tienen; es el único requisito del `enviar.php`).
3. Edita `enviar.php` y cambia `$destinatario` por el email real de Ignacio.
4. Listo: el formulario llegará al correo, con protección antispam (honeypot) incluida.

## Antes de publicar — pendientes reales

| Qué | Dónde |
|---|---|
| Teléfono real (ahora `+34 600 000 000`) | `index.html` (2 sitios), JSON-LD |
| Email real (ahora `hola@granjapilono.es`) | `index.html`, `enviar.php` |
| Fotos reales de la granja | Sobreescribe los `.webp` de `assets/img/` manteniendo los mismos nombres |
| Coordenadas GPS para el SEO local | Bloque JSON-LD en `index.html` (añadir `"geo"`) |

## Rendimiento

- 0 librerías, 0 frameworks: HTML + CSS + JS puros (~55 KB de código).
- Fuentes de Google con `preconnect` e `display=swap`.
- Todas las imágenes `loading="lazy"` + `decoding="async"` + `width/height` explícitos (sin saltos de layout).
- Animaciones solo con `transform`/`opacity` (aceleradas por GPU) y `prefers-reduced-motion` respetado.
- Si algún día quieres 100/100 sin conexión externa: descarga las fuentes Fraunces y Archivo a `assets/fonts/` y elimina las 3 líneas de Google Fonts del `<head>`.
