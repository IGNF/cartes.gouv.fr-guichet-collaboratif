#----------------------------------------------------------------------
# cartesgouvfr-guichet-collaboratif : Génération d'un build statique
#----------------------------------------------------------------------
FROM node:26-alpine AS builder

ARG http_proxy=""
ARG https_proxy=$http_proxy
ARG HTTP_PROXY=$http_proxy
ARG HTTPS_PROXY=$http_proxy

WORKDIR /app
COPY . .

RUN npm ci \
    && VITE_BASE_URL="" VITE_FRONT_URL="/guichet-collaboratif" npm run build \
    && rm dist/env.js

#----------------------------------------------------------------------
# cartesgouvfr-guichet-collaboratif : Config d'un serveur statique avec nginx
#----------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
# Génère /tmp/env.js au démarrage à partir des variables APP_* (voir docker/40-env-js.sh)
COPY --chmod=755 docker/40-env-js.sh /docker-entrypoint.d/
ENV REQUIRED_ENV="APP_IAM_URL APP_IAM_REALM APP_IAM_CLIENT_ID APP_ESPACECO_URL"
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD test -s /tmp/env.js || exit 1

EXPOSE 8082

USER nginx

CMD ["nginx", "-g", "daemon off;"]