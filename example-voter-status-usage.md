# Voter Status Management API

## Overview
The Voter API now includes `isPaid` and `isVisited` fields for both Voter and VoterFour collections, with dedicated endpoints for updating these statuses and sorting capabilities.

## New Fields Added

### Voter Schema
- `isPaid: Boolean` (default: false)
- `isVisited: Boolean` (default: false)

### VoterFour Schema  
- `isPaid: Boolean` (default: false)
- `isVisited: Boolean` (default: false)

## API Endpoints

### Voter Endpoints

#### 1. Update Payment Status
```bash
PATCH /api/voter/:id/paid
Content-Type: application/json

{
  "isPaid": true
}
```

#### 2. Update Visit Status
```bash
PATCH /api/voter/:id/visited
Content-Type: application/json

{
  "isVisited": true
}
```

#### 3. Update Both Statuses
```bash
PATCH /api/voter/:id/status
Content-Type: application/json

{
  "isPaid": true,
  "isVisited": false
}
```

#### 4. Get Voter Statistics
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

### VoterFour Endpoints

#### 1. Update Payment Status
```bash
PATCH /api/voterfour/:id/paid
Content-Type: application/json

{
  "isPaid": true
}
```

#### 2. Update Visit Status
```bash
PATCH /api/voterfour/:id/visited
Content-Type: application/json

{
  "isVisited": true
}
```

#### 3. Update Both Statuses
```bash
PATCH /api/voterfour/:id/status
Content-Type: application/json

{
  "isPaid": true,
  "isVisited": false
}
```

#### 4. Get VoterFour Statistics
```bash
GET /api/voterfour/stats
```

## Enhanced Search & Sorting

### Search with Status Filtering

#### Voter Search
```bash
GET /api/search?isPaid=true&isVisited=false&sortBy=isPaid&sortOrder=desc
```

#### VoterFour Search
```bash
GET /api/search-four?isPaid=true&isVisited=false&sortBy=isVisited&sortOrder=asc
```

### Available Query Parameters

#### Status Filtering
- `isPaid=true/false` - Filter by payment status
- `isVisited=true/false` - Filter by visit status

#### Sorting Options
- `sortBy=isPaid` - Sort by payment status
- `sortBy=isVisited` - Sort by visit status
- `sortBy=Voter Name Eng` - Sort by name (default)
- `sortOrder=asc/desc` - Sort order (default: asc)

## Example Usage Scenarios

### 1. Mark Voter as Paid
```bash
curl -X PATCH http://localhost:3000/api/voter/64f8a1b2c3d4e5f6a7b8c9d0/paid \
  -H "Content-Type: application/json" \
  -d '{"isPaid": true}'
```

### 2. Mark Voter as Visited
```bash
curl -X PATCH http://localhost:3000/api/voter/64f8a1b2c3d4e5f6a7b8c9d0/visited \
  -H "Content-Type: application/json" \
  -d '{"isVisited": true}'
```

### 3. Update Both Statuses
```bash
curl -X PATCH http://localhost:3000/api/voter/64f8a1b2c3d4e5f6a7b8c9d0/status \
  -H "Content-Type: application/json" \
  -d '{"isPaid": true, "isVisited": true}'
```

### 4. Search for Unpaid Voters
```bash
curl "http://localhost:3000/api/search?isPaid=false&sortBy=Voter Name Eng"
```

### 5. Search for Visited Voters (VoterFour)
```bash
curl "http://localhost:3000/api/search-four?isVisited=true&sortBy=isVisited&sortOrder=desc"
```

### 6. Get Statistics
```bash
curl "http://localhost:3000/api/voter/stats"
curl "http://localhost:3000/api/voterfour/stats"
```

## Response Format

All status update endpoints return:
```json
{
  "success": true,
  "message": "Voter payment status updated to true",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "Voter Name Eng": "John Doe",
    "isPaid": true,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## Database Indexes

The following indexes have been added for optimal performance:
- `isPaid` index on both Voter and VoterFour collections
- `isVisited` index on both Voter and VoterFour collections

## Error Handling

- **400 Bad Request**: Invalid boolean values for isPaid/isVisited
- **404 Not Found**: Voter/VoterFour record not found
- **500 Internal Server Error**: Database or server errors

## Use Cases

1. **Campaign Management**: Track which voters have been visited and paid
2. **Analytics**: Generate reports on payment and visit statistics
3. **Filtering**: Find specific groups of voters based on status
4. **Sorting**: Organize voters by payment or visit status
5. **Bulk Operations**: Update multiple voters' statuses efficiently
