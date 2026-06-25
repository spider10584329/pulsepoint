# Nginx + SSL Setup for Ubuntu VPS

## Problem

Your Flask app is receiving HTTPS requests but only configured for HTTP, causing errors like:
```
code 400, message Bad request version ('\x16\x03\x01...')
```

## Solution: Nginx Reverse Proxy with SSL

### Architecture
```
Internet (HTTPS:443) → Nginx (SSL/TLS) → Flask (HTTP:5000 on localhost)
```

## Step-by-Step Setup

### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### Step 2: Install Certbot (for Let's Encrypt SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Step 3: Create Nginx Configuration

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/pulsepoint
```

Add this configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name api.pulsepoint.clinotag.com;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.pulsepoint.clinotag.com;

    # SSL certificates (Let's Encrypt will add these)
    # ssl_certificate /etc/letsencrypt/live/api.pulsepoint.clinotag.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.pulsepoint.clinotag.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/pulsepoint_access.log;
    error_log /var/log/nginx/pulsepoint_error.log;

    # Increase timeouts for long-running requests
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;
    send_timeout 300;

    # Proxy to Flask backend
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        
        # CORS headers (if needed)
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

        # Handle preflight OPTIONS requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # WebSocket support (for Socket.IO)
    location /socket.io {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (if any)
    location /static {
        alias /path/to/your/backend/static;
        expires 30d;
    }

    # Upload files
    location /uploads {
        alias /path/to/your/backend/uploads;
        expires 30d;
    }
}
```

**Important**: Update `/path/to/your/backend/` with your actual backend path!

### Step 4: Enable the Site

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/pulsepoint /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx
```

### Step 5: Obtain SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d api.pulsepoint.clinotag.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain the SSL certificate
- Update your Nginx configuration
- Set up auto-renewal

### Step 6: Configure Flask to Run on Localhost Only

Update your Flask app to bind to localhost only (not 0.0.0.0):

**Edit `backend/app.py`** (or wherever you start Flask):

```python
if __name__ == '__main__':
    # Only bind to localhost - Nginx will proxy requests
    app.run(host='127.0.0.1', port=5000, debug=False)
```

Or if using Gunicorn:

```bash
gunicorn --bind 127.0.0.1:5000 --workers 4 start:app
```

### Step 7: Set Up Flask as a System Service

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/pulsepoint.service
```

Add this content:

```ini
[Unit]
Description=PulsePoint Flask Backend
After=network.target mysql.service

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/your/backend
Environment="PATH=/usr/bin:/usr/local/bin"
Environment="PUBLIC_API_URL=https://api.pulsepoint.clinotag.com"
Environment="DATABASE_URL=mysql+pymysql://node:Corn6-dish@localhost:3306/pulsepoint_prod"

# Using Gunicorn (recommended for production)
ExecStart=/usr/local/bin/gunicorn --bind 127.0.0.1:5000 --workers 4 --timeout 300 start:app

# Or using Flask directly (not recommended for production)
# ExecStart=/usr/bin/python3 /path/to/your/backend/app.py

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Important**: Update these values:
- `User=your-username` → Your Ubuntu username
- `WorkingDirectory=/path/to/your/backend` → Your backend path
- `DATABASE_URL` → Your actual database credentials

Enable and start the service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable pulsepoint

# Start the service
sudo systemctl start pulsepoint

# Check status
sudo systemctl status pulsepoint

# View logs
sudo journalctl -u pulsepoint -f
```

### Step 8: Configure Firewall

```bash
# Allow Nginx HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Block direct access to Flask port (only allow from localhost)
sudo ufw deny 5000

# Enable firewall if not already enabled
sudo ufw enable

# Check firewall status
sudo ufw status
```

### Step 9: Test the Setup

```bash
# Test from command line
curl https://api.pulsepoint.clinotag.com/api/project/read

# Check Nginx logs
sudo tail -f /var/log/nginx/pulsepoint_access.log
sudo tail -f /var/log/nginx/pulsepoint_error.log

# Check Flask logs
sudo journalctl -u pulsepoint -f
```

## Auto-Renewal of SSL Certificate

Certbot automatically sets up a cron job or systemd timer for renewal. Test it:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Manual renewal (if needed)
sudo certbot renew
```

## Troubleshooting

### Issue 1: Nginx won't start

```bash
# Check configuration
sudo nginx -t

# Check what's using port 80/443
sudo netstat -tlnp | grep ':80\|:443'
```

### Issue 2: 502 Bad Gateway

This means Nginx can't reach Flask.

```bash
# Check if Flask is running
sudo systemctl status pulsepoint

# Check if Flask is listening on 127.0.0.1:5000
sudo netstat -tlnp | grep :5000

# Check Flask logs
sudo journalctl -u pulsepoint -n 50
```

### Issue 3: SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal
```

### Issue 4: Still Getting SSL Errors

```bash
# Restart everything
sudo systemctl restart pulsepoint
sudo systemctl restart nginx

# Clear browser cache and try again
```

## Alternative: Using PM2 Instead of Systemd

If you prefer PM2:

```bash
# Install PM2
sudo npm install -g pm2

# Start Flask with PM2
cd /path/to/your/backend
pm2 start "gunicorn --bind 127.0.0.1:5000 --workers 4 start:app" --name pulsepoint

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Check status
pm2 status

# View logs
pm2 logs pulsepoint
```

## Security Checklist

- [x] SSL/TLS enabled (HTTPS)
- [x] Flask only accessible from localhost
- [x] Firewall configured (UFW)
- [x] Auto-renewal of SSL certificates
- [x] CORS properly configured
- [x] Database credentials in environment variables
- [ ] Change default JWT secret key
- [ ] Use strong MySQL password
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`

## Quick Commands

```bash
# Restart Flask
sudo systemctl restart pulsepoint

# Restart Nginx
sudo systemctl restart nginx

# Check Flask logs
sudo journalctl -u pulsepoint -f

# Check Nginx logs
sudo tail -f /var/log/nginx/pulsepoint_error.log

# Check SSL certificate expiry
sudo certbot certificates

# Test Nginx config
sudo nginx -t
```

## Final Architecture

After setup:
```
Internet (HTTPS:443)
    ↓
Nginx (SSL termination, reverse proxy)
    ↓
Flask/Gunicorn (HTTP:5000 on 127.0.0.1)
    ↓
MySQL Database (localhost:3306)
```

This setup:
- ✅ Handles SSL/TLS properly
- ✅ Protects Flask from direct internet access
- ✅ Provides better performance and security
- ✅ Enables load balancing and caching (if needed)
- ✅ Proper production deployment
