# projective-app/Dockerfile

#----------------------------------------------------------------
# Stage 1: PHP Base & Dependencies
#----------------------------------------------------------------
FROM php:8.3-fpm-bookworm AS base

RUN apt-get update && apt-get install -y \
    nginx supervisor libpng-dev libzip-dev libjpeg-dev \
    libfreetype6-dev libonig-dev git zip unzip \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_mysql zip opcache mbstring exif pcntl bcmath sockets

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www

#----------------------------------------------------------------
# Stage 2: Build Frontend Assets
#----------------------------------------------------------------
FROM node:20-bookworm AS frontend_builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY vite.config.js ./
COPY resources ./resources
RUN npm run build

#----------------------------------------------------------------
# Stage 3: Final Production Image
#----------------------------------------------------------------
FROM base AS final

COPY php/www.conf /usr/local/etc/php-fpm.d/www.conf

# Copy configurations first
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx/default.conf /etc/nginx/sites-enabled/default

WORKDIR /var/www

# Copy the entire application source code
COPY --chown=www-data:www-data . .
# Copy the built frontend assets
COPY --from=frontend_builder --chown=www-data:www-data /app/public/build ./public/build

# Now run composer install
RUN composer install --no-dev --optimize-autoloader

# ✅ --- FINAL CORRECTION --- ✅
# As ROOT, create all necessary framework directories and THEN set the correct ownership/permissions.
# This is the crucial step that fixes the "View path not found" error.
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache/data \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Now, switch to the www-data user to run the caching commands.
# This user now has a fully prepared and permissioned environment.
USER www-data
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Switch back to root to start the server
USER root
# ----------------------------

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]