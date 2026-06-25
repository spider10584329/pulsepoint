# Ubuntu "Invalid API Key" Error - Troubleshooting Guide

## Problem Diagnosis

The "Invalid API key" error on your Ubuntu VPS is caused by a **hardcoded database connection** in `backend/start.py`:

```python
# Line 41 in start.py - HARDCODED to local development database
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:''@localhost:3306/pulsepoint'
```

This means:
- ✅ **Works locally**: Connects to your local `pulsepoint` database with root user
- ❌ **Fails on Ubuntu**: Still tries to connect to a database that doesn't exist or is different

## Root Causes

1. **Different Database on Ubuntu**: Your production database is likely named differently (e.g., `pulsepoint_prod`)
2. **Different MySQL Credentials**: Ubuntu MySQL might not allow root with empty password
3. **Empty API Key Table**: The API key generated locally doesn't exist in Ubuntu's database
4. **Database Not Migrated**: The `apikey` table might not exist on Ubuntu

## Quick Diagnosis Steps

### Step 1: Check Database Connection on Ubuntu

SSH into your Ubuntu VPS and run:

```bash
cd /path/to/your/backend
python3 << EOF
from dotenv import load_dotenv
load_dotenv()
import pymysql

# Test the hardcoded connection from start.py
try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='pulsepoint',
        port=3306
    )
    print("✅ Connected successfully to 'pulsepoint' database")
    
    # Check if apikey table exists
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES LIKE 'apikey'")
    if cursor.fetchone():
        print("✅ apikey table exists")
        
        # Check if there are any API keys
        cursor.execute("SELECT COUNT(*) FROM apikey")
        count = cursor.fetchone()[0]
        print(f"✅ Found {count} API key(s) in database")
        
        if count > 0:
            cursor.execute("SELECT apikey, created_at FROM apikey ORDER BY created_at DESC LIMIT 1")
            result = cursor.fetchone()
            print(f"✅ Latest API key: {result[0]} (created: {result[1]})")
    else:
        print("❌ apikey table does NOT exist - need to run migrations")
    
    conn.close()
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    print("\nThis is likely why you're getting 'Invalid API key' error!")
EOF
```

### Step 2: Check What Database MySQL Actually Has

```bash
# Login to MySQL
sudo mysql -u root -p

# Or if you have different credentials
mysql -u node -p

# Once logged in, run:
SHOW DATABASES;
USE pulsepoint;  # or USE pulsepoint_prod;
SHOW TABLES;
SELECT * FROM apikey;
EXIT;
```

## Solution Options

### Option 1: Use the Correct Database Credentials (Recommended)

Based on the commented line in `start.py`, it looks like your production database uses:
- **Username**: `node`
- **Password**: `Corn6-dish`
- **Database**: `pulsepoint_prod`

**On your Ubuntu VPS**, edit `backend/start.py` line 41-42:

```python
# Comment out the local development line
#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:''@localhost:3306/pulsepoint'

# Uncomment the production line
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://node:Corn6-dish@localhost:3306/pulsepoint_prod'
```

Then restart your backend server.

### Option 2: Generate New API Key on Ubuntu

After fixing the database connection, you need to generate a new API key through the Ubuntu server:

1. **Fix the database connection** (use Option 1 above)
2. **Restart your backend server**
3. **Log into your admin panel** on the production domain
4. **Navigate to the API Key section**
5. **Click "Generate Key"** - This will create a new API key in the correct database
6. **Copy the new API URL** and use it

### Option 3: Use Environment Variables (Best Practice)

Instead of hardcoding, make the database configurable:

**Edit `backend/start.py`** line 36-42:

```python
# jwt-passport
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'secret!!!')
jwt = JWTManager(app)

# connect to the MySql - Use environment variable or fallback to local dev
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'mysql+pymysql://root:''@localhost:3306/pulsepoint'  # Local dev default
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
```

**Create/Edit `backend/.env` file on Ubuntu VPS**:

```properties
# Public API URL
PUBLIC_API_URL=https://api.pulsepoint.clinotag.com

# Database Configuration for Production
DATABASE_URL=mysql+pymysql://node:Corn6-dish@localhost:3306/pulsepoint_prod

# JWT Secret (use a strong secret in production!)
JWT_SECRET_KEY=your-secret-key-here-change-in-production
```

**Restart the backend server** and it will automatically use the correct database.

## Verification Steps

After applying any solution:

### 1. Verify Database Connection

```bash
cd /path/to/your/backend
python3 -c "from start import db; print('✅ Database connected:', db.engine.url)"
```

### 2. Check API Key Table

```bash
python3 << EOF
from start import db
from models.apikey import ApiKeyModel

try:
    keys = ApiKeyModel.query.all()
    print(f"Found {len(keys)} API key(s)")
    for key in keys:
        print(f"  - {key.apikey} (created: {key.created_at})")
except Exception as e:
    print(f"Error: {e}")
EOF
```

### 3. Test API Key Endpoint

```bash
# Replace YOUR_API_KEY with the actual API key from your database
curl "https://api.pulsepoint.clinotag.com/api/pulsepoint/subscription?apikey=YOUR_API_KEY"
```

You should see subscription data, not `{"error": "Invalid API key"}`.

## Database Migration (If Tables Don't Exist)

If the `apikey` table doesn't exist on Ubuntu:

```bash
cd /path/to/your/backend

# Make sure you're using the correct database (Option 1 or 3 above)

# Create all tables
python3 << EOF
from start import app, db
with app.app_context():
    db.create_all()
    print("✅ All tables created")
EOF
```

## Common Issues

### Issue 1: "Access denied for user 'root'@'localhost'"

**Solution**: Your Ubuntu MySQL doesn't allow root with empty password. Use the correct credentials (Option 1 or 3).

### Issue 2: "Unknown database 'pulsepoint'"

**Solution**: The database doesn't exist. Either create it or use the correct database name (`pulsepoint_prod`).

### Issue 3: Table 'apikey' doesn't exist

**Solution**: Run the database migration commands above.

### Issue 4: API key exists but still shows "Invalid"

**Solution**: The API key might have been generated on local database. Generate a new one after fixing database connection.

## Quick Fix Command (If Using Option 1)

```bash
# SSH into Ubuntu VPS
cd /path/to/your/backend

# Edit start.py
nano start.py

# Find line 41-42 and swap the comments:
# FROM:
#   app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:''@localhost:3306/pulsepoint'
#   #app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://node:Corn6-dish@localhost:3306/pulsepoint_prod'
# TO:
#   #app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:''@localhost:3306/pulsepoint'
#   app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://node:Corn6-dish@localhost:3306/pulsepoint_prod'

# Save (Ctrl+X, Y, Enter)

# Restart backend
sudo systemctl restart your-backend-service
# or
pm2 restart your-app
# or kill and restart python process

# Generate new API key from admin panel
```

## Security Note

⚠️ **Important**: The commented line shows credentials in the code:
```python
'mysql+pymysql://node:Corn6-dish@localhost:3306/pulsepoint_prod'
```

For security:
1. **Use environment variables** (Option 3) instead of hardcoding credentials
2. **Don't commit passwords to Git**
3. Add `.env` to `.gitignore`
4. Use strong, unique passwords for production

## Summary

The "Invalid API key" error happens because:
1. Your Ubuntu server connects to a different database than your local machine
2. The API key generated locally doesn't exist in Ubuntu's database
3. The database connection is hardcoded in `start.py` line 41

**Quick Fix**: Uncomment line 42 in `start.py` on your Ubuntu VPS and restart the backend server, then generate a new API key from the admin panel.

**Proper Fix**: Implement Option 3 (environment variables) for better security and flexibility.
