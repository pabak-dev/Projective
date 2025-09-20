# Start with the Bitnami Laravel image.
FROM bitnami/laravel:10-debian-11

# --- Install Node.js for the frontend build ---
# Install curl to download the Node.js setup script
USER root
RUN apt-get update && apt-get install -y curl && apt-get clean
# Set up and install Node.js v18
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
# Switch back to the non-root user
#USER 1001
# --- End Node.js Install ---

# Set the working directory
WORKDIR /app

# Copy your application code into the image
COPY . .

# Install your project's specific Composer dependencies
RUN composer install --optimize-autoloader --no-dev

# --- Frontend Build Steps ---
# Install JavaScript dependencies
RUN npm install
# Build the production assets (this creates the manifest.json file)
RUN npm run build
# --- End Frontend Build ---

# Create the specific directories Laravel needs for caching.
RUN mkdir -p /app/storage/framework/views /app/bootstrap/cache

# This is a bitnami-specific step to ensure permissions are correct for ALL files,
# including the new directories and the frontend build artifacts.
RUN chown -R 1001:1001 /app