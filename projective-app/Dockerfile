# Use the official PHP 8.3 FPM image on a Debian (Bookworm) base
FROM php:8.3-fpm-bookworm

# Set working directory
WORKDIR /var/www

# === Install System Dependencies & Correct Node.js Version ===
# Install dependencies, set up NodeSource for Node.js v22, then install Node.js
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
    # Add the NodeSource repository for Node.js 22.x
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    # Install Node.js from the new repository
    apt-get install -y nodejs && \
    # Clean up
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo_mysql zip opcache mbstring exif pcntl bcmath sockets

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# === Backend Build ===
# Copy composer dependency files and install
COPY composer.json composer.lock ./
RUN composer install --no-interaction --no-plugins --no-scripts --no-dev --prefer-dist --optimize-autoloader

# === Frontend Build ===
# Copy package dependency files and perform a clean install with `npm ci`
COPY package.json package-lock.json ./
RUN npm ci

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
COPY nginx/default.conf /etc/nginx/sites-available/default

# Expose port 80 for the NGINX web server
EXPOSE 80

# Start Supervisor which will manage NGINX and PHP-FPM
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]