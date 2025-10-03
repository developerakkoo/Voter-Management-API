# User API - Complete Usage Guide

## Overview
The User API provides complete CRUD operations for user management with userId, password, and PNO (3 or 4) fields. Users can register, login, and be managed through various endpoints with search, sort, and filter capabilities.

## User Model Schema

```javascript
{
  userId: String,           // Unique user identifier (required)
  password: String,         // Hashed password (required)
  pno: String,              // PNO value - must be "3" or "4" (required)
  fullName: String,         // User's full name (required)
  email: String,            // Email address (optional)
  phone: String,            // Phone number (optional)
  address: String,          // Address (optional)
  isActive: Boolean,        // Account status (default: true)
  lastLogin: Date,          // Last login timestamp
  loginCount: Number,       // Number of logins
  metadata: Object,         // Additional user data
  createdAt: Date,          // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

## API Endpoints

### 1. Get All Users

```bash
GET /api/user?page=1&limit=20&search=john&pno=3&isActive=true&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)
- `search` (optional): Search in userId, fullName, email, phone, address
- `pno` (optional): Filter by PNO ("3" or "4")
- `isActive` (optional): Filter by active status (true/false)
- `sortBy` (optional): Sort field (default: "createdAt")
- `sortOrder` (optional): Sort direction "asc" or "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "userId": "john_doe",
      "pno": "3",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St, City",
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00.000Z",
      "loginCount": 5,
      "metadata": {},
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  },
  "statistics": {
    "totalUsers": 100,
    "activeUsers": 95,
    "inactiveUsers": 5,
    "pno3Users": 60,
    "pno4Users": 40
  },
  "filters": {
    "search": "john",
    "pno": "3",
    "isActive": "true",
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

### 2. Get User by ID

```bash
GET /api/user/64a1b2c3d4e5f6789012345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "userId": "john_doe",
    "pno": "3",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "loginCount": 5,
    "metadata": {},
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Create New User

```bash
POST /api/user
Content-Type: application/json

{
  "userId": "jane_smith",
  "password": "securePassword123",
  "pno": "4",
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "address": "456 Oak Ave, Town",
  "isActive": true,
  "metadata": {
    "department": "IT",
    "role": "Developer"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "userId": "jane_smith",
    "pno": "4",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1987654321",
    "address": "456 Oak Ave, Town",
    "isActive": true,
    "loginCount": 0,
    "metadata": {
      "department": "IT",
      "role": "Developer"
    },
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 4. User Login

```bash
POST /api/user/login
Content-Type: application/json

{
  "userId": "john_doe",
  "password": "userPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6789012345",
      "userId": "john_doe",
      "pno": "3",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St, City",
      "isActive": true,
      "loginCount": 6,
      "metadata": {},
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T14:30:00.000Z"
    },
    "loginInfo": {
      "lastLogin": "2024-01-15T14:30:00.000Z",
      "loginCount": 6
    }
  }
}
```

### 5. Update User

```bash
PUT /api/user/64a1b2c3d4e5f6789012345
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "+1234567891",
  "address": "789 New St, City",
  "isActive": true,
  "metadata": {
    "department": "Sales",
    "role": "Manager"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "userId": "john_doe",
    "pno": "3",
    "fullName": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567891",
    "address": "789 New St, City",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "loginCount": 5,
    "metadata": {
      "department": "Sales",
      "role": "Manager"
    },
    "createdAt": "2024-01-10T08:00:00.000Z",
    "updatedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

### 6. Delete User

```bash
DELETE /api/user/64a1b2c3d4e5f6789012345
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "userId": "john_doe",
    "fullName": "John Doe",
    "deletedAt": "2024-01-15T16:00:00.000Z"
  }
}
```

### 7. Search Users

```bash
GET /api/user/search?q=john&pno=3&isActive=true&page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `q` (required): Search query
- `pno` (optional): Filter by PNO ("3" or "4")
- `isActive` (optional): Filter by active status
- `page` (optional): Page number
- `limit` (optional): Records per page
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort direction

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "userId": "john_doe",
      "pno": "3",
      "fullName": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "limit": 20
  },
  "searchCriteria": {
    "query": "john",
    "pno": "3",
    "isActive": "true",
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

### 8. Get Users by PNO

```bash
GET /api/user/pno/3?page=1&limit=20&isActive=true
```

**Path Parameters:**
- `pno`: PNO value ("3" or "4")

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Records per page
- `isActive` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "userId": "john_doe",
      "pno": "3",
      "fullName": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  },
  "filter": {
    "pno": "3",
    "isActive": "true"
  }
}
```

### 9. Get User Statistics

```bash
GET /api/user/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "activeUsers": 95,
    "inactiveUsers": 5,
    "pno3Users": 60,
    "pno4Users": 40
  }
}
```

### 10. Delete All Users

```bash
DELETE /api/user
```

**Response:**
```json
{
  "success": true,
  "message": "All users deleted successfully",
  "data": {
    "deletedCount": 100,
    "deletedAt": "2024-01-15T16:30:00.000Z"
  }
}
```

## JavaScript Implementation Examples

### 1. Create User

```javascript
async function createUser(userData) {
  try {
    const response = await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('User created:', result.data);
      return result.data;
    } else {
      console.error('Error creating user:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const newUser = await createUser({
  userId: 'alice_wonder',
  password: 'securePass123',
  pno: '4',
  fullName: 'Alice Wonder',
  email: 'alice@example.com',
  phone: '+1555123456',
  address: 'Wonderland, Fantasy City'
});
```

### 2. User Login

```javascript
async function loginUser(userId, password) {
  try {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Login successful:', result.data.user);
      console.log('Login info:', result.data.loginInfo);
      return result.data;
    } else {
      console.error('Login failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const loginResult = await loginUser('john_doe', 'userPassword123');
```

### 3. Get All Users with Filters

```javascript
async function getUsers(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.pno) queryParams.append('pno', filters.pno);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const response = await fetch(`/api/user?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Users:', result.data);
      console.log('Pagination:', result.pagination);
      console.log('Statistics:', result.statistics);
      return result;
    } else {
      console.error('Error fetching users:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const users = await getUsers({
  page: 1,
  limit: 20,
  search: 'john',
  pno: '3',
  isActive: true,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### 4. Search Users

```javascript
async function searchUsers(query, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters.pno) queryParams.append('pno', filters.pno);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const response = await fetch(`/api/user/search?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Search results:', result.data);
      console.log('Pagination:', result.pagination);
      return result;
    } else {
      console.error('Search error:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const searchResults = await searchUsers('john', {
  pno: '3',
  isActive: true,
  page: 1,
  limit: 10
});
```

### 5. Update User

```javascript
async function updateUser(userId, updateData) {
  try {
    const response = await fetch(`/api/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('User updated:', result.data);
      return result.data;
    } else {
      console.error('Error updating user:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const updatedUser = await updateUser('64a1b2c3d4e5f6789012345', {
  fullName: 'John Doe Updated',
  email: 'john.updated@example.com',
  phone: '+1234567891',
  isActive: true
});
```

### 6. Get Users by PNO

```javascript
async function getUsersByPno(pno, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    
    const response = await fetch(`/api/user/pno/${pno}?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`Users with PNO ${pno}:`, result.data);
      console.log('Pagination:', result.pagination);
      return result;
    } else {
      console.error('Error fetching users by PNO:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const pno3Users = await getUsersByPno('3', {
  page: 1,
  limit: 20,
  isActive: true
});
```

### 7. Get User Statistics

```javascript
async function getUserStats() {
  try {
    const response = await fetch('/api/user/stats');
    const result = await response.json();
    
    if (result.success) {
      console.log('User statistics:', result.data);
      return result.data;
    } else {
      console.error('Error fetching statistics:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const stats = await getUserStats();
console.log(`Total users: ${stats.totalUsers}`);
console.log(`Active users: ${stats.activeUsers}`);
console.log(`PNO 3 users: ${stats.pno3Users}`);
console.log(`PNO 4 users: ${stats.pno4Users}`);
```

## Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Validation Errors

```json
{
  "success": false,
  "message": "userId, password, pno, and fullName are required"
}
```

### Duplicate User Error

```json
{
  "success": false,
  "message": "User with this userId already exists"
}
```

### Invalid PNO Error

```json
{
  "success": false,
  "message": "PNO must be either 3 or 4"
}
```

### Login Errors

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

```json
{
  "success": false,
  "message": "User account is deactivated"
}
```

## Best Practices

### 1. Password Security
- Use strong passwords (minimum 6 characters)
- Passwords are automatically hashed using bcrypt
- Never store plain text passwords

### 2. User ID Management
- User IDs are case-insensitive and stored in lowercase
- User IDs must be unique across the system
- Use meaningful, user-friendly IDs

### 3. PNO Validation
- PNO must be exactly "3" or "4"
- PNO is required for all users
- Use PNO for filtering and organization

### 4. Data Validation
- All required fields must be provided
- Email format is validated if provided
- Phone numbers should be in standard format

### 5. Search and Filtering
- Use search for text-based queries
- Use PNO filter for organizational purposes
- Use isActive filter for account status
- Combine filters for precise results

The User API provides complete user management functionality with secure authentication, flexible search and filtering, and comprehensive CRUD operations! 🚀
