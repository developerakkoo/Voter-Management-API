# Complete CRUD Operations for Voter & VoterFour API

## Overview
The Voter API now includes comprehensive CRUD (Create, Read, Update, Delete) operations for both Voter and VoterFour collections, along with status management and statistics.

## Voter CRUD Endpoints

### 1. Get All Voters
```bash
GET /api/voter
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `isPaid` - Filter by payment status (true/false)
- `isVisited` - Filter by visit status (true/false)
- `isActive` - Filter by active status (true/false)
- `sortBy` - Sort field (default: 'Voter Name Eng')
- `sortOrder` - Sort order (asc/desc, default: asc)

**Example:**
```bash
GET /api/voter?page=1&limit=10&isPaid=true&sortBy=isVisited&sortOrder=desc
```

### 2. Get Voter by ID
```bash
GET /api/voter/:id
```

**Example:**
```bash
GET /api/voter/64f8a1b2c3d4e5f6a7b8c9d0
```

### 3. Update Voter
```bash
PUT /api/voter/:id
Content-Type: application/json

{
  "Voter Name Eng": "John Doe Updated",
  "Age": 35,
  "isPaid": true,
  "isVisited": false
}
```

### 4. Delete Voter
```bash
DELETE /api/voter/:id
```

### 5. Delete All Voters (Testing/Reset)
```bash
DELETE /api/voter
```

## VoterFour CRUD Endpoints

### 1. Get All VoterFour Records
```bash
GET /api/voterfour
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `isPaid` - Filter by payment status (true/false)
- `isVisited` - Filter by visit status (true/false)
- `isActive` - Filter by active status (true/false)
- `sourceFile` - Filter by source file
- `sortBy` - Sort field (default: 'Voter Name Eng')
- `sortOrder` - Sort order (asc/desc, default: asc)

**Example:**
```bash
GET /api/voterfour?page=1&limit=10&sourceFile=1st.xlsx&isPaid=false
```

### 2. Get VoterFour by ID
```bash
GET /api/voterfour/:id
```

### 3. Update VoterFour
```bash
PUT /api/voterfour/:id
Content-Type: application/json

{
  "Voter Name Eng": "Jane Smith Updated",
  "Age": 28,
  "isPaid": true,
  "isVisited": true,
  "sourceFile": "updated.xlsx"
}
```

### 4. Delete VoterFour
```bash
DELETE /api/voterfour/:id
```

### 5. Delete All VoterFour Records (Testing/Reset)
```bash
DELETE /api/voterfour
```

## Status Management Endpoints

### Voter Status Management

#### Update Payment Status
```bash
PATCH /api/voter/:id/paid
Content-Type: application/json

{
  "isPaid": true
}
```

#### Update Visit Status
```bash
PATCH /api/voter/:id/visited
Content-Type: application/json

{
  "isVisited": true
}
```

#### Update Both Statuses
```bash
PATCH /api/voter/:id/status
Content-Type: application/json

{
  "isPaid": true,
  "isVisited": false
}
```

### VoterFour Status Management

#### Update Payment Status
```bash
PATCH /api/voterfour/:id/paid
Content-Type: application/json

{
  "isPaid": true
}
```

#### Update Visit Status
```bash
PATCH /api/voterfour/:id/visited
Content-Type: application/json

{
  "isVisited": true
}
```

#### Update Both Statuses
```bash
PATCH /api/voterfour/:id/status
Content-Type: application/json

{
  "isPaid": true,
  "isVisited": true
}
```

## Statistics Endpoints

### Voter Statistics
```bash
GET /api/voter/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVoters": 1000,
    "paymentStats": {
      "paid": 750,
      "unpaid": 250,
      "paidPercentage": "75.00"
    },
    "visitStats": {
      "visited": 600,
      "unvisited": 400,
      "visitedPercentage": "60.00"
    },
    "combinedStats": {
      "paidAndVisited": 500,
      "paidAndVisitedPercentage": "50.00"
    }
  }
}
```

### VoterFour Statistics
```bash
GET /api/voterfour/stats
```

## Example Usage Scenarios

### 1. Get All Paid Voters
```bash
curl "http://localhost:3000/api/voter?isPaid=true&limit=50"
```

### 2. Update Voter Information
```bash
curl -X PUT http://localhost:3000/api/voter/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{
    "Voter Name Eng": "John Doe Updated",
    "Age": 35,
    "isPaid": true
  }'
```

### 3. Mark Voter as Visited
```bash
curl -X PATCH http://localhost:3000/api/voter/64f8a1b2c3d4e5f6a7b8c9d0/visited \
  -H "Content-Type: application/json" \
  -d '{"isVisited": true}'
```

### 4. Get VoterFour Records from Specific File
```bash
curl "http://localhost:3000/api/voterfour?sourceFile=1st.xlsx&isPaid=false"
```

### 5. Delete Specific Voter
```bash
curl -X DELETE http://localhost:3000/api/voter/64f8a1b2c3d4e5f6a7b8c9d0
```

### 6. Get Statistics
```bash
curl "http://localhost:3000/api/voter/stats"
curl "http://localhost:3000/api/voterfour/stats"
```

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

## Advanced Filtering & Sorting

### Complex Queries
```bash
# Get unpaid voters, sorted by name
GET /api/voter?isPaid=false&sortBy=Voter Name Eng&sortOrder=asc

# Get visited VoterFour records from specific file
GET /api/voterfour?isVisited=true&sourceFile=2nd.xlsx

# Get active voters, sorted by payment status
GET /api/voter?isActive=true&sortBy=isPaid&sortOrder=desc
```

## Use Cases

1. **Voter Management**: Complete CRUD operations for voter records
2. **Status Tracking**: Track payment and visit statuses
3. **Data Analysis**: Generate statistics and reports
4. **Bulk Operations**: Update multiple records efficiently
5. **Data Cleanup**: Delete specific or all records
6. **Filtering**: Find specific groups of voters
7. **Sorting**: Organize data by various criteria

## Error Handling

- **400 Bad Request**: Invalid data or validation errors
- **404 Not Found**: Record not found
- **500 Internal Server Error**: Database or server errors

## Performance Features

- **Pagination**: Efficient handling of large datasets
- **Indexing**: Optimized database queries
- **Filtering**: Fast filtering by status fields
- **Sorting**: Flexible sorting options
- **Lean Queries**: Optimized data retrieval
