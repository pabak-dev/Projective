# Use the official PHP 8.3 FPM image on a lightweight Alpine Linux base
FROM php:8.3-fpm-alpine AS base

# Set working directory
WORKDIR /var/www

# Install system dependencies needed for Laravel
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libzip-dev \
    jpeg-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    git

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    gd \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    sockets \
    zip \
    opcache

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy existing application directory contents
COPY . .

# Copy composer.json and composer.lock
COPY composer.json composer.lock ./

# Install composer dependencies
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist --optimize-autoloader

# Re-copy the full application to include all files
COPY . .

# Set permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]