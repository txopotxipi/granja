# Granja Piloño — Web oficial

Web de la granja de cerdos de **Ignacio**, en Santa María de Piloño (Villa de Cruces, Pontevedra, Galicia). Granja moderna desde 1987: cerdos **estabulados en las mejores condiciones** — establos amplios y luminosos, cama seca, ventilación cuidada, alimentación de primera y pleno cumplimiento de la normativa de bienestar animal.

## Estructura del proyecto

```
granja-cerdos/
├── index.html          → Estructura y contenido de la página principal
├── legal.html          → Aviso legal, Política de Privacidad (RGPD) y Cookies
├── enviar.php          → Recepción y validación del formulario de contacto
├── .htaccess           → HTTPS, sin www, caché, compresión y bloqueos (Apache)
├── sitemap.xml         → Mapa del sitio para buscadores (solo la página principal)
├── robots.txt          → Autoriza a los buscadores y declara el sitemap
├── README.md           → Este archivo
├── tmp-log/            → Registros antispam del formulario (no accesible por web)
│   └── .htaccess       → Prohibición total de acceso por HTTP
└── assets/
    ├── css/style.css   → Todos los estilos + @font-face de las fuentes locales
    ├── js/main.js      → Interacciones (menú, reveals, contadores, formulario…)
    ├── fonts/          → Fraunces y Archivo en WOFF2 variable (autohospedadas)
    └── img/            → 14 fotos WebP + og-granja.jpg (vista previa en redes)
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
  El servidor de PHP no lee `.htaccess`, así que en local esas reglas no se aplican (no pasa nada: son para el hosting).

## Seguridad

El archivo `.htaccess` (Apache, el servidor más común en hosting compartido) se ocupa de todo esto sin tocar el código de la web:

- **HTTPS obligatorio y sin `www`:** cualquier visita llega siempre a `https://granjapilono.es`, en un solo salto.
- **Carpetas y archivos internos bloqueados:** `.git/`, `.agents/` y los `*.md` responden 404 (como si no existieran). Son documentación y metadatos de trabajo, no parte del sitio público.
- **Caché bien repartida:** las imágenes, el CSS, el JS y las fuentes se guardan un año en el navegador (las visitas repetidas cargan al instante); el HTML se revalida siempre, así los cambios se ven en cuanto se publican.
- **Cabeceras de seguridad:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`, las básicas recomendadas.
- **Compresión:** el texto (HTML, CSS, JS, SVG) viaja comprimido en gzip; WebP y WOFF2 ya van comprimidos de fábrica.

`tmp-log/` guarda los contadores antispam del formulario. Su `.htaccess` prohíbe leerlos por HTTP (funciona en Apache 2.2 y 2.4): solo el PHP del propio sitio puede usarlos. En git se ignora todo el contenido de `tmp-log/` **salvo ese `.htaccess` de protección**, para que la defensa viaje con el repositorio.

**Dos avisos al publicar:**
- Activa "mostrar archivos ocultos" en tu cliente FTP: los archivos que empiezan por punto (`.htaccess`) son invisibles y, sin ellos, estas protecciones no suben al servidor.
- Estas reglas valen para **Apache**. Si el hosting usa NGINX u otro servidor, `.htaccess` no se aplica: pide al proveedor las reglas equivalentes.

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
| Dominio real (ahora placeholder `https://granjapilono.es/`) | `index.html`: `canonical`, `og:url`; `sitemap.xml`; `robots.txt` (línea `Sitemap:`) |
| `og-granja.jpg` — imagen social 1200×630 para la vista previa en WhatsApp y redes (por crear) | `assets/img/og-granja.jpg` — el `<head>` de `index.html` ya apunta ahí |
| Fotos reales de la granja | Sobreescribe los `.webp` de `assets/img/` manteniendo los mismos nombres |
| Coordenadas GPS para el SEO local | Bloque JSON-LD en `index.html` (añadir `"geo"`) |

## Rendimiento

- 0 librerías, 0 frameworks, **0 dependencias externas**: HTML + CSS + JS puros (~55 KB) + 3 fuentes WOFF2 (~180 KB).
- Fuentes Fraunces y Archivo **autohospedadas** en `assets/fonts/` (WOFF2 variable): sin peticiones a Google, más velocidad, privacidad RGPD y funciona sin conexión.
- Favicon SVG inline en el `<head>`: identidad en la pestaña sin ni una petición extra.
- Todas las imágenes `loading="lazy"` + `decoding="async"` + `width/height` explícitos (sin saltos de layout).
- Animaciones solo con `transform`/`opacity` (aceleradas por GPU) y `prefers-reduced-motion` respetado.
- Sin JavaScript la página es 100 % legible: fallback `.no-js` deja los reveals visibles y los contadores muestran su cifra real.
