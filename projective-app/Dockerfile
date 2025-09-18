#----------------------------------------------------------------
# Stage 1: PHP Base & Dependencies
#----------------------------------------------------------------
FROM php:8.3-fpm-bookworm AS base

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

# Copy the entire application source code first
COPY --chown=www-data:www-data . .

# Copy the built frontend assets
COPY --from=frontend_builder --chown=www-data:www-data /app/public/build ./public/build

# Now run composer install, with the artisan file present
RUN composer install --no-dev --optimize-autoloader

# Set final permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Run caching commands as the www-data user
USER www-data
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Switch back to root to start the server
USER root

# Expose port 80 and start the services
EXPOSE 80
CMD ["/usr/bin/supervisord"]