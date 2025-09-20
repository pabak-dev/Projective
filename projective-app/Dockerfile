# Start with the official PHP 8.2 FPM image
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    git \
    unzip \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libxml2-dev \
    libzip-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_mysql zip exif pcntl

# Get the latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application code
COPY . .

# Copy Nginx and Supervisor configurations
COPY nginx/default.conf /etc/nginx/sites-available/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install Composer dependencies
RUN composer install --optimize-autoloader --no-dev

# === THE RENDER EXAMPLE STRATEGY ===
# 1. Generate the application key. This requires an .env file.
RUN cp .env.example .env && php artisan key:generate

# 2. Generate all cache files during the build.
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# 3. Fix permissions of all storage and cache files created above.
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
# === END STRATEGY ===

# Expose port 80 for Nginx
EXPOSE 80

# The CMD instruction will run when the container starts on Render.
# It will first run migrations and then start the servers.
CMD ["sh", "-c", "php artisan migrate --force && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"]