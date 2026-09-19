#!/usr/bin/env bash
# Crea la llave con la que se firma el APK. GUÁRDALA: si la pierdes no podrás actualizar
# la app instalada sin desinstalarla (y al desinstalar se pierden los datos locales).
#
# Uso: bash tools/crear-keystore.sh
set -euo pipefail

KEYSTORE="medicontrol.jks"
ALIAS="medicontrol"

read -r -s -p "Elige una contraseña para la llave (mínimo 6 caracteres): " PASS
echo
keytool -genkeypair -v -keystore "$KEYSTORE" -alias "$ALIAS" -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$PASS" -keypass "$PASS" -dname "CN=MediControl, O=Costos Security & Systems, C=MX"

echo
echo "Listo. Guarda una copia de $KEYSTORE y de la contraseña en un lugar seguro."
echo
echo "En GitHub: Settings > Secrets and variables > Actions > New repository secret, crea estos 4:"
echo "  ANDROID_KEYSTORE_PASSWORD = (la contraseña que elegiste)"
echo "  ANDROID_KEY_PASSWORD      = (la misma contraseña)"
echo "  ANDROID_KEY_ALIAS         = $ALIAS"
echo "  ANDROID_KEYSTORE_BASE64   = (el texto largo de abajo)"
echo
base64 -w0 "$KEYSTORE" 2>/dev/null || base64 "$KEYSTORE" | tr -d '\n'
echo
