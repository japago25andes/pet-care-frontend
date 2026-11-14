# 1) Compila la app
FROM node:22-slim AS build

WORKDIR /app
ENV NG_CLI_ANALYTICS=false

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx ng build

# 2) La sirve con nginx, que además reenvía /api al back
FROM nginx:1.27-alpine

# La imagen de nginx reemplaza ${API_TARGET} en las plantillas al arrancar
ENV API_TARGET=http://host.docker.internal:8001

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/pet-care-frontend/browser /usr/share/nginx/html

EXPOSE 80
