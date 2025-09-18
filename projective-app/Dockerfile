#----------------------------------------------------------------
# Stage 1: PHP Base & Dependencies
#----------------------------------------------------------------
FROM php:8.3-fpm-bookworm AS base

# Install essential system packages and PHP extensions
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    libpng-dev \
    libzip-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    git \
    zip \
    unzip \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_mysql zip opcache mbstring exif pcntl bcmath sockets

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

#----------------------------------------------------------------
# Stage 2: Build Frontend Assets
#----------------------------------------------------------------
FROM node:20-bookworm AS frontend_builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend source files
COPY vite.config.js ./
COPY resources ./resources

# Build the assets
RUN npm run build

#----------------------------------------------------------------
# Stage 3: Final Production Image
#----------------------------------------------------------------
FROM base AS final

# Copy server configurations
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx/default.conf /etc/nginx/sites-available/default.conf

WORKDIR /var/www

# Copy the entire application
COPY . .

# Copy the built assets from the frontend_builder stage
COPY --from=frontend_builder --chown=www-data:www-data /app/public/build ./public/build

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Set correct permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Clear any cached config/routes from local development
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]