# Software Subscription - Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend server running on `http://localhost:5001`
2. Frontend server running on `http://localhost:3000`
3. MySQL database with `projects` and `appliedprojects` tables
4. At least one admin user (role = 0)
5. At least one regular user (role = 1)

## Test Scenarios

### Scenario 1: Admin Creates Software Project

**Steps:**
1. Login as admin user
2. Navigate to `/admin/software`
3. Fill in the registration form:
   - Software Name: "TestApp Pro"
   - Description: "Professional productivity software"
   - Website: "https://testapp.com"
   - Annual Price: "99"
   - Monthly Price: "9.99"
   - Upload Image: Select a PNG/JPG file
4. Click "Create Project"

**Expected Results:**
- ✓ Success toast appears
- ✓ New software appears in project list
- ✓ Image is displayed correctly
- ✓ Prices are shown in badges

**API Call:**
```http
POST /api/project/create
Content-Type: multipart/form-data

name: TestApp Pro
description: Professional productivity software
website: https://testapp.com
price: 99
mprice: 9.99
file: [binary data]
```

---

### Scenario 2: User Browses Software Marketplace

**Steps:**
1. Login as regular user
2. Navigate to `/user/software`
3. View the software grid

**Expected Results:**
- ✓ All projects displayed in cards
- ✓ Images load or show fallback icon
- ✓ "7-Day Free Trial" badge on each card
- ✓ Prices displayed correctly
- ✓ "View Details" button visible

**API Call:**
```http
GET /api/project/read
Authorization: Bearer {token}
```

---

### Scenario 3: User Views Software Details

**Steps:**
1. From marketplace, click "View Details" on any software
2. Modal opens

**Expected Results:**
- ✓ Modal displays with software information
- ✓ Left side shows image and website link
- ✓ Right side shows description and features
- ✓ Three subscription options visible
- ✓ Free Trial option selected by default
- ✓ Prices match the software data

---

### Scenario 4: User Starts Free Trial

**Steps:**
1. In software detail modal
2. Ensure "Free Trial" is selected (green highlight)
3. Click "Start Free Trial" button
4. Wait for processing

**Expected Results:**
- ✓ Button shows loading state
- ✓ Success toast: "You have successfully started your 7-day free trial"
- ✓ Modal closes automatically
- ✓ Dashboard refreshes

**API Call:**
```http
POST /api/apply/project
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "projectId": 1,
  "applyDate": "2024-10-30",
  "isApply": 0,
  "userCount": 1
}
```

**Database Record:**
```sql
INSERT INTO appliedprojects 
(user_id, project_id, apply_date, is_apply, user_count)
VALUES (1, 1, '2024-10-30', 0, 1);
```

---

### Scenario 5: User Subscribes Monthly

**Steps:**
1. In software detail modal
2. Click "Monthly" option
3. Verify blue highlight on Monthly card
4. Click "Subscribe Monthly" button

**Expected Results:**
- ✓ Monthly option visually selected
- ✓ Button text changes to "Subscribe Monthly"
- ✓ Success toast appears
- ✓ Modal closes
- ✓ Dashboard updates

**API Call:**
```http
POST /api/apply/project
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "projectId": 2,
  "applyDate": "2024-10-30",
  "isApply": 1,
  "purchaseDate": "2024-10-30",
  "periodicity": 1,
  "userCount": 1
}
```

---

### Scenario 6: User Subscribes Annually

**Steps:**
1. In software detail modal
2. Click "Annual" option
3. Verify indigo highlight and "SAVE 17%" badge
4. Click "Subscribe Annually" button

**Expected Results:**
- ✓ Annual option visually selected
- ✓ Save badge visible
- ✓ Button text changes to "Subscribe Annually"
- ✓ Success toast appears
- ✓ Dashboard updates

**API Call:**
```http
POST /api/apply/project
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "projectId": 3,
  "applyDate": "2024-10-30",
  "isApply": 1,
  "purchaseDate": "2024-10-30",
  "periodicity": 12,
  "userCount": 1
}
```

---

### Scenario 7: User Views Dashboard

**Steps:**
1. Navigate to `/user` (dashboard)
2. View statistics and subscriptions

**Expected Results:**
- ✓ Stats show correct counts:
  - Total Subscriptions
  - Active Plans
  - Free Trials
  - Expired
- ✓ Subscription cards displayed in grid
- ✓ Status badges show correct state
- ✓ Dates displayed properly

**API Call:**
```http
GET /api/apply/project/read?id={userId}
Authorization: Bearer {token}
```

---

### Scenario 8: Duplicate Subscription Prevention

**Steps:**
1. Try to subscribe to same software twice
2. Click on software already subscribed
3. Select subscription type
4. Click subscribe button

**Expected Results:**
- ✓ Info toast: "Already Subscribed"
- ✓ Message: "You have already applied for [Software Name]"
- ✓ No duplicate record created
- ✓ Modal remains open

**API Response:**
```json
{
  "status": 0
}
```

---

### Scenario 9: Search Functionality

**Steps:**
1. On `/user/software` page
2. Type search term in search bar
3. Try various searches:
   - By software name
   - By description keywords
   - Non-existent terms

**Expected Results:**
- ✓ Results filter in real-time
- ✓ Matching software displayed
- ✓ Non-matching software hidden
- ✓ Empty state for no results
- ✓ All software shown when search cleared

---

### Scenario 10: Trial Status Badge

**Steps:**
1. Create trial subscription
2. View on dashboard
3. Check status badge

**Expected Results:**
- ✓ Badge shows "Trial - X days left"
- ✓ Yellow background color
- ✓ Days count is accurate
- ✓ After 7 days: "Trial Expired" with red background

**Status Calculation:**
```javascript
// Day 1: "Trial - 7 days left"
// Day 2: "Trial - 6 days left"
// ...
// Day 7: "Trial - 1 day left"
// Day 8+: "Trial Expired"
```

---

### Scenario 11: Active Subscription Badge

**Steps:**
1. Create paid subscription (monthly or annual)
2. View on dashboard
3. Check status badge

**Expected Results:**
- ✓ Badge shows "Monthly Plan" or "Annual Plan"
- ✓ Green background color
- ✓ Status accurate based on periodicity
- ✓ After expiration: "Expired" with red background

---

### Scenario 12: Image Upload and Display

**Steps:**
1. Admin creates project with image
2. User views in marketplace
3. Check image display

**Expected Results:**
- ✓ Image uploads successfully
- ✓ Stored in `backend/uploads/` folder
- ✓ Displays in admin project list
- ✓ Displays in user marketplace
- ✓ Displays in software detail modal
- ✓ Displays in subscription cards
- ✓ Fallback SVG shows if image fails

**Image URL Format:**
```
http://localhost:5001/project/download?filepath=filename.png
```

---

### Scenario 13: Responsive Design

**Steps:**
1. Open software marketplace
2. Resize browser window
3. Test various screen sizes

**Expected Results:**
- ✓ Mobile (< 640px): 1 column grid
- ✓ Tablet (640-1024px): 2 column grid
- ✓ Desktop (> 1024px): 3 column grid
- ✓ Cards resize appropriately
- ✓ Text remains readable
- ✓ Buttons remain clickable
- ✓ Modal adapts to screen size

---

### Scenario 14: Error Handling

**Steps:**
1. Test with expired token
2. Test with network error
3. Test with invalid data

**Expected Results:**
- ✓ Expired token: Redirect to login
- ✓ Network error: Error toast displayed
- ✓ Invalid data: Validation error shown
- ✓ Server error: Generic error message
- ✓ User remains on page (no crash)

---

### Scenario 15: Admin Cannot Delete Subscribed Software

**Steps:**
1. Login as admin
2. Navigate to `/admin/software`
3. Try to delete software with active subscriptions

**Expected Results:**
- ✓ Loading indicator appears
- ✓ Info toast: "Project has Subscribers"
- ✓ Message explains cannot delete
- ✓ Project remains in list
- ✓ No confirmation dialog shown

---

## Database Verification Queries

### Check Projects
```sql
SELECT * FROM projects;
```

**Expected Fields:**
- id, name, description, website_link, price, mprice, filename

### Check Subscriptions
```sql
SELECT * FROM appliedprojects;
```

**Expected Fields:**
- id, user_id, project_id, apply_date, is_apply, purchase_date, periodicity, user_count

### Check Trial Subscriptions
```sql
SELECT * FROM appliedprojects WHERE is_apply = 0;
```

### Check Paid Subscriptions
```sql
SELECT * FROM appliedprojects WHERE is_apply = 1;
```

### Check User's Subscriptions
```sql
SELECT 
  ap.*,
  p.name as project_name,
  u.firstname,
  u.lastname
FROM appliedprojects ap
JOIN projects p ON p.id = ap.project_id
JOIN users u ON u.id = ap.user_id
WHERE ap.user_id = ?;
```

---

## Performance Testing

### Load Testing
- Create 50+ software projects
- Test marketplace rendering
- Verify search performance
- Check pagination if implemented

### Concurrent Users
- Multiple users browse simultaneously
- Multiple subscriptions created at once
- Check for race conditions

---

## Browser Compatibility

Test on:
- ✓ Chrome (latest)
- ✓ Firefox (latest)
- ✓ Safari (latest)
- ✓ Edge (latest)
- ✓ Mobile Chrome
- ✓ Mobile Safari

---

## Accessibility Testing

### Keyboard Navigation
- ✓ Tab through all elements
- ✓ Enter/Space to activate buttons
- ✓ Esc to close modal

### Screen Reader
- ✓ All images have alt text
- ✓ Buttons have descriptive labels
- ✓ Form inputs have labels
- ✓ Status messages announced

---

## Security Testing

### Authentication
- ✓ Cannot access without login
- ✓ Token required for API calls
- ✓ Expired token handled properly

### Authorization
- ✓ Users cannot access admin pages
- ✓ Users can only view their subscriptions
- ✓ Cannot subscribe for other users

### Input Validation
- ✓ SQL injection prevented
- ✓ XSS attacks prevented
- ✓ File upload restrictions enforced

---

## Common Issues and Solutions

### Issue: Images not displaying
**Solution:** 
- Check `backend/uploads/` folder exists
- Verify file permissions
- Check CORS settings
- Verify image file path in database

### Issue: Subscription not created
**Solution:**
- Check JWT token validity
- Verify user ID exists
- Verify project ID exists
- Check database foreign keys

### Issue: Status badge incorrect
**Solution:**
- Verify date format in database
- Check date calculation logic
- Ensure timezone consistency

### Issue: Search not working
**Solution:**
- Check search query implementation
- Verify case-insensitive search
- Check state updates

---

## Test Data Setup

### Sample Admin User
```sql
INSERT INTO users (email, password, role, status, verified)
VALUES ('admin@test.com', '[bcrypt_hash]', 0, 1, 1);
```

### Sample Regular User
```sql
INSERT INTO users (email, password, role, status, verified)
VALUES ('user@test.com', '[bcrypt_hash]', 1, 1, 1);
```

### Sample Software Projects
```sql
INSERT INTO projects (name, description, website_link, price, mprice, filename)
VALUES 
('Project Manager Pro', 'Complete project management solution', 'https://pm-pro.com', '199', '19.99', 'pm.png'),
('Time Tracker Plus', 'Track time and boost productivity', 'https://timetracker.com', '99', '9.99', 'tt.png'),
('Invoice Generator', 'Create professional invoices easily', 'https://invoicegen.com', '149', '14.99', 'ig.png');
```

---

## Regression Testing Checklist

After any code changes, verify:
- [ ] User can browse software
- [ ] User can view details
- [ ] User can subscribe (trial/monthly/annual)
- [ ] Dashboard shows subscriptions
- [ ] Status badges are correct
- [ ] Search works properly
- [ ] Images display correctly
- [ ] Admin can manage projects
- [ ] Duplicate prevention works
- [ ] Responsive design intact
- [ ] No console errors
- [ ] API calls succeed
- [ ] Error handling works

---

**Last Updated:** 2025-10-30  
**Tester:** Use this guide for comprehensive testing of the software subscription system.
