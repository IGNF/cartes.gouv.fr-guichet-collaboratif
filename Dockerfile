#----------------------------------------------------------------------
# cartesgouvfr-guichet-collaboratif : Génération d'un build statique
#----------------------------------------------------------------------
FROM node:22-alpine AS builder

ARG http_proxy=""
ARG https_proxy=$http_proxy
ARG HTTP_PROXY=$http_proxy
ARG HTTPS_PROXY=$http_proxy

WORKDIR /app
COPY . .

RUN npm ci \
    && VITE_BASE_URL="" VITE_FRONT_URL="/guichet-collaboratif" npm run build

#----------------------------------------------------------------------
# cartesgouvfr-guichet-collaboratif : Config d'un serveur statique avec nginx
#----------------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8082

USER nginx

CMD ["nginx", "-g", "daemon off;"]