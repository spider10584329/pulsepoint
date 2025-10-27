# PulsePoint Authentication System

A complete user authentication system built with Next.js (Frontend) and Python Flask (Backend), designed to work with the MySQL database schema shown in your project.

## Project Structure

```
project/
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── routes/
│       ├── __init__.py
│       ├── auth.py        # Authentication routes
│       └── user.py        # User management routes
└── frontend/              # Next.js React application
    ├── app/               # App Router structure
    ├── components/        # Reusable components
    ├── lib/              # Utilities and context
    ├── package.json      # Node dependencies
    └── .env.local        # Environment variables
```

## Database Schema

The system utilizes the following MySQL tables:

- **users**: Main user authentication and profile data
- **devices**: Device management
- **projects**: Project tracking
- **hardwares**: Hardware inventory
- **appliedprojects**: Project applications
- **appliedhardwares**: Hardware applications

## Features

### Backend (Flask API)
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Token verification and refresh
- ✅ Profile management
- ✅ Admin functionality
- ✅ CORS support for frontend integration

### Frontend (Next.js)
- ✅ Modern React with TypeScript
- ✅ Responsive design with Tailwind CSS
- ✅ Authentication context and state management
- ✅ Protected routes and middleware
- ✅ Beautiful login and registration forms
- ✅ Dashboard with user data display
- ✅ Profile management interface

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- MySQL database running locally
- Database named `pulsepoint` (or update in .env files)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   - Update `.env` file with your MySQL credentials
   - Default: `root` user with no password on `localhost`

5. **Run the server:**
   ```bash
   python app.py
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Update `.env.local` if your backend runs on a different URL

4. **Run development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/users` - Get all users (admin only)
- `PUT /api/user/users/:id/status` - Update user status (admin only)

## Authentication Flow

1. **Registration**: Users fill out comprehensive registration form
2. **Validation**: Server validates email format, password strength, required fields
3. **Storage**: Password is hashed and user data stored in MySQL
4. **Login**: Email/password authentication with JWT token generation
5. **Authorization**: JWT tokens included in API requests for protected routes
6. **Session Management**: Token verification for protected pages and API calls

## Database Integration

The system integrates with your existing MySQL schema:

- Uses the `users` table for authentication
- Supports all user fields: company, hotelname, firstname, lastname, etc.
- Role-based access control using the `role` field
- User status management with the `status` field

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Input validation and sanitization
- SQL injection protection
- CORS configuration
- Protected routes and API endpoints

## Customization

### Adding New Fields
1. Update the registration form in `frontend/app/auth/register/page.tsx`
2. Add validation in `backend/routes/auth.py`
3. Ensure database table has the corresponding columns

### Styling
- Uses Tailwind CSS for easy customization
- Update `tailwind.config.js` for brand colors
- Modify `globals.css` for custom styles

### Database Connection
- Update `backend/.env` for different database credentials
- Modify `DB_CONFIG` in route files if needed

## Production Deployment

### Backend
- Set `FLASK_ENV=production` in environment
- Use a proper WSGI server like Gunicorn
- Configure proper JWT secret key
- Set up SSL/HTTPS

### Frontend
- Run `npm run build` for production build
- Deploy to Vercel, Netlify, or similar platform
- Update API URL in environment variables

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL is running
   - Verify credentials in `.env` files
   - Ensure database `pulsepoint` exists

2. **JWT Token Errors**
   - Check JWT_SECRET_KEY in backend `.env`
   - Verify token storage in browser localStorage

3. **CORS Errors**
   - Verify FLASK_CORS configuration
   - Check API URL in frontend environment

4. **Import Errors**
   - Install all dependencies with pip/npm
   - Check Python virtual environment is activated

## Next Steps

1. **Install Dependencies**: Run the setup commands for both backend and frontend
2. **Database Setup**: Ensure your MySQL database matches the expected schema
3. **Test Authentication**: Register a new user and test the login flow
4. **Customize**: Update styling and add additional features as needed

## Navigation Flow

- **Home Page** (`/`): Landing page with login/register options for unauthenticated users, dashboard access for authenticated users
- **Login Cancellation**: All authentication failures and logout actions redirect to `/` (home page)
- **Protected Routes**: Unauthorized access to dashboard redirects to `/` instead of login page

The system is now ready for development and testing with your existing database structure!
