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

rm -rf dist
mkdir -p dist
cp -R index.html legal.html assets robots.txt sitemap.xml _headers 404.html .assetsignore \
      manifest.webmanifest sw.js "$INDEXNOW_KEY.txt" dist/
echo "dist/ listo:"
find dist -type f | sort
