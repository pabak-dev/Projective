# Use the official PHP 8.3 FPM image on a Debian (Bookworm) base
FROM php:8.3-fpm-bookworm

# Set working directory
WORKDIR /var/www

# Install system dependencies & Node.js v22
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    gnupg \
    libpng-dev \
    libzip-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    git \
    zip \
    unzip \
    build-essential \
    --no-install-recommends && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_mysql zip opcache mbstring exif pcntl bcmath sockets

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# === Backend Build ===
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist --optimize-autoloader

# === Frontend Build ===
COPY package.json package-lock.json ./
RUN npm ci

# --- THIS IS THE FIX ---
# Explicitly install the native Rollup dependency that npm fails to install correctly.
RUN npm install --no-save @rollup/rollup-linux-x64-gnu

# Build frontend assets for production
RUN npm run build

# === Final Setup ===
COPY . .
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx/default.conf /etc/nginx/sites-available/default

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]