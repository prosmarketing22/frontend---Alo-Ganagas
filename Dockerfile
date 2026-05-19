# ============================================
# Dockerfile - Frontend Alo Ganagas
# Multi-stage: Build con Node + Serve con Nginx
# ============================================

# --- Etapa de build ---
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Variables de entorno para el build de Vite
# Se inyectan en tiempo de build via docker-compose
ARG VITE_API_URL
ARG VITE_SOCKET_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

RUN npm run build

# --- Etapa de produccion con Nginx ---
FROM nginx:1.27-alpine AS production

# Copiar build de React
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuracion de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
