# Start with the Bitnami Laravel image, which is what the Render example uses.
# This image includes Nginx, PHP-FPM, and Composer, all pre-configured.
FROM bitnami/laravel:10-debian-11

# Set the working directory
WORKDIR /app

# Copy your application code into the image
COPY . .

# Install your project's specific Composer dependencies
RUN composer install --optimize-autoloader --no-dev

RUN mkdir -p /app/storage/framework/views /app/bootstrap/cache

# This is a bitnami-specific step to ensure permissions are correct
RUN chown -R 1001:1001 /app