# projective-app/Dockerfile

# Use a base image with Nginx and PHP
FROM richarvey/nginx-php-fpm:3.4.1

# Set the working directory
WORKDIR /var/www

# Copy the application source code
COPY . .

# Copy the Nginx configuration
COPY nginx/default.conf /etc/nginx/sites-enabled/default

# Install Node.js, npm, and Composer dependencies, then build assets
RUN apt-get update && apt-get install -y nodejs npm && \
    npm install && \
    npm run build && \
    composer install --no-dev --optimize-autoloader

# Set the correct permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Cache config and routes
RUN php artisan config:cache && \
    php artisan route:cache

# Expose port 80 and start the services
EXPOSE 80
CMD ["/usr/bin/supervisord"]