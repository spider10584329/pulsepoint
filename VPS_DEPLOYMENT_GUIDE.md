# VPS Deployment Guide for PulsePoint

## Current Status
- **Domain**: api.pulsepoint.clinotag.com
- **Issue**: API URL showing localhost instead of production domain
- **Solution**: Configure environment variables on VPS

## Step-by-Step Deployment Instructions

### 1. Install python-dotenv on VPS

SSH into your VPS and navigate to your backend directory, then run:

```bash
pip install python-dotenv==1.0.0
```

Or install all requirements:

```bash
cd /path/to/your/backend
pip install -r requirements.txt
```

### 2. Create .env file on VPS

On your VPS, create a `.env` file in the backend directory:

```bash
cd /path/to/your/backend
nano .env
```

Add this content to the file:

```properties
PUBLIC_API_URL=https://api.pulsepoint.clinotag.com
```

Save and exit (Ctrl+X, then Y, then Enter in nano).

### 3. Verify .env file

Make sure the .env file exists and has the correct content:

```bash
cat .env
```

You should see:
```
PUBLIC_API_URL=https://api.pulsepoint.clinotag.com
```

### 4. Restart Your Backend Server

Restart your Flask application. The method depends on how you're running it:

**If using systemd service:**
```bash
sudo systemctl restart pulsepoint-backend
```

**If using PM2:**
```bash
pm2 restart pulsepoint-backend
```

**If using gunicorn directly:**
```bash
# Kill the old process
pkill -f gunicorn

# Start new process
gunicorn --bind 0.0.0.0:5000 start:app
```

**If running with python directly:**
```bash
# Kill the old process
pkill -f "python.*app.py"

# Start new process
cd /path/to/your/backend
python app.py
```

### 5. Test the Configuration

After restarting, test if the environment variable is loaded:

**Method 1: Check from Python shell**
```bash
cd /path/to/your/backend
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.environ.get('PUBLIC_API_URL'))"
```

You should see: `https://api.pulsepoint.clinotag.com`

**Method 2: Test the API endpoint**

Log into your admin panel and navigate to the API Key section. The "Complete API URL" should now show:

```
https://api.pulsepoint.clinotag.com/api/pulsepoint/subscription?apikey=...
```

Instead of:

```
http://localhost:5001/api/pulsepoint/subscription?apikey=...
```

### 6. Troubleshooting

#### Issue: Still showing localhost

**Check 1: Verify .env file location**
```bash
cd /path/to/your/backend
ls -la | grep .env
```

The `.env` file should be in the same directory as `start.py` and `app.py`.

**Check 2: Verify .env file content**
```bash
cat /path/to/your/backend/.env
```

**Check 3: Verify python-dotenv is installed**
```bash
pip list | grep python-dotenv
```

**Check 4: Check if environment variable is loaded in Python**
```bash
cd /path/to/your/backend
python << EOF
from dotenv import load_dotenv
import os
load_dotenv()
print("PUBLIC_API_URL:", os.environ.get('PUBLIC_API_URL'))
EOF
```

**Check 5: Check Flask app logs**
```bash
# View systemd logs (if using systemd)
sudo journalctl -u pulsepoint-backend -n 100

# View PM2 logs (if using PM2)
pm2 logs pulsepoint-backend

# View direct output
tail -f /path/to/your/logs/app.log
```

#### Issue: Permission denied on .env file

```bash
# Set proper permissions
chmod 600 /path/to/your/backend/.env

# Ensure ownership is correct
chown youruser:youruser /path/to/your/backend/.env
```

### 7. Alternative Method: Set Environment Variable Directly

If the `.env` file method doesn't work, you can set the environment variable directly:

**For systemd service:**

Edit your service file:
```bash
sudo nano /etc/systemd/system/pulsepoint-backend.service
```

Add this line in the `[Service]` section:
```ini
Environment="PUBLIC_API_URL=https://api.pulsepoint.clinotag.com"
```

Then reload and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart pulsepoint-backend
```

**For PM2:**

```bash
pm2 delete pulsepoint-backend
pm2 start app.py --name pulsepoint-backend --interpreter python3 --env PUBLIC_API_URL=https://api.pulsepoint.clinotag.com
pm2 save
```

**For direct command:**

```bash
export PUBLIC_API_URL=https://api.pulsepoint.clinotag.com
python app.py
```

### 8. CORS Configuration

Make sure your CORS settings allow requests from your frontend domain. Check `app.py` or `start.py` for CORS configuration.

If needed, update CORS settings:

```python
from flask_cors import CORS

# Allow all origins (development)
CORS(app, resources={r"/*": {"origins": "*"}})

# Or specify your frontend domain (production - recommended)
CORS(app, resources={r"/*": {"origins": ["https://pulsepoint.clinotag.com", "https://www.pulsepoint.clinotag.com"]}})
```

### 9. SSL/HTTPS Configuration

Make sure your VPS is configured with SSL certificate for `api.pulsepoint.clinotag.com`.

**Using Let's Encrypt with Nginx:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.pulsepoint.clinotag.com
```

**Using Nginx as reverse proxy:**

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name api.pulsepoint.clinotag.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.pulsepoint.clinotag.com;

    ssl_certificate /etc/letsencrypt/live/api.pulsepoint.clinotag.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.pulsepoint.clinotag.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Files Modified

The following files have been updated to support environment-based configuration:

1. **backend/start.py** - Added dotenv loading
2. **backend/requirements.txt** - Added python-dotenv dependency
3. **backend/.env** - Contains PUBLIC_API_URL configuration
4. **backend/resources/project.py** - Uses app.config['PUBLIC_API_URL']

## Security Notes

- The `.env` file contains configuration settings and should NOT be committed to git
- Make sure `.env` is in your `.gitignore` file
- Only `.env.example` should be committed as a template
- Set proper file permissions on `.env`: `chmod 600 .env`

## Quick Checklist

- [ ] Install python-dotenv on VPS: `pip install python-dotenv`
- [ ] Create `.env` file in backend directory
- [ ] Set `PUBLIC_API_URL=https://api.pulsepoint.clinotag.com` in `.env`
- [ ] Restart backend server
- [ ] Test API Key generation - URL should show your domain
- [ ] Verify CORS settings allow your frontend domain
- [ ] Ensure SSL certificate is configured

## Support

If you continue to see localhost in the API URL after following these steps:

1. Check the Flask application logs
2. Verify the environment variable is loaded: `python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.environ.get('PUBLIC_API_URL'))"`
3. Make sure you restarted the backend server after creating the .env file
4. Verify the .env file is in the correct directory (same as start.py)
