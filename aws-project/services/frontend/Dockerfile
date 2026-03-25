# Use nginx to serve static files — lightweight and fast
FROM nginx:alpine

# Copy our HTML to nginx's default serve directory
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
