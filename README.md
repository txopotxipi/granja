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

## Aparecer en Google y Microsoft

Que una web «aparezca» en un buscador no se activa desde el código: hay que **dar de
alta el sitio** en cada buscador y esperar a que rastree. El código solo se encarga de
que, cuando llegue, lo entienda bien. Esa parte ya está hecha.

### Lo que la web ya trae puesto (no hay que tocar nada)

| Pieza | Para qué sirve |
|---|---|
| `robots.txt` | Permite el rastreo y señala dónde está el sitemap |
| `sitemap.xml` | Lista la home. `legal.html` y `404.html` quedan fuera a propósito (llevan `noindex`) |
| `<meta name="robots" … max-image-preview:large>` | Sin esto Google enseña la foto en miniatura diminuta; con esto, sale grande |
| `<link rel="canonical">` | Evita contenido duplicado |
| JSON-LD `Farm` + `LocalBusiness` | Dirección, coordenadas, horarios, teléfono y ofertas. Es lo que alimenta el panel de negocio local |
| JSON-LD `FAQPage` | Permite que las 8 preguntas salgan desplegables en los resultados |
| `{clave}.txt` + `indexnow.sh` | Avisa a Microsoft Bing (y Yandex, Seznam, Naver) en minutos, sin esperar semanas |
| `google-site-verification` (meta y archivo) | Demuestran a Search Console que el sitio es tuyo. Los dos métodos, por si acaso |
| `404.html` con `noindex` | Evita que una página de error acabe en los resultados |

### Paso 1 — Google Search Console

1. Entra en <https://search.google.com/search-console> con una cuenta de Google.
2. **Añadir propiedad → Prefijo de URL** → `https://granja.pages.dev/`
3. Te pedirá verificar. Como `pages.dev` es de Cloudflare y no controlas su DNS, los
   métodos de DNS no sirven. Usa uno de estos dos:
   - **Etiqueta HTML** (lo más rápido): copia el `<meta name="google-site-verification" …>`
     que te da y pásamelo. Lo pongo en el `<head>` de `index.html` y se publica solo.
   - **Archivo HTML**: `google55690119d3470c17.html` está en la raíz y `build.sh` lo
     copia a `dist/` mediante la variable `GOOGLE_VERIFICACION`. Google exige el nombre
     **exacto**. Si se regenera, el nombre cambia → actualizar esa variable y borrar el
     archivo antiguo del repositorio.

> **Los dos métodos están activos a la vez, y es a propósito.** El token es el mismo
> (`google55690119d3470c17`), así que da igual cuál elija Txopo en Search Console.
> El motivo de duplicarlo: **Cloudflare Pages responde 308 en todas las rutas
> `*.html`** (redirige `/x.html` → `/x`, comprobado también en `legal.html` e
> `index.html`). El archivo se sirve con el contenido correcto en la URL sin
> extensión, y Google sigue redirecciones, pero no vale la pena que la verificación
> dependa de eso: con la etiqueta del `<head>` no hay redirección de por medio.
4. Ya verificado, entra en **Sitemaps** y envía `sitemap.xml`.
5. Opcional: en **Inspección de URL**, pega `https://granja.pages.dev/` y pulsa
   «Solicitar indexación». Acelera la primera visita.

### Paso 2 — Microsoft Bing Webmaster Tools

1. Entra en <https://www.bing.com/webmasters> con una cuenta Microsoft.
2. **Lo más fácil: importar desde Google Search Console.** Hay un botón para ello y te
   trae el sitio ya verificado, sin repetir el proceso.
3. Si prefieres hacerlo aparte: **Añadir sitio** → `https://granja.pages.dev/` →
   verificar (mismos métodos que Google) → enviar `sitemap.xml`.
4. Bing alimenta también a **Copilot** y a los resultados de Windows. Merece la pena.

### Paso 3 — Avisar de los cambios (IndexNow)

Cada vez que publiques algo nuevo, avisa a los buscadores. Tarda un minuto:

```bash
sh indexnow.sh
```

Google **no usa IndexNow**. Para Google, el aviso se da en Search Console con
«Solicitar indexación», o simplemente esperando a que vuelva a rastrear.

> **Aviso sobre `indexnow.sh` (corregido el 2026-09-16).** El script usaba
> `curl -o /dev/null`, y el `curl` de Windows (`C:\Windows\System32\curl.exe`) no
> entiende `/dev/null`: devolvía *exit 23 (Failed writing body)*. Como el script lleva
> `set -e`, moría en esa línea y **nunca imprimía el resultado**. La petición sí llegaba
> al servidor, pero no había forma de saberlo. Ahora la respuesta se captura por
> sustitución de comandos, así que funciona igual en Windows y en Linux. Si algún día
> añades llamadas a `curl` en otros scripts, evita `/dev/null` por el mismo motivo.

### Comprobar si ya apareces (o no)

Esto no se puede automatizar: Google y Bing bloquean las consultas hechas por
programas. Hay que mirarlo **a mano en el navegador**:

| Buscador | Qué escribir | Si sale «no obtuvo ningún resultado» |
|---|---|---|
| Google | `site:granja.pages.dev` en <https://www.google.com> | Todavía no está indexado |
| Bing | `site:granja.pages.dev` en <https://www.bing.com> | Todavía no está indexado |
| Bing (alternativa) | `site:granja.pages.dev` en <https://duckduckgo.com> | DuckDuckGo usa el índice de Bing, así que sirve de atajo |

Truco: si `site:granja.pages.dev` no devuelve nada pero `site:pages.dev` sí, el
buscador conoce el dominio pero aún no tu página. Y si buscas `Granja Piloño` y sales,
estás indexado aunque el `site:` tarde en reflejarlo.

### Paso 4 — Ficha de Google (Google Maps) ← lo que más visitas trae

Para una granja, aparecer en Maps y en el mapa de resultados importa más que la
búsqueda normal. Es gratis:

1. Entra en <https://www.google.com/business/> y crea la ficha de «Granja Piloño».
2. Rellena **nombre, dirección, teléfono, horario y web**. Tienen que ser **idénticos**
   a los de la web: si el teléfono de la ficha y el de la web no coinciden, Google
   desconfía y el posicionamiento local baja.
3. Verifica la propiedad. Google suele pedir un vídeo del local o una postal con un
   código. Tarda unos días.
4. Sube fotos reales y pide reseñas a los clientes: es el factor que más mueve la aguja.

> **Esto está bloqueado hasta que haya datos reales.** La ficha exige un teléfono y una
> dirección verificables. Hoy la web tiene un teléfono inventado (`+34 600 000 000`) y
> las coordenadas son orientativas. Google rechaza o suspende fichas con datos que no
> puede comprobar, y una ficha suspendida es difícil de recuperar.

### Cuánto tarda

- **Bing**: con IndexNow, de horas a un par de días.
- **Google**: de unos días a varias semanas la primera vez. Un sitio nuevo tarda más:
  Google necesita comprobar que es real y que aporta algo.
- **Maps**: la ficha aparece en cuanto se verifica, pero tarda semanas en posicionarse.

### Una advertencia honesta

Un subdominio `granja.pages.dev` es de Cloudflare, no tuyo. Funciona y Google lo indexa,
pero tiene dos límites: no transmite la confianza de un dominio propio y, si algún día
compras uno, habrá que rehacer el alta en los buscadores y añadir redirecciones.

Y hay un problema mayor: **Google no posiciona bien una web cuyo teléfono y email no
existen.** El sitio es una demostración hasta que tenga los datos reales. La secuencia
correcta es: datos reales → publicar → dar de alta en los buscadores → ficha de Maps.

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
| **Lista de pueblos de la zona de reparto** (la propuse yo, sin confirmar) | `index.html`, sección `#zona`: contrastar con el radio real de reparto (150 km) y quitar o añadir los que haga falta |

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
