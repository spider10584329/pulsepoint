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
- ✅ Project (Software) management API
- ✅ Applied projects (Subscriptions) management
- ✅ File upload and download for project images
- ✅ CORS support for frontend integration

### Frontend (Next.js)
- ✅ Modern React with TypeScript
- ✅ Responsive design with Tailwind CSS
- ✅ Authentication context and state management
- ✅ Protected routes and middleware
- ✅ Beautiful login and registration forms
- ✅ Dashboard with user data display
- ✅ Profile management interface
- ✅ **Software subscription marketplace with e-commerce design**
- ✅ **Project management for administrators**
- ✅ **Free 7-day trial support**
- ✅ **Monthly and annual subscription plans**
- ✅ **User subscription dashboard**

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

### Project Management (Admin)
- `POST /api/project/create` - Create new project/software
- `GET /api/project/read` - Get all projects
- `PUT /api/project/update` - Update project details
- `DELETE /api/project/delete` - Delete project
- `GET /project/download` - Download project image file

### Subscription Management
- `POST /api/apply/project` - Apply for software subscription
- `GET /api/apply/project/all` - Get all applied projects (admin)
- `GET /api/apply/project/read` - Get user's subscriptions
- `PUT /api/apply/project/update` - Update subscription status
- `DELETE /api/apply/project/delete` - Delete subscription

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

## Software Subscription System

### Overview
The platform includes a sophisticated e-commerce-style software subscription system where users can browse, trial, and subscribe to software applications.

### Key Features

#### For Users
1. **Software Marketplace** (`/user/software`)
   - Professional e-commerce card-based layout
   - Search functionality across all software
   - Detailed project information with images
   - Clear pricing display (monthly and annual plans)
   - 7-day free trial badge on all software

2. **Software Detail Modal**
   - Left side: Software image and website links
   - Right side: Description, pricing plans, and features
   - Three subscription options:
     - **Free Trial**: 7 days, no credit card required
     - **Monthly Plan**: Billed monthly
     - **Annual Plan**: Billed annually (17% savings)
   - One-click subscription process

3. **User Dashboard** (`/user`)
   - Statistics overview (total, active, trials, expired)
   - Visual subscription cards with status badges
   - Quick access to subscription management
   - Browse software button for easy discovery

4. **Subscription Management**
   - View all subscribed software
   - Status indicators (Trial, Active, Expired)
   - Subscription dates and plan types
   - Manage subscription options

#### For Administrators
1. **Project Management** (`/admin/software`)
   - Create new software projects
   - Upload promotional images
   - Set pricing (monthly and annual)
   - Edit existing projects
   - Delete projects (with applicant verification)
   - Visual project list with images

2. **Subscription Oversight**
   - View all user subscriptions
   - Approve/reject trial requests
   - Monitor subscription status
   - Manage subscription periods

### Database Schema Integration

#### Projects Table
- `id`: Project identifier
- `name`: Software name
- `description`: Software description
- `website_link`: Official website URL
- `price`: Annual subscription price
- `mprice`: Monthly subscription price
- `filename`: Promotional image filename

#### AppliedProjects Table
- `id`: Subscription identifier
- `user_id`: Foreign key to users table
- `project_id`: Foreign key to projects table
- `apply_date`: Initial application date
- `is_apply`: Status (0 = trial, 1 = paid subscription)
- `purchase_date`: Date of paid subscription
- `periodicity`: Subscription period (1 = monthly, 12 = annual)
- `user_count`: Number of licenses

### Subscription Workflow

1. **Discovery Phase**
   - User browses software marketplace
   - Searches for specific software
   - Views detailed information

2. **Selection Phase**
   - User clicks "View Details" on software card
   - Modal opens with comprehensive information
   - User selects subscription type (trial/monthly/annual)

3. **Subscription Process**
   - User clicks subscription button
   - Backend validates and creates subscription record
   - Success notification displayed
   - User redirected to dashboard

4. **Trial Period**
   - 7-day free trial automatically applied
   - Trial countdown displayed on dashboard
   - User can upgrade to paid plan anytime
   - Trial expires after 7 days

5. **Paid Subscription**
   - Monthly: Renews every 30 days
   - Annual: Renews every 12 months
   - Status tracking and expiration alerts
   - Manage from user dashboard

### UI/UX Design Principles

- **E-commerce Aesthetic**: Professional card-based layouts with hover effects
- **Visual Hierarchy**: Clear pricing tiers with visual differentiation
- **Trust Signals**: Free trial badges, secure payment indicators
- **Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **Modern Styling**: Gradient backgrounds, rounded corners, shadow effects
- **Intuitive Navigation**: Clear call-to-action buttons, breadcrumb trails
- **Status Communication**: Color-coded badges for subscription states

### File Upload System

- Software images stored in `backend/uploads/` directory
- Images served via `/project/download` endpoint
- Automatic fallback to default SVG icon if image fails
- Support for various image formats (PNG, JPG, etc.)

## Next Steps

1. **Install Dependencies**: Run the setup commands for both backend and frontend
2. **Database Setup**: Ensure your MySQL database matches the expected schema
3. **Test Authentication**: Register a new user and test the login flow
4. **Add Software Projects**: Login as admin and create software projects
5. **Test Subscriptions**: Login as user and subscribe to software
6. **Customize**: Update styling and add additional features as needed

## Navigation Flow

- **Home Page** (`/`): Landing page with login/register options for unauthenticated users, dashboard access for authenticated users
- **Login Cancellation**: All authentication failures and logout actions redirect to `/` (home page)
- **Protected Routes**: Unauthorized access to dashboard redirects to `/` instead of login page
- **User Software Page** (`/user/software`): E-commerce marketplace for browsing and subscribing to software
- **Admin Software Page** (`/admin/software`): Project management interface for creating and managing software offerings

The system is now ready for development and testing with your existing database structure!
