FROM node:19-alpine AS build

# Add a work directory
WORKDIR /app

# Cache and Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy app files
COPY . .

# Build the React app
RUN npm run build

# Copy images from src/assets to dist/assets
RUN mkdir -p dist/assets && cp -r src/assets/* dist/assets/

# Use nginx to serve the build output
FROM nginx:latest

# Copy the build output to the nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy images from the build output to the nginx html directory
COPY --from=build /app/dist/assets /usr/share/nginx/html/assets

# Remove the default nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration file
COPY nginx/nginx.conf /etc/nginx/conf.d

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]