# API URL Configuration

## How to Configure the Public API URL

The API Key generation feature can be configured to use your production domain name.

### For Local Development

No configuration needed! The system will automatically use `http://localhost:5000` (or your local server address).

### For Production Deployment

When deploying to your server with a domain name:

1. **Option 1: Using Environment Variable**
   
   Set the `PUBLIC_API_URL` environment variable:
   
   ```bash
   export PUBLIC_API_URL=https://yourdomain.com
   ```
   
   Or add it to your `.env` file:
   
   ```
   PUBLIC_API_URL=https://yourdomain.com
   ```

2. **Option 2: Edit start.py directly**
   
   In `backend/start.py`, change this line:
   
   ```python
   app.config['PUBLIC_API_URL'] = os.environ.get('PUBLIC_API_URL', None)
   ```
   
   To:
   
   ```python
   app.config['PUBLIC_API_URL'] = 'https://yourdomain.com'
   ```

### Examples

For domain `https://pulsepoint.myrfid.nc`:

```bash
export PUBLIC_API_URL=https://pulsepoint.myrfid.nc
```

Or in `.env` file:
```
PUBLIC_API_URL=https://pulsepoint.myrfid.nc
```

The generated API URL will then be:
```
https://pulsepoint.myrfid.nc/api/pulsepoint/subscription?apikey=xxxxx
```

### Important Notes

- **Include protocol**: Always include `https://` or `http://` in the URL
- **No trailing slash**: Don't add a trailing slash at the end
- **Restart required**: After changing the configuration, restart your backend server

### Testing

1. Set the PUBLIC_API_URL configuration
2. Restart the backend server
3. Go to Admin > API Key
4. Click "Generate Key"
5. The "Complete API URL" field should now show your domain name
