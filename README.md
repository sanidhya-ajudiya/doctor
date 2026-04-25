# Doctor Appointment System

A full-stack Doctor Appointment System built with React JS (frontend), Express JS + Node JS (backend), and MySQL (database)

## Features

### Patient (User) Features
- User registration & login with JWT authentication
- View list of doctors with details (name, specialization, experience, fees)
- Search & filter doctors by name or specialization
- Book appointments with date & time slot selection
- View upcoming and past appointments
- Cancel appointments
- Profile management

### Doctor Features
- Doctor login and profile management
- View appointment requests
- Accept or reject appointments
- Update profile (specialization, fees, experience, about)
- Manage availability schedule

### Admin Features
- Admin dashboard with analytics
- Add, edit, and delete doctors
- View all users and appointments
- Manage system data
- Analytics dashboard (total users, doctors, appointments)

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios
- Tailwind CSS
- Lucide React (icons)
- React Hot Toast (notifications)

### Backend
- Node.js
- Express.js
- MySQL2
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- CORS
- express-validator (input validation)

## Prerequisites

- Node.js (v18 or higher)
- MySQL Server
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd doctor
```

### 2. Set up the Backend

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

Create a `.env` file in the server directory with the following content:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=doctor_appointment
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

Set up the MySQL database:

1. Open your MySQL client (phpMyAdmin, MySQL Workbench, or command line)
2. Run the SQL script from `server/schema.sql` to create the database and tables
3. Or run it manually:

```sql
CREATE DATABASE IF NOT EXISTS doctor_appointment;
USE doctor_appointment;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'doctor', 'admin') DEFAULT 'user',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  experience INT NOT NULL,
  fees DECIMAL(10, 2) NOT NULL,
  available_slots JSON,
  about TEXT,
  education TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  doctor_id INT NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_appointment (doctor_id, date, time)
);
```

Insert default admin user (password: admin123):

```sql
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@doctor.com', '$2a$10$rKvZ/xZ7Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'admin');
```

**Note:** The default admin password hash above is a placeholder. You should generate a proper bcrypt hash for your admin password. Use a tool like https://bcrypt-generator.com/ or run this Node.js code:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
```

Start the backend server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Set up the Frontend

Navigate to the client directory:

```bash
cd ../client
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is occupied)

## Usage

### Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. You'll see the home page with information about the platform

### Demo Credentials

**Admin:**
- Email: admin@doctor.com
- Password: admin123

**User:**
- Register a new account from the registration page

**Doctor:**
- Register a new account with role "doctor" from the registration page
- Or have an admin add a doctor from the admin dashboard

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

#### Doctors
- `GET /api/doctors` - Get all doctors (with optional search/filter)
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/doctors` - Add new doctor (admin only)
- `PUT /api/doctors/:id` - Update doctor profile (doctor/admin)
- `DELETE /api/doctors/:id` - Delete doctor (admin only)

#### Appointments
- `POST /api/appointments` - Book appointment (user only)
- `GET /api/appointments/my-appointments` - Get user appointments (user only)
- `GET /api/appointments/doctor-appointments` - Get doctor appointments (doctor only)
- `GET /api/appointments/all` - Get all appointments (admin only)
- `PUT /api/appointments/:id/status` - Update appointment status (doctor only)
- `PUT /api/appointments/:id/cancel` - Cancel appointment (user only)

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/all` - Get all users (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/analytics` - Get analytics (admin only)

## Project Structure

```
doctor/
├── server/
│   ├── config/
│   │   └── database.js          # MySQL connection configuration
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── doctors.js           # Doctor management routes
│   │   ├── appointments.js      # Appointment routes
│   │   └── users.js             # User management routes
│   ├── .env                     # Environment variables
│   ├── schema.sql               # Database schema
│   ├── server.js                # Main server file
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Home page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   ├── Doctors.jsx      # Doctor listing page
│   │   │   ├── BookAppointment.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── utils/
│   │   │   └── api.js           # Axios configuration
│   │   ├── App.jsx              # Main app with routing
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Tailwind CSS imports
│   ├── tailwind.config.js       # Tailwind configuration
│   └── package.json
└── README.md
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (RBAC)
- Input validation with express-validator
- CORS enabled
- SQL injection prevention (parameterized queries)

## Future Enhancements

- Email notifications for appointments
- Prescription management
- Medical records system
- Payment gateway integration
- Real-time chat with doctors
- Video consultation feature
- Rating and review system
- Multi-language support

## Troubleshooting

### Database Connection Issues
- Ensure MySQL server is running
- Check your `.env` file credentials
- Verify the database name matches in MySQL

### CORS Errors
- Ensure the backend CORS is configured correctly
- Check that the frontend URL is allowed

### Port Already in Use
- Change the PORT in server `.env` file
- Or stop the process using the port

## License

This project is for educational purposes.

## Support

For issues or questions, please open an issue in the repository.
