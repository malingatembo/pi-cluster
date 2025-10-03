# Shuma Booking System - Complete Guide

## 🎉 What's Been Built

You now have a **full-stack booking management system** consisting of:

### 1. **PostgreSQL Database** ✅
- Stores all booking data persistently
- 3 tables: `bookings`, `admin_users`, `audit_log`
- 5GB persistent storage
- Automatic initialization with schema

### 2. **Node.js Backend API** ✅
- RESTful API for booking management
- JWT authentication for admin access
- Input validation and sanitization
- Rate limiting (5 bookings/hour per IP)
- CORS enabled for frontend access

### 3. **Admin Panel** ✅
- Beautiful web interface to view/manage bookings
- Secure login with JWT tokens
- Real-time statistics dashboard
- Filter by status and date
- Confirm, complete, or cancel bookings

### 4. **Updated Website** ✅
- Form now submits to backend API
- Bookings saved to database
- Loading states and error handling
- Graceful fallback if API is down

---

## 🌐 Access Points

**All services accessible via Traefik LoadBalancer on port 80**

### Customer Website
```
URL: http://10.0.0.100/shuma
Purpose: Public booking form (Czech localized)
Status: ✅ Fully functional
```

### Admin Panel
```
URL: http://10.0.0.100/admin-panel
Username: admin
Password: admin123
Purpose: View and manage bookings
Status: ✅ Fully functional
```

### Backend API
```
Base URL: http://10.0.0.100/booking-api
Health Check: http://10.0.0.100/booking-api/api/health
Purpose: RESTful API for bookings
Status: ✅ Running (2 replicas)
```

**Note:** NodePort services (30080, 30085, 30086) are not accessible due to k3s cluster configuration. All access is via Traefik ingress routes.

---

## 📊 Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    service VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, confirmed, cancelled, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

###Admin Users Table
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Audit Log Table
```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    admin_user VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Public Endpoints

#### Create Booking
```bash
POST /api/bookings
Content-Type: application/json

{
  "name": "Jan Novák",
  "email": "jan@example.com",
  "phone": "+420 123 456 789",
  "service": "deep-tissue",
  "duration": 90,
  "preferred_date": "2025-10-10",
  "preferred_time": "14:00",
  "message": "Optional message"
}
```

#### Health Check
```bash
GET /api/health

Response: {
  "status": "healthy",
  "timestamp": "2025-10-03T...",
  "service": "shuma-booking-api"
}
```

### Admin Endpoints (Require JWT Token)

#### Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@shumaspa.cz"
  }
}
```

#### Get All Bookings
```bash
GET /api/admin/bookings?status=pending&limit=50&offset=0
Authorization: Bearer <token>

Response: {
  "success": true,
  "bookings": [ ... ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

#### Update Booking Status
```bash
PATCH /api/admin/bookings/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"  // pending, confirmed, cancelled, completed
}
```

#### Get Statistics
```bash
GET /api/admin/stats
Authorization: Bearer <token>

Response: {
  "success": true,
  "stats": {
    "total_bookings": 25,
    "pending": 10,
    "confirmed": 8,
    "completed": 5,
    "cancelled": 2,
    "last_7_days": 12,
    "last_30_days": 25
  }
}
```

---

## 🛠️ How to Use the Admin Panel

### 1. Login
1. Go to `http://10.0.0.100:30086`
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Login"

### 2. View Dashboard
- See total bookings, pending, confirmed, and recent statistics
- Auto-refreshes every 30 seconds

### 3. Filter Bookings
- Use dropdowns to filter by status or date
- Click "Refresh" to reload data

### 4. Manage Bookings
- Click "Confirm" to confirm a pending booking
- Click "Complete" to mark a booking as done
- Click "Cancel" to cancel a booking

### 5. View Details
- Each booking shows:
  - Customer name, email, phone
  - Service type and duration
  - Preferred date and time
  - Current status

---

## 🔐 Security Features

### Backend
- **JWT Authentication**: 8-hour token expiration
- **Rate Limiting**: 100 requests/15min general, 5 bookings/hour
- **Input Validation**: express-validator for all inputs
- **SQL Injection Protection**: Parameterized queries
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Enabled for frontend access
- **Helmet.js**: Security headers

### Network
- **Network Policies**: Pod-to-pod communication restricted
- **Database Isolation**: Only backend can access PostgreSQL
- **Public API**: Backend accepts bookings from anywhere
- **Admin Panel**: JWT-protected endpoints

---

## 📝 How to View Bookings

### Method 1: Admin Panel (Recommended)
```
1. Open http://10.0.0.100:30086
2. Login with admin/admin123
3. View all bookings in table format
4. Filter, sort, and manage bookings
```

### Method 2: Database Direct Query
```bash
# Connect to database pod
kubectl exec -it -n shuma-website shuma-postgres-<pod-id> -- psql -U shuma_admin -d shuma_bookings

# View all bookings
SELECT * FROM bookings ORDER BY created_at DESC;

# View pending bookings
SELECT * FROM bookings WHERE status = 'pending';

# View bookings for specific date
SELECT * FROM bookings WHERE preferred_date = '2025-10-10';
```

### Method 3: API Query
```bash
# Get auth token
TOKEN=$(curl -s -X POST http://10.0.0.100:30085/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

# Get bookings
curl -H "Authorization: Bearer $TOKEN" \
  http://10.0.0.100:30085/api/admin/bookings | jq .
```

---

## 🎯 Testing the System

### Test Booking Submission

1. **Via Website Form**:
   - Go to `http://10.0.0.100:30080`
   - Scroll to "Book Your Session" section
   - Fill out the form
   - Click "Confirm Booking"
   - Should see success message

2. **Via API**:
```bash
curl -X POST http://10.0.0.100:30085/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+420 123 456 789",
    "service": "swedish",
    "duration": 60,
    "preferred_date": "2025-10-15",
    "preferred_time": "15:00",
    "message": "Test booking"
  }'
```

3. **Verify in Admin Panel**:
   - Login to admin panel
   - Should see new booking in "Pending" status
   - Click "Confirm" to change status

---

## 🔧 Management Commands

### View All Pods
```bash
kubectl get pods -n shuma-website
```

### Check Backend Logs
```bash
kubectl logs -n shuma-website -l app=shuma-backend --tail=50
```

### Check Database Logs
```bash
kubectl logs -n shuma-website -l app=shuma-postgres --tail=50
```

### Scale Backend
```bash
kubectl scale deployment shuma-backend --replicas=2 -n shuma-website
```

### Create New Admin User
```bash
# Connect to database
kubectl exec -it -n shuma-website shuma-postgres-<pod-id> -- psql -U shuma_admin -d shuma_bookings

# Insert new admin (password will need to be hashed with bcrypt)
INSERT INTO admin_users (username, password_hash, email)
VALUES ('newadmin', '$2a$10$hash...', 'newadmin@shumaspa.cz');
```

### Backup Database
```bash
# Dump all bookings
kubectl exec -n shuma-website shuma-postgres-<pod-id> -- \
  pg_dump -U shuma_admin -d shuma_bookings -t bookings > bookings-backup.sql

# Restore from backup
kubectl exec -i -n shuma-website shuma-postgres-<pod-id> -- \
  psql -U shuma_admin -d shuma_bookings < bookings-backup.sql
```

---

## 📊 Monitoring

### Check Service Health
```bash
# Backend health
curl http://10.0.0.100:30085/api/health

# Database connection test
kubectl exec -n shuma-website shuma-postgres-<pod-id> -- \
  pg_isready -U shuma_admin
```

### View Resource Usage
```bash
kubectl top pods -n shuma-website
```

### Check Network Policies
```bash
kubectl get networkpolicy -n shuma-website
kubectl describe networkpolicy shuma-backend-netpol -n shuma-website
```

---

## 🐛 Troubleshooting

### Backend Can't Connect to Database
```bash
# Check network policies
kubectl get networkpolicy -n shuma-website

# Test database from backend pod
kubectl exec -it -n shuma-website shuma-backend-<pod-id> -- \
  nc -zv shuma-postgres 5432
```

### Bookings Not Appearing
```bash
# Check backend logs
kubectl logs -n shuma-website -l app=shuma-backend

# Query database directly
kubectl exec -n shuma-website shuma-postgres-<pod-id> -- \
  psql -U shuma_admin -d shuma_bookings -c "SELECT COUNT(*) FROM bookings;"
```

### Admin Panel Won't Login
```bash
# Check admin users exist
kubectl exec -n shuma-website shuma-postgres-<pod-id> -- \
  psql -U shuma_admin -d shuma_bookings -c "SELECT * FROM admin_users;"

# Check backend is running
kubectl get pods -n shuma-website | grep backend
```

---

## 🚀 Future Enhancements

### Recommended Next Steps
1. **Email Notifications**: Send confirmation emails when bookings are created/confirmed
2. **SMS Notifications**: Text customers booking confirmations
3. **Calendar Integration**: Sync with Google Calendar
4. **Payment Integration**: Accept deposits via Stripe
5. **Customer Portal**: Let customers view/cancel their bookings
6. **Multi-language**: Add English version alongside Czech
7. **Reports**: Generate monthly booking reports
8. **Backup Automation**: Scheduled database backups

---

## 📁 File Structure

```
/home/mtembo/projects/personal/infrastructure/pi-cluster/
├── shuma-database.yaml              # PostgreSQL deployment
├── shuma-backend-deployment.yaml    # Backend API + Admin panel deployment
├── shuma-network-policy.yaml        # Updated network policies
├── shuma-backend/
│   ├── package.json                 # Node.js dependencies
│   ├── server.js                    # Express API server
│   ├── Dockerfile                   # Backend container build
│   ├── admin.html                   # Admin panel UI
│   └── create-admin.js              # Admin user creation script
└── shuma-website/
    └── js/main.js                   # Updated with API integration
```

---

## 🎓 Summary

**What Changed:**
- Website form now **saves bookings to database**
- You can **view all orders** in the admin panel
- You can **manage booking status** (pending → confirmed → completed)
- All data persists even if pods restart
- Secure admin authentication with JWT

**How to View Orders:**
1. Go to http://10.0.0.100:30086
2. Login: admin / admin123
3. See all bookings in real-time!

**Tech Stack:**
- Frontend: HTML/CSS/JavaScript (Czech)
- Backend: Node.js + Express
- Database: PostgreSQL 15
- Auth: JWT + bcrypt
- Platform: Kubernetes (k3s on Raspberry Pi)
