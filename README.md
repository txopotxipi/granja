# Granja Piloño — Web oficial

Web de la granja de cerdos de **Ignacio**, en Santa María de Piloño (Villa de Cruces, Pontevedra, Galicia). Granja moderna desde 1987: cerdos **estabulados en las mejores condiciones** — establos amplios y luminosos, cama seca, ventilación cuidada, alimentación de primera y pleno cumplimiento de la normativa de bienestar animal.

## Estructura del proyecto

```
granja-cerdos/
├── index.html          → Estructura y contenido de la página principal
├── legal.html          → Aviso legal, Política de Privacidad (RGPD) y Cookies
├── 404.html            → Página de error 404 real (autocontenida, con noindex)
├── _headers            → Cabeceras de seguridad y caché para Cloudflare Pages
├── build.sh            → Build de Cloudflare Pages: copia lo público a dist/
├── enviar.php          → Backend PHP opcional (ver «Formulario: cómo llegan los mensajes»)
├── .htaccess           → HTTPS, sin www, caché, compresión y bloqueos (Apache)
├── sitemap.xml         → Mapa del sitio para buscadores (solo la página principal)
├── robots.txt          → Autoriza a los buscadores y declara el sitemap
├── README.md           → Este archivo
├── tmp-log/            → Registros antispam del formulario PHP (no accesible por web)
│   └── .htaccess       → Prohibición total de acceso por HTTP
└── assets/
    ├── css/style.css   → Todos los estilos + @font-face de las fuentes locales
    ├── js/main.js      → Interacciones (menú, reveals, contadores, formulario…)
    ├── fonts/          → Fraunces y Archivo en WOFF2 variable (autohospedadas)
    └── img/            → 14 fotos WebP + og-granja.jpg (vista previa en redes)
```

**¿Por qué separado?** Cada archivo tiene un rol: el navegador guarda `style.css` y `main.js` en caché, así las visitas repetidas cargan más rápido, y editar el texto (HTML) nunca rompe el diseño (CSS) ni la lógica (JS).

## Verla en local

- **Sin instalar nada:** doble clic en `index.html`. Todo funciona, incluido el formulario (abre tu correo con el mensaje ya escrito).
- **Con servidor local (para probar el PHP):**
  ```powershell
  # Requiere PHP instalado (https://windows.php.net/download/)
  cd D:\granja\granja-cerdos
  php -S localhost:8080
  # Abrir http://localhost:8080
  ```
  El servidor de PHP no lee `.htaccess`, así que en local esas reglas no se aplican (no pasa nada: son para el hosting).

## Seguridad

Dos capas, según dónde viva la web:

### Producción: Cloudflare Pages (`granja.pages.dev`)

Pages no lee `.htaccess` ni ejecuta PHP; su equivalente son tres archivos de texto:

- **`_headers`** — cabeceras de seguridad en todas las páginas (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) y caché por tipo: fuentes 1 año inmutables; CSS, JS e imágenes 1 semana (los nombres de archivo no llevan versión, y una caché más larga enseñaría la web vieja tras cada publicación).
- **`404.html`** — Cloudflare la sirve con estado 404 real. Sin ella, cualquier ruta inexistente responde 200 con la portada («soft-404»): mal para el SEO y enmascara las imágenes rotas.
- **`.assetsignore`** — red de seguridad: Cloudflare Pages excluye del despliegue los archivos internos (`.agents/`, `*.md`, `AGENTS.md`, `enviar.php`, `tmp-log/`, `build.sh`, `.git/`) aunque el directorio de salida fuese la raíz del repositorio. Comprobado en producción: sin este archivo, `AGENTS.md` y `.agents/` eran accesibles por URL.
- **`build.sh` + `dist/`** — el build copia a producción solo lo público (`index.html`, `legal.html`, `assets/`, `robots.txt`, `sitemap.xml`, `_headers`, `404.html`). Los archivos internos (`.agents/`, `*.md`, `.htaccess`, `enviar.php`, `tmp-log/`) nunca salen del repositorio.

**Configuración en el panel** (Cloudflare Pages → Settings → Build & deployments): Build command `sh build.sh`, Output directory `dist`. HTTPS, redirección y compresión las pone Cloudflare de serie.

### Reserva: hosting Apache

El `.htaccess` (Apache, el servidor más común en hosting compartido) se ocupa de todo esto sin tocar el código de la web:

- **HTTPS obligatorio y sin `www`:** cualquier visita llega siempre al dominio configurado (hoy `https://granja.pages.dev`), en un solo salto.
- **Carpetas y archivos internos bloqueados:** `.git/`, `.agents/` y los `*.md` responden 404 (como si no existieran). Son documentación y metadatos de trabajo, no parte del sitio público.
- **Caché bien repartida:** las imágenes, el CSS, el JS y las fuentes se guardan un año en el navegador (las visitas repetidas cargan al instante); el HTML se revalida siempre, así los cambios se ven en cuanto se publican.
- **Cabeceras de seguridad:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`, las básicas recomendadas.
- **Compresión:** el texto (HTML, CSS, JS, SVG) viaja comprimido en gzip; WebP y WOFF2 ya van comprimidos de fábrica.

`tmp-log/` guarda los contadores antispam del formulario PHP. Su `.htaccess` prohíbe leerlos por HTTP (funciona en Apache 2.2 y 2.4): solo el PHP del propio sitio puede usarlos. En git se ignora todo el contenido de `tmp-log/` **salvo ese `.htaccess` de protección**, para que la defensa viaje con el repositorio.

**Dos avisos al publicar en Apache:**
- Activa "mostrar archivos ocultos" en tu cliente FTP: los archivos que empiezan por punto (`.htaccess`) son invisibles y, sin ellos, estas protecciones no suben al servidor.
- Estas reglas valen para **Apache**. Si el hosting usa NGINX u otro servidor, `.htaccess` no se aplica: pide al proveedor las reglas equivalentes.

## Publicar en internet

**Producción actual — Cloudflare Pages** (conectado al repo de GitHub, `git push` y listo):

1. Cada `git push` a `main` despliega automáticamente.
2. En el panel de Pages, fijar Build command `sh build.sh` y Output directory `dist`: con eso solo lo público llega a la web (ver [Seguridad](#seguridad)).
3. El formulario envía con `mailto:` — ver la sección «Formulario: cómo llegan los mensajes» para activar un endpoint real.

**Alternativa — hosting compartido con PHP** (Hostinger, IONOS, Piensa Solutions, OVH…):

1. Sube por FTP `index.html`, `legal.html`, `assets/`, `robots.txt`, `sitemap.xml`, `.htaccess`, `tmp-log/` y `enviar.php` al directorio público (`public_html` o similar).
2. Comprueba que tu plan tenga **PHP 8+** (es el único requisito del `enviar.php`).
3. Edita `enviar.php` y cambia `$destinatario` por el email real de Ignacio.
4. En `assets/js/main.js` pon `const ENDPOINT_FORMULARIO = 'enviar.php';` — sin ese paso el formulario seguiría usando `mailto:` y `enviar.php` no recibiría nada.
5. Listo: el formulario llegará al correo de verdad, con honeypot y rate-limit incluidos.

## Antes de publicar — pendientes reales

| Qué | Dónde |
|---|---|
| Teléfono real (ahora `+34 600 000 000`) | `index.html` (2 sitios), JSON-LD |
| Email real (ahora `hola@granjapilono.es`) | `index.html`, `main.js`, `404.html`, `enviar.php` |
| Dominio real (ahora `https://granja.pages.dev/`) | Al comprarlo: `index.html` (`canonical`, `og:url`, `og:image`, `twitter:image`), `sitemap.xml`, `robots.txt` (`Sitemap:`) y conectarlo en el panel de Cloudflare Pages |
| Cambiar el formulario a endpoint real (ahora `mailto:`) | `assets/js/main.js` → constante `ENDPOINT_FORMULARIO` (ver «Formulario: cómo llegan los mensajes») |
| Testimonio real o eliminarlo (el actual es de relleno) | `index.html`, sección `<section class="cita">` |
| Fotos reales de la granja | Sobreescribe los `.webp` de `assets/img/` manteniendo los mismos nombres |
| Coordenadas GPS para el SEO local | Bloque JSON-LD en `index.html` (añadir `"geo"`) |

## Rendimiento

- 0 librerías, 0 frameworks, **0 dependencias externas**: HTML + CSS + JS puros (~55 KB) + 3 fuentes WOFF2 (~180 KB).
- Fuentes Fraunces y Archivo **autohospedadas** en `assets/fonts/` (WOFF2 variable): sin peticiones a Google, más velocidad, privacidad RGPD y funciona sin conexión.
- Favicon SVG inline en el `<head>`: identidad en la pestaña sin ni una petición extra.
- Todas las imágenes `loading="lazy"` + `decoding="async"` + `width/height` explícitos (sin saltos de layout).
- Animaciones solo con `transform`/`opacity` (aceleradas por GPU) y `prefers-reduced-motion` respetado.
- Sin JavaScript la página es 100 % legible: fallback `.no-js` deja los reveals visibles y los contadores muestran su cifra real.
