#!/bin/sh
# Génère /tmp/env.js à partir des variables APP_* (exécuté par /docker-entrypoint.sh)
set -eu
out=/tmp/env.js
touch "$out" 2>/dev/null || { echo >&2 "ERROR: /tmp must be writable (emptyDir or tmpfs)"; exit 1; }

for name in ${REQUIRED_ENV:-}; do
    eval "v=\${$name:-}"
    [ -n "$v" ] || { echo >&2 "ERROR: missing required env var $name"; exit 1; }
done

esc() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }

{
    printf '// Fichier généré au démarrage du conteneur, ne pas éditer.\n'
    printf 'window.__APP_ENV__ = Object.freeze({'
    sep=""
    env | grep '^APP_[A-Za-z0-9_]*=' | sort | while IFS='=' read -r k v; do
        printf '%s"%s":"%s"' "$sep" "$k" "$(esc "$v")"
        sep=","
    done
    printf '});\n'
} > "$out"
