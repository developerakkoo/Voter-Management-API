# Admin API with JWT Authentication

## Overview
The Admin API now includes JWT-based authentication with login functionality.

## Endpoints

### 1. Admin Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "email": "admin@example.com",
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 2. Using Authentication Token
For protected routes, include the JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Protected Endpoints
- `PUT /api/admin/:id` - Update admin (requires authentication)
- `DELETE /api/admin/:id` - Delete admin (requires authentication)
- `DELETE /api/admin` - Delete all admins (requires authentication)

### 4. Public Endpoints
- `POST /api/admin/login` - Login
- `GET /api/admin` - Get all admins
- `GET /api/admin/:id` - Get admin by ID
- `POST /api/admin` - Create admin

## Example Usage

### Step 1: Create an Admin
```bash
curl -X POST http://localhost:3000/api/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Step 2: Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Step 3: Use Token for Protected Operations
```bash
curl -X PUT http://localhost:3000/api/admin/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "isActive": false
  }'
```

## Environment Variables
Add to your `.env` file:
```
JWT_SECRET=your-super-secret-jwt-key-here
```

## Token Expiration
- JWT tokens expire after 24 hours
- After expiration, users need to login again
- The `lastLogin` field is updated on each successful login

## Security Features
- Passwords are hashed using bcryptjs
- JWT tokens are signed with a secret key
- Admin accounts can be deactivated
- Token validation includes checking if admin is still active
