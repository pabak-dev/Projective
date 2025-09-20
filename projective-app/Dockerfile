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

# Expose port 80 for Nginx
EXPOSE 80

# Define the command that will run when the container starts
CMD ["sh", "-c", "chown -R www-data:www-data storage bootstrap/cache && php artisan migrate --force && php artisan config:cache && php artisan route:cache && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"]