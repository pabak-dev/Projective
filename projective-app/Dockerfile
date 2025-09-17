# Use the official PHP 8.3 FPM image on a lightweight Alpine Linux base
FROM php:8.3-fpm-alpine AS base

# Set working directory
WORKDIR /var/www

# Install system dependencies for PHP, NGINX, Supervisor, and Node.js
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
    git \
    linux-headers \
    nodejs \
    npm

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

# === Backend Build ===
# Copy composer dependency files and install
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist --optimize-autoloader

# === Frontend Build ===
# Copy package dependency files and install
COPY package.json package-lock.json ./
RUN npm install

# Build frontend assets for production
RUN npm run build

# === Final Setup ===
# Copy the rest of the application files
COPY . .

# Set permissions for Laravel
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy Supervisor and NGINX configuration files
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx/default.conf /etc/nginx/http.d/default.conf

# Expose port 80 for the NGINX web server
EXPOSE 80

# Start Supervisor which will manage NGINX and PHP-FPM
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]