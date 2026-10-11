# Multi-stage build for static website
FROM nginx:alpine AS base

# Copy website files to nginx serving directory
COPY . /usr/share/nginx/html/

# Copy custom nginx config (optional, for SPA routing)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
