# Email Verification Status Update

## Change Made

Updated the `verify_account` method in `backend/models/user.py` to set both `isVerify = 1` and `status = 1` when a user successfully completes email verification.

## Before Change

```python
def verify_account(cls, id):
    try:
        record = cls.query.get(id)
        record.isVerify = 1  # Only set verification flag
        db.session.commit()
    except:
        return {'message': 'error'}
```

## After Change

```python
def verify_account(cls, id):
    try:
        record = cls.query.get(id)
        record.isVerify = 1
        record.status = 1  # Set status to 1 when account is verified
        db.session.commit()
    except:
        return {'message': 'error'}
```

## Field Meanings

### isVerify Field
- `0` (default) - Email not verified
- `1` - Email verified

### status Field  
- `0` (default) - Account inactive/pending
- `1` - Account active and can be used

## Impact

Now when a user completes email verification:
1. ✅ **isVerify** is set to 1 (email verified)
2. ✅ **status** is set to 1 (account activated)

This ensures that verified users have both verification status and active account status properly set in the database.

## Frontend Flow

1. User registers → `status: 0, isVerify: 0`
2. User receives verification email
3. User enters verification code on `/verify` page
4. Backend calls `UserModel.verify_account(user_id)`
5. Database updated → `status: 1, isVerify: 1`
6. User can now fully use the system

## Files Modified

- `backend/models/user.py` - Updated `verify_account` method

## Testing

To test this change:
1. Register a new user account
2. Complete the email verification process
3. Check the database: `SELECT id, email, status, isVerify FROM users WHERE id = [user_id];`
4. Verify both `status` and `isVerify` are set to 1

## Database Query to Check

```sql
-- Check user status after verification
SELECT id, email, firstname, lastname, status, isVerify, role
FROM users 
WHERE email = 'test@example.com';
```

Expected result after verification:
- `status = 1`
- `isVerify = 1`
- Account fully activated
