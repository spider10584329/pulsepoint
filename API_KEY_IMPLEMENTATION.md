# API Key Generation Implementation

## Overview
This implementation allows generating UUID-based API keys that are stored in the database and used to retrieve subscription data.

## Database Schema

### `apikey` Table (Existing)
```sql
CREATE TABLE apikey (
    id INT PRIMARY KEY AUTO_INCREMENT,
    apikey VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Note**: The table already exists in the database with this structure. No migration needed.

## API Endpoints

### 1. Generate API Key
**Endpoint**: `POST /api/apikey/generate`  
**Authentication**: JWT Required (Bearer token)

**Request**:
No body required. Simply call the endpoint with JWT token.

**Response** (200 OK):
```json
{
  "status": 1,
  "apiKey": "fa6d8695-32fd-42c4-a25a-7f87a027552d",
  "apiUrl": "/api/pulsepoint/subscription?apikey=fa6d8695-32fd-42c4-a25a-7f87a027552d"
}
```

**Behavior**:
- Generates a random UUID value
- Checks if a record exists in the `apikey` table
- If exists: Updates the existing record with the new UUID
- If not exists: Creates a new record
- Returns the generated API key and complete URL

### 2. Get Subscription Data
**Endpoint**: `GET /api/pulsepoint/subscription?apikey={UUID}`  
**Authentication**: None (uses API key)

**Request**:
```
GET /api/pulsepoint/subscription?apikey=fa6d8695-32fd-42c4-a25a-7f87a027552d
```

**Response** (200 OK):
```json
[
  {
    "userID": "spider.etc.01@gmail.com",
    "softwareID": 16,
    "softwareName": "scanandgo",
    "purchaseDate": "2025-10-20",
    "period": 1,
    "paymentPrice": 240.0,
    "expirationDate": "2025-11-20"
  },
  {
    "userID": "another.user@example.com",
    "softwareID": 5,
    "softwareName": "inventory-system",
    "purchaseDate": "2025-09-15",
    "period": 12,
    "paymentPrice": 1200.0,
    "expirationDate": "2026-09-15"
  }
]
```

**Behavior**:
- Validates the API key against the `apikey` table
- If valid: Returns all approved subscriptions (where `is_apply = 1`)
- If invalid: Returns 401 error
- Data includes:
  - User email
  - Software ID and name
  - Purchase date
  - Subscription period (in months)
  - Monthly payment price
  - Calculated expiration date

## Frontend Usage

The frontend page at `/admin/apikey` allows admins to:
1. Click "Generate Key" button (no input required)
2. View the generated API key
3. View the complete API URL
4. Copy both values to clipboard
5. Download subscription data as CSV

## Files Modified/Created

### Backend:
- `models/apikey.py` - New model for API key storage
- `resources/project.py` - Added GenerateAPIKey and GetSubscriptionData resources
- `routes/project.py` - Added routes for both endpoints
- `requirements.txt` - Added python-dateutil dependency
- `create_apikey_table.py` - Migration script

### Frontend:
- `app/admin/apikey/page.tsx` - Updated to call backend API

## Security Notes

1. The `/api/apikey/generate` endpoint requires JWT authentication (admin only)
2. The `/api/pulsepoint/subscription` endpoint is public but requires valid API key
3. API keys are UUIDs (universally unique identifiers)
4. Only one active API key can exist at a time (each new generation updates the existing record)
5. Old API keys are automatically replaced when new ones are generated
