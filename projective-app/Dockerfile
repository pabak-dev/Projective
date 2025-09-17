#----------------------------------------------------------------
# Stage 1: PHP Base & Dependencies
#----------------------------------------------------------------
# Using a specific version is better for reproducibility
FROM php:8.3.11-fpm-bookworm AS base

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
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

#----------------------------------------------------------------
# Stage 2: Composer Vendor Dependencies
#----------------------------------------------------------------
FROM base AS composer_vendor

# Copy only composer files to leverage cache
COPY composer.json composer.lock ./
# Install production dependencies
RUN composer install --no-interaction --no-scripts --no-dev --prefer-dist --optimize-autoloader

#----------------------------------------------------------------
# Stage 3: Frontend Asset Builder
#----------------------------------------------------------------
# Use a Node.js LTS version based on Debian for better compatibility
FROM node:20-bookworm AS frontend_builder

WORKDIR /app

# Copy only package files to leverage cache
COPY package.json ./
# Use npm install to generate a fresh lockfile inside the container
RUN npm install

# Copy frontend source files
COPY vite.config.js ./
COPY resources ./resources

# Build the assets
RUN npm run build

#----------------------------------------------------------------
# Stage 4: Final Production Image
#----------------------------------------------------------------
FROM base AS final

# Copy server configurations
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx/default.conf /etc/nginx/sites-available/default

WORKDIR /var/www

# Copy vendor dependencies from the composer stage
COPY --from=composer_vendor /var/www/vendor ./vendor

# Copy application code (excluding files in .dockerignore)
COPY . .

# Copy compiled assets from the frontend builder stage
COPY --from=frontend_builder /app/public/build ./public/build

# Set correct permissions for storage and bootstrap cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Clear any cached config/routes from local development
RUN php artisan config:clear && php artisan route:clear

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]