# Static site — HTML/CSS/JS (Firebase runs in browser; nothing to compile)
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# App files served from web root so /dashboard.html and /js/app.js URLs work
WORKDIR /usr/share/nginx/html
COPY assets ./assets
COPY css ./css
COPY js ./js
COPY index.html dashboard.html firebase-messaging-sw.js ./

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
