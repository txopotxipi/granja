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
  # Solo páginas indexables: legal.html lleva "noindex", así que avisar de
  # ella a los buscadores es contraproducente (se rastrearía para nada).
  # La lista debe coincidir con la de sitemap.xml.
  URLS="https://$HOST/"
  TOTAL=1
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

# La respuesta se captura por sustitución de comandos, no con "-o /dev/null":
# el curl de Windows (C:\Windows\System32\curl.exe) no entiende /dev/null y
# aborta con "exit 23 (Failed writing body)". Con "set -e" el script moría
# justo aquí, sin imprimir nunca el resultado.
RESPUESTA=$(curl -s -w '\n%{http_code}' \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$BODY") || {
    echo "Error: no se pudo contactar con api.indexnow.org (¿sin conexión?)."
    exit 1
  }

CODIGO=$(printf '%s' "$RESPUESTA" | tail -n 1)

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
