# E-Cloud

## Installation

This will update your panel to the latest version of NookTheme panel is based. <br>
You can see the version in the current branch name.

<details>
<summary>Upgrade PHP</summary>

Before proceeding with the installation steps, ensure that your PHP version is upgraded to 8.2 or newer. Follow the instructions below to upgrade PHP:

1. Update your package list:
```bash
sudo apt update
```

2. Install the required dependencies:
```bash
sudo apt install -y software-properties-common
```

3. Add the PHP repository:
```bash
sudo add-apt-repository ppa:ondrej/php
```

4. Update your package list again:
```bash
sudo apt update
```

5. Install PHP 8.3:
```bash
sudo apt install -y php8.3
```

6. Verify the PHP version:
```bash
php -v
```

</details>

### Automatic Installation / Update

To automatically run the entire update process, including downloading files, setting permissions, installing dependencies, and **automatically creating/updating the SQL tables**, simply paste and run the following block of commands:

```bash
cd /var/www/pterodactyl && \
php artisan down && \
curl -L https://github.com/enzonic-llc/e-cloud/releases/download/v2/panel.tar.gz | tar -xzv && \
chmod -R 755 storage/* bootstrap/cache && \
composer install --no-dev --optimize-autoloader && \
php artisan view:clear && \
php artisan config:clear && \
php artisan migrate --seed --force && \
chown -R www-data:www-data /var/www/pterodactyl/* && \
php artisan queue:restart && \
php artisan up
```

---

### Manual Installation Steps

If you prefer to perform the steps manually, follow the sections below.

### Enter Maintenance Mode

Whenever you are performing an update you should be sure to place your Panel into maintenance mode. This will prevent
users from encountering unexpected errors and ensure everything can be updated before users encounter
potentially new features.

```bash
cd /var/www/pterodactyl

php artisan down
```

### Download the theme

The first step in the update process is to download the new panel files from GitHub. The command below will download
the release archive for the most recent version of Pterodactyl, save it in the current directory and will automatically
unpack the archive into your current folder.

```bash
curl -L https://github.com/enzonic-llc/e-cloud/releases/download/v2/panel.tar.gz | tar -xzv
```

Once all of the files are downloaded we need to set the correct permissions on the cache and storage directories to avoid
any webserver related errors.

```bash
chmod -R 755 storage/* bootstrap/cache
```

### Update Dependencies

After you've downloaded all of the new files you will need to upgrade the core components of the panel. To do this,
simply run the commands below and follow any prompts.

```bash
composer install --no-dev --optimize-autoloader
```

### Clear Compiled Template Cache

You'll also want to clear the compiled template cache to ensure that new and modified templates show up correctly for
users.

```bash
php artisan view:clear
php artisan config:clear
```

### Database Updates

You'll also need to update your database schema for the newest version of Pterodactyl. Running the command below
will update the schema and ensure the default eggs we ship are up to date (and add any new ones we might have). Just
remember, _never edit core eggs we ship_! They will be overwritten by this update process.

```bash
php artisan migrate --seed --force
```

### Set Permissions

The last step is to set the proper owner of the files to be the user that runs your webserver. In most cases this
is `www-data` but can vary from system to system &mdash; sometimes being `nginx`, `caddy`, `apache`, or even `nobody`.

```bash
# If using NGINX or Apache (not on CentOS):
chown -R www-data:www-data /var/www/pterodactyl/*

# If using NGINX on CentOS:
chown -R nginx:nginx /var/www/pterodactyl/*

# If using Apache on CentOS
chown -R apache:apache /var/www/pterodactyl/*
```

### Restarting Queue Workers

After _every_ update you should restart the queue worker to ensure that the new code is loaded in and used.

```bash
php artisan queue:restart
```

### Exit Maintenance Mode

Now that everything has been updated you need to exit maintenance mode so that the Panel can resume accepting
connections.

```bash
php artisan up
```

