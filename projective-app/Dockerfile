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

# === Install Dependencies ===
# Copy dependency manifests first to leverage Docker cache
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist --optimize-autoloader

COPY package.json package-lock.json ./
RUN npm ci

# === Build Application ===
# Copy the entire application source code
COPY . .

# NOW, build the frontend assets since all files are present
RUN npm run build

# === Final Setup ===
# Set permissions (after all files are in place)
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy server configurations
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx/default.conf /etc/nginx/sites-available/default

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]