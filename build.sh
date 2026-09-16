#!/bin/sh
# ============================================================
#  Granja Piloño — build para Cloudflare Pages
#  Copia SOLO lo público a dist/. Todo lo demás (.agents, *.md,
#  .htaccess, enviar.php, tmp-log, .git) nunca llega a producción.
#
#  En Cloudflare Pages -> Settings -> Build & deployments:
#    Build command:     sh build.sh
#    Output directory:  dist
# ============================================================
set -e

# Clave de IndexNow. El archivo {clave}.txt tiene que estar publicado en la
# raíz del sitio para que Bing pueda comprobar que somos los dueños antes de
# aceptar los avisos de indexación. Si se rota la clave, actualizar también
# indexnow.sh.
INDEXNOW_KEY="1333325af64a5be5f5dfc84353b1dac9"

# Archivos de verificación de propiedad de los buscadores. Tienen que servirse
# en la raíz con el nombre EXACTO que da cada buscador, y ese nombre cambia cada
# vez que se regenera la verificación. Por eso no se listan uno a uno: se copian
# por patrón y, si alguno no existe, se ignora sin romper el build.
#   google*.html       -> Google Search Console (método «Archivo HTML»)
#   BingSiteAuth.xml   -> Microsoft Bing Webmaster Tools (método «XML File»)
# Cuidado con el `for`: el `if` es necesario. Un `[ -e "$f" ] && cp ...` a secas
# devuelve no-cero cuando el archivo no existe y, con `set -e`, mataría el build.
VERIFICACIONES="google*.html BingSiteAuth.xml"

rm -rf dist
mkdir -p dist
cp -R index.html legal.html assets robots.txt sitemap.xml _headers 404.html .assetsignore \
      manifest.webmanifest sw.js "$INDEXNOW_KEY.txt" dist/

for f in $VERIFICACIONES; do
  if [ -e "$f" ]; then
    cp "$f" dist/
    echo "verificación copiada: $f"
  fi
done
echo "dist/ listo:"
find dist -type f | sort
