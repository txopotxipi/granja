#!/bin/sh
# ============================================================
#  indexnow.sh — avisa a los buscadores de que el sitio cambió
#
#  IndexNow es un protocolo abierto que usan Microsoft Bing,
#  Yandex, Seznam y Naver. Con él la indexación pasa de semanas
#  a minutos.
#
#  Google NO usa IndexNow: para Google hay que hacerlo desde
#  Search Console (ver README, sección "Aparecer en Google y
#  Microsoft").
#
#  Uso:
#    sh indexnow.sh                              -> avisa de las páginas del sitio
#    sh indexnow.sh https://ejemplo.com/pagina   -> avisa de URLs concretas
# ============================================================
set -e

HOST="granja.pages.dev"
KEY="1333325af64a5be5f5dfc84353b1dac9"

if [ $# -gt 0 ]; then
  URLS="$*"
  TOTAL=$#
else
  URLS="https://$HOST/ https://$HOST/legal.html"
  TOTAL=2
fi

# Construye el array JSON de URLs
LIST=""
for u in $URLS; do
  [ -n "$LIST" ] && LIST="$LIST,"
  LIST="$LIST\"$u\""
done

BODY="{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"https://$HOST/$KEY.txt\",\"urlList\":[$LIST]}"

echo "Avisando a IndexNow de $TOTAL URL(s)..."
echo ""

CODIGO=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$BODY")

echo "Respuesta HTTP: $CODIGO"
case "$CODIGO" in
  200) echo "  Correcto: las URLs se han aceptado." ;;
  202) echo "  Aceptado: la clave se validara en segundo plano." ;;
  400) echo "  Error: el cuerpo de la peticion no es valido." ;;
  403) echo "  Error: la clave no es valida. Comprueba que $KEY.txt esta publicado en la raiz." ;;
  422) echo "  Error: alguna URL no pertenece a $HOST, o la clave no coincide." ;;
  429) echo "  Error: demasiadas peticiones. Espera y vuelve a intentarlo." ;;
  *)   echo "  Respuesta inesperada. Revisa la conexion." ;;
esac
