# Sub Admin API with Voter Assignment System

## Overview
The Sub Admin API provides a comprehensive system for managing sub administrators with voter assignment functionality. Sub admins can only view and manage voters assigned to them by the main admin.

## Models

### SubAdmin Model
- `fullName` - Full name of sub admin
- `userId` - Unique user ID for login
- `password` - Hashed password
- `locationName` - Location/area name
- `locationImage` - Optional location image URL
- `assignedVoters` - Array of assigned voters
- `isActive` - Account status
- `lastLogin` - Last login timestamp

### VoterAssignment Model
- `subAdminId` - Reference to SubAdmin
- `voterId` - Reference to Voter/VoterFour
- `voterType` - 'Voter' or 'VoterFour'
- `assignedBy` - Reference to Admin who assigned
- `assignedAt` - Assignment timestamp
- `isActive` - Assignment status
- `notes` - Optional assignment notes

## API Endpoints

### Sub Admin Management

#### 1. Sub Admin Login
```bash
POST /api/subadmin/login
Content-Type: application/json

{
  "userId": "subadmin1",
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
    "subAdmin": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fullName": "John Doe",
      "userId": "subadmin1",
      "locationName": "District A",
      "locationImage": "https://example.com/image.jpg",
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### 2. Get All Sub Admins
```bash
GET /api/subadmin?page=1&limit=10&locationName=District&sortBy=fullName&sortOrder=asc
```

#### 3. Create Sub Admin
```bash
POST /api/subadmin
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "userId": "subadmin2",
  "password": "password123",
  "locationName": "District B",
  "locationImage": "https://example.com/image2.jpg"
}
```

#### 4. Update Sub Admin
```bash
PUT /api/subadmin/:id
Content-Type: application/json

{
  "fullName": "Jane Smith Updated",
  "locationName": "District B Updated",
  "isActive": true
}
```

#### 5. Delete Sub Admin
```bash
DELETE /api/subadmin/:id
```

### Voter Assignment (Admin Only)

#### 1. Assign Voters to Sub Admin
```bash
POST /api/assignment/assign
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "voterIds": ["64f8a1b2c3d4e5f6a7b8c9d1", "64f8a1b2c3d4e5f6a7b8c9d2"],
  "voterType": "Voter",
  "notes": "Assigned for campaign work"
}
```

#### 2. Unassign Voters from Sub Admin
```bash
DELETE /api/assignment/unassign
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "voterIds": ["64f8a1b2c3d4e5f6a7b8c9d1"],
  "voterType": "Voter"
}
```

#### 3. Get Sub Admin Assignments
```bash
GET /api/assignment/subadmin/:id?page=1&limit=10&voterType=Voter
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### 4. Get Assignment Statistics
```bash
GET /api/assignment/stats
Authorization: Bearer ADMIN_JWT_TOKEN
```

### Sub Admin Voter Management (Sub Admin Only)

#### 1. Get Assigned Voters
```bash
GET /api/subadmin/voters?page=1&limit=10&voterType=Voter&isPaid=true&sortBy=assignedAt&sortOrder=desc
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

#### 2. Get Specific Assigned Voter
```bash
GET /api/subadmin/voters/:voterId/:voterType
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

#### 3. Update Assigned Voter
```bash
PUT /api/subadmin/voters/:voterId/:voterType
Authorization: Bearer SUBADMIN_JWT_TOKEN
Content-Type: application/json

{
  "Voter Name Eng": "Updated Name",
  "Age": 35,
  "isPaid": true,
  "isVisited": false
}
```

#### 4. Update Payment Status
```bash
PATCH /api/subadmin/voters/:voterId/:voterType/paid
Authorization: Bearer SUBADMIN_JWT_TOKEN
Content-Type: application/json

{
  "isPaid": true
}
```

#### 5. Update Visit Status
```bash
PATCH /api/subadmin/voters/:voterId/:voterType/visited
Authorization: Bearer SUBADMIN_JWT_TOKEN
Content-Type: application/json

{
  "isVisited": true
}
```

#### 6. Update Both Statuses
```bash
PATCH /api/subadmin/voters/:voterId/:voterType/status
Authorization: Bearer SUBADMIN_JWT_TOKEN
Content-Type: application/json

{
  "isPaid": true,
  "isVisited": true
}
```

#### 7. Get Assigned Voters Statistics
```bash
GET /api/subadmin/voters/stats
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

## Authentication

### Sub Admin Authentication
Sub admins use `userId` and `password` for login, receiving a JWT token for subsequent requests.

### Token Usage
Include the JWT token in the Authorization header:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Security Features

### Access Control
- Sub admins can only access voters assigned to them
- Admin-only endpoints require admin authentication
- Sub admin endpoints require sub admin authentication
- Voter access is checked for each request

### Data Isolation
- Sub admins only see their assigned voters
- Assignment tracking prevents unauthorized access
- Soft deletion maintains data integrity

## Example Workflow

### 1. Admin Creates Sub Admin
```bash
POST /api/subadmin
{
  "fullName": "John Doe",
  "userId": "subadmin1",
  "password": "password123",
  "locationName": "District A"
}
```

### 2. Admin Assigns Voters
```bash
POST /api/assignment/assign
Authorization: Bearer ADMIN_TOKEN
{
  "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "voterIds": ["64f8a1b2c3d4e5f6a7b8c9d1", "64f8a1b2c3d4e5f6a7b8c9d2"],
  "voterType": "Voter"
}
```

### 3. Sub Admin Logs In
```bash
POST /api/subadmin/login
{
  "userId": "subadmin1",
  "password": "password123"
}
```

### 4. Sub Admin Views Assigned Voters
```bash
GET /api/subadmin/voters
Authorization: Bearer SUBADMIN_TOKEN
```

### 5. Sub Admin Updates Voter Status
```bash
PATCH /api/subadmin/voters/64f8a1b2c3d4e5f6a7b8c9d1/Voter/paid
Authorization: Bearer SUBADMIN_TOKEN
{
  "isPaid": true
}
```

## Query Parameters

### Sub Admin List
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `isActive` - Filter by active status
- `locationName` - Filter by location
- `sortBy` - Sort field (default: 'fullName')
- `sortOrder` - Sort order (asc/desc, default: asc)

### Assigned Voters
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `voterType` - Filter by voter type (Voter/VoterFour)
- `isPaid` - Filter by payment status
- `isVisited` - Filter by visit status
- `sortBy` - Sort field (default: 'assignedAt')
- `sortOrder` - Sort order (asc/desc, default: desc)

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 200,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

## Use Cases

1. **Campaign Management**: Assign specific voters to field workers
2. **Territory Management**: Organize voters by location/area
3. **Access Control**: Ensure data privacy and security
4. **Progress Tracking**: Monitor voter engagement by sub admin
5. **Reporting**: Generate statistics and reports
6. **Scalability**: Manage large voter databases efficiently

## Error Handling

- **400 Bad Request**: Invalid data or validation errors
- **401 Unauthorized**: Invalid credentials or expired token
- **403 Forbidden**: Access denied (voter not assigned)
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate assignment or user ID
- **500 Internal Server Error**: Database or server errors
