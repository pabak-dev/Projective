# Fix file permissions.
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Run database migrations.
php artisan migrate --force

# Clear and cache configurations.
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start the main application processes.
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf