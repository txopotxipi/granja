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
rm -rf dist
mkdir -p dist
cp -R index.html legal.html assets robots.txt sitemap.xml _headers 404.html .assetsignore \
      manifest.webmanifest sw.js dist/
echo "dist/ listo:"
find dist -type f | sort
