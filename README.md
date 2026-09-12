# Granja Piloño — Web oficial

Web de la granja de cerdos de **Ignacio**, en Santa María de Piloño (Villa de Cruces, Pontevedra, Galicia). Granja moderna desde 1987: cerdos **estabulados en las mejores condiciones** — establos amplios y luminosos, cama seca, ventilación cuidada, alimentación de primera y pleno cumplimiento de la normativa de bienestar animal.

## Estructura del proyecto

```
granja-cerdos/
├── index.html          → Estructura y contenido de la página principal
├── legal.html          → Aviso legal, Política de Privacidad (RGPD) y Cookies
├── 404.html            → Página de error 404 real (autocontenida, con noindex)
├── manifest.webmanifest→ Manifiesto PWA: nombre, iconos y atajos de la app
├── sw.js               → Service worker: arranque sin conexión y caché propia
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
    ├── js/main.js      → Interacciones (menú, calculadora, visor, formulario…)
    ├── fonts/          → Fraunces y Archivo en WOFF2 variable (autohospedadas)
    └── img/            → 14 fotos WebP en 3 tamaños + iconos + og-granja.jpg
```

**Imágenes en tres tamaños.** Cada foto existe como `nombre.webp` (1200 px),
`nombre-900.webp` y `nombre-600.webp`. El HTML usa `srcset` + `sizes` para que
el navegador descargue solo la que necesita: un móvil baja ~1 MB en lugar de
2,3 MB. **Al sustituir una foto, genera también sus dos variantes** (ver
«Antes de publicar»).

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

## Qué puede hacer el visitante

Toda la interacción está en `assets/js/main.js` y funciona sin librerías. Lo que
de verdad aporta:

- **Calculadora de pedido** (`#calculadora`) — a partir de las personas que hay
  en casa y las comidas con cerdo por semana, estima el consumo anual
  (150 g por persona y comida), recomienda el formato que mejor encaja
  (piezas sueltas / media canal / canal entera), calcula el coste, el precio
  efectivo por kilo y el ahorro frente a comprar por kilos. Si el formato
  elegido no cuadra con el consumo, avisa («te sobrarían 60 kg…»). Desde ahí se
  puede pedir por WhatsApp o llevar el resultado al formulario con un clic.
  Los precios y pesos están arriba de `main.js`, en las constantes
  `PRECIO`, `PESO` y `NOMBRE` (hoy son **orientativos**: cámbialos por los reales).
- **Reserva de visita** (`#reserva`) — genera en vivo los próximos 6 sábados
  (nunca el de hoy), deja elegir turno y número de personas, y abre WhatsApp con
  el mensaje ya redactado. Sin backend: funciona desde el primer día.
- **Preguntas frecuentes** (`#faq`) — `<details>`/`<summary>` nativos: accesibles
  y legibles sin JavaScript. Al abrir una se cierran las demás. Las respuestas
  están duplicadas en el JSON-LD (`FAQPage`) para que Google las muestre; **si
  cambias una, cambia también la otra**.
- **Visor de fotos** (`#finca`) — amplía la galería a pantalla completa con
  flechas, `Esc`, deslizamiento táctil y el foco encerrado dentro del visor.
- **Acceso directo a WhatsApp** — botón flotante que aparece al pasar el hero,
  más enlaces `tel:`, `mailto:` y WhatsApp en la sección de contacto.
- **Aplicación instalable (PWA)** — `manifest.webmanifest` + `sw.js`: se puede
  añadir a la pantalla de inicio y arranca sin conexión. El service worker sirve
  lo guardado al instante y lo actualiza por detrás (HTML siempre desde la red).
- **Navegación con scrollspy, barra de progreso de lectura** y revelados al
  hacer scroll, todo con `IntersectionObserver` y respetando
  `prefers-reduced-motion`.

> **Al publicar cambios en `style.css` o `main.js`:** sube el número de `VERSION`
> en `sw.js` (por ejemplo `'v1'` → `'v2'`). Los nombres de archivo no llevan
> hash, así que esa versión es lo que fuerza a los navegadores a renovar la
> copia guardada.

## Formulario: cómo llegan los mensajes

El formulario valida en el navegador (nombre, email, mensaje y consentimiento) y
luego tiene **tres formas de entregar el mensaje**. Se elige con una sola línea:
la constante `ENDPOINT_FORMULARIO`, al principio de `assets/js/main.js`.

### 1. `mailto:` — la que está activa ahora (`ENDPOINT_FORMULARIO = ''`)

El navegador abre el gestor de correo del visitante con el asunto y el cuerpo ya
escritos; solo tiene que pulsar enviar. **Cero dependencias y cero servidores.**

- ✅ Funciona desde el primer día, incluso abriendo el `index.html` a doble clic.
- ⚠️ En un móvil sin app de correo configurada, el mensaje no llega a salir.
- 💡 Por eso hay siempre un WhatsApp y un teléfono a la vista como alternativa.

### 2. `enviar.php` — hosting Apache con PHP 8+

1. Sube `enviar.php` y `tmp-log/` al servidor.
2. Edita las constantes de arriba del archivo: `DESTINATARIO` (el email real) y
   `REMITENTE` (debe ser del mismo dominio o el correo caerá en spam).
3. En `assets/js/main.js` pon `const ENDPOINT_FORMULARIO = 'enviar.php';`.

El visitante **no sale de la web**: el mensaje se envía por `fetch()` y se
confirma con el aviso emergente. Incluye validación en servidor, honeypot,
límite de 5 envíos por IP cada 10 minutos, guarda de velocidad (descarta envíos
de menos de 2,5 s) y UTF-8 explícito para que los acentos y las eñes no se
corrompan en el correo.

> Si el hosting es compartido, `mail()` puede caer en spam. Hay un `TODO` en el
> propio archivo explicando cómo pasar a SMTP autenticado con PHPMailer: solo
> cambia la llamada final, todo lo demás sigue igual.

### 3. Un servicio externo o una Pages Function (lo recomendado en Cloudflare)

Pega su URL en `ENDPOINT_FORMULARIO` y listo. El formulario envía un `POST` con
`FormData` (incluye el campo `form_ajax=1`) y espera una respuesta JSON con
`{"ok": true}`. Opciones sin coste:

- **Cloudflare Pages Function + Email Routing** — gratis, sin terceros y el
  correo sale del propio dominio. Es la mejor opción si el dominio acaba en
  Cloudflare.
- **Formspree / Brevo / Resend** — se configuran en cinco minutos, pero el
  mensaje pasa por un servicio externo (conviene añadirlo a la política de
  privacidad de `legal.html`).

### Sin JavaScript

El `<form>` es un `POST` normal a `enviar.php`, así que **nunca** acaba en la
barra de direcciones. Si no hay JavaScript, `enviar.php` responde con una página
HTML de cortesía (no un JSON crudo) y el formulario muestra un aviso con el
email y el WhatsApp como alternativa.

⚠️ En Cloudflare Pages no hay PHP: si alguien envía el formulario con JavaScript
desactivado, `enviar.php` dará 404. El aviso `<noscript>` está justo encima del
formulario precisamente para desviar a esos visitantes a email o WhatsApp.

## Seguridad

Dos capas, según dónde viva la web:

### Producción: Cloudflare Pages (`granja.pages.dev`)

Pages no lee `.htaccess` ni ejecuta PHP; su equivalente son tres archivos de texto:

- **`_headers`** — cabeceras de seguridad en todas las páginas (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) y caché por tipo: fuentes 1 año inmutables; CSS, JS e imágenes 1 semana (los nombres de archivo no llevan versión, y una caché más larga enseñaría la web vieja tras cada publicación); HTML siempre revalidado; y **`sw.js` sin caché**, porque un service worker viejo en el navegador impide que lleguen las actualizaciones.
- **`404.html`** — Cloudflare la sirve con estado 404 real. Sin ella, cualquier ruta inexistente responde 200 con la portada («soft-404»): mal para el SEO y enmascara las imágenes rotas.
- **`.assetsignore`** — red de seguridad: Cloudflare Pages excluye del despliegue los archivos internos (`.agents/`, `*.md`, `AGENTS.md`, `enviar.php`, `tmp-log/`, `build.sh`, `.git/`) aunque el directorio de salida fuese la raíz del repositorio. Comprobado en producción: sin este archivo, `AGENTS.md` y `.agents/` eran accesibles por URL.
- **`build.sh` + `dist/`** — el build copia a producción solo lo público (`index.html`, `legal.html`, `assets/`, `robots.txt`, `sitemap.xml`, `_headers`, `404.html`). Los archivos internos (`.agents/`, `*.md`, `.htaccess`, `enviar.php`, `tmp-log/`) nunca salen del repositorio.

**Configuración en el panel** (Cloudflare Pages → Settings → Build & deployments): Build command `sh build.sh`, Output directory `dist`. HTTPS, redirección y compresión las pone Cloudflare de serie.

### Reserva: hosting Apache

El `.htaccess` (Apache, el servidor más común en hosting compartido) se ocupa de todo esto sin tocar el código de la web:

- **HTTPS obligatorio y sin `www`:** cualquier visita llega siempre al dominio configurado (hoy `https://granja.pages.dev`), en un solo salto.
- **Carpetas y archivos internos bloqueados:** `.git/`, `.agents/` y los `*.md` responden 404 (como si no existieran). Son documentación y metadatos de trabajo, no parte del sitio público.
- **Caché bien repartida:** el CSS, el JS y las imágenes se guardan una semana; las fuentes, un año inmutable (nunca cambian de contenido). El HTML y `sw.js` se revalidan siempre, así los cambios se ven en cuanto se publican. Misma política que `_headers`, para que el sitio se comporte igual en las dos plataformas.
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

1. Sube por FTP `index.html`, `legal.html`, `404.html`, `manifest.webmanifest`, `sw.js`, `assets/`, `robots.txt`, `sitemap.xml`, `.htaccess`, `tmp-log/` y `enviar.php` al directorio público (`public_html` o similar). El service worker necesita estar en la raíz del dominio para poder controlar todo el sitio.
2. Comprueba que tu plan tenga **PHP 8+** (es el único requisito del `enviar.php`).
3. Edita `enviar.php` y cambia `$destinatario` por el email real de Ignacio.
4. En `assets/js/main.js` pon `const ENDPOINT_FORMULARIO = 'enviar.php';` — sin ese paso el formulario seguiría usando `mailto:` y `enviar.php` no recibiría nada.
5. Listo: el formulario llegará al correo de verdad, con honeypot y rate-limit incluidos.

## Antes de publicar — pendientes reales

| Qué | Dónde |
|---|---|
| Teléfono real (ahora `+34 600 000 000`) | `assets/js/main.js` → constante `WHATSAPP` (sin `+` ni espacios); `index.html` (menú móvil, contacto, JSON-LD); `legal.html` |
| Email real (ahora `hola@granjapilono.es`) | `assets/js/main.js` → constante `DESTINO_EMAIL`; `index.html`, `404.html`, `enviar.php` (`DESTINATARIO` y `REMITENTE`), `legal.html` |
| Dominio real (ahora `https://granja.pages.dev/`) | `index.html` (`canonical`, `og:url`, `og:image`, `twitter:image`), `sitemap.xml`, `robots.txt` (`Sitemap:`) y conectarlo en el panel de Cloudflare Pages |
| Cambiar el formulario a endpoint real (ahora `mailto:`) | `assets/js/main.js` → constante `ENDPOINT_FORMULARIO` (ver «Formulario: cómo llegan los mensajes») |
| **Precios y pesos de la calculadora** (hoy son orientativos) | `assets/js/main.js` → constantes `PRECIO`, `PESO` y `NOMBRE`. Si los cambias, revisa también las respuestas de la FAQ y el `makesOffer` del JSON-LD |
| **Enlaces de redes sociales del footer** (apuntan a `#`) | `index.html`, `<div class="footer-redes">` |
| Testimonio real o eliminarlo (el actual es de relleno) | `index.html`, sección `<section class="cita">` |
| Fotos reales de la granja | Sobreescribe los `.webp` de `assets/img/` **y genera sus variantes** (ver abajo) |
| Coordenadas GPS para el SEO local | `index.html`, bloque JSON-LD (`"geo"`): hoy son orientativas |

**Al cambiar una foto, genera sus tres tamaños.** Sustituye `nombre.webp` y crea
`nombre-900.webp` y `nombre-600.webp` a partir de ella. Si no lo haces, el
`srcset` apuntará a archivos que no existen y el navegador usará el original
(no se rompe, pero el móvil vuelve a bajar la imagen grande). Con ImageMagick:

```bash
magick nombre.webp -resize 900x -quality 80 nombre-900.webp
magick nombre.webp -resize 600x -quality 80 nombre-600.webp
```

## Rendimiento

- 0 librerías, 0 frameworks, **0 dependencias externas**: HTML + CSS + JS puros (~85 KB) + 3 fuentes WOFF2 (~180 KB).
- **Imágenes responsive**: cada foto tiene variantes de 1200, 900 y 600 px y se sirve con `srcset`/`sizes`. Un móvil descarga ~1 MB de fotos en lugar de 2,3 MB, sin tocar el diseño.
- **Fuentes precargadas** con `<link rel="preload">`: el primer pintado no espera a que el CSS las descubra.
- Fuentes Fraunces y Archivo **autohospedadas** en `assets/fonts/` (WOFF2 variable): sin peticiones a Google, más velocidad, privacidad RGPD y funciona sin conexión.
- Favicon SVG inline en el `<head>`: identidad en la pestaña sin ni una petición extra.
- Todas las imágenes `loading="lazy"` + `decoding="async"` + `width/height` explícitos (sin saltos de layout).
- Animaciones solo con `transform`/`opacity` (aceleradas por GPU) y `prefers-reduced-motion` respetado.
- **Service worker** que sirve los recursos guardados al instante y los refresca por detrás, con el HTML siempre desde la red para no enseñar nunca una versión vieja.
- Sin JavaScript la página es 100 % legible: fallback `.no-js` deja los reveals visibles, los contadores muestran su cifra real, la FAQ funciona (son `<details>` nativos) y el formulario avisa y ofrece email/WhatsApp.
