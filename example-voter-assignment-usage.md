# Voter and SubAdmin Assignment API

## Overview
The Voter Assignment API allows administrators to assign voters to sub-administrators for efficient voter management and tracking. This system supports both regular voters and VoterFour types with comprehensive assignment tracking and statistics.



## Endpoints

### 1. Assign Voters to SubAdmin
Assign multiple voters to a sub-admin for management purposes.

```bash
POST /api/assignment/assign
Content-Type: application/json


{
  "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "voterIds": [
    "64f8a1b2c3d4e5f6a7b8c9d1",
    "64f8a1b2c3d4e5f6a7b8c9d2",
    "64f8a1b2c3d4e5f6a7b8c9d3"
  ],
  "voterType": "Voter",
  "notes": "Assigned for door-to-door campaign"
}
```

**Request Body:**
- `subAdminId` (required): ObjectId of the sub-admin
- `voterIds` (required): Array of voter ObjectIds to assign
- `voterType` (required): Either "Voter" or "VoterFour"
- `notes` (optional): Additional notes about the assignment (max 500 characters)

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Successfully assigned 3 voters to sub admin",
  "data": {
    "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "assignedCount": 3,
    "assignments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
        "voterId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "voterType": "Voter",
        "assignedBy": "64f8a1b2c3d4e5f6a7b8c9d5",
        "notes": "Assigned for door-to-door campaign",
        "isActive": true,
        "assignedAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Error Response (409 - Conflict):**
```json
{
  "success": false,
  "message": "Some voters are already assigned to this sub admin",
  "alreadyAssigned": ["64f8a1b2c3d4e5f6a7b8c9d1"]
}
```

### 2. Unassign Voters from SubAdmin
Remove voter assignments from a sub-admin (soft delete - sets isActive to false).

```bash
DELETE /api/assignment/unassign
Content-Type: application/json


{
  "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "voterIds": [
    "64f8a1b2c3d4e5f6a7b8c9d1",
    "64f8a1b2c3d4e5f6a7b8c9d2"
  ],
  "voterType": "Voter"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully unassigned 2 voters from sub admin",
  "data": {
    "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "unassignedCount": 2
  }
}
```

### 3. Get SubAdmin Assignments
Retrieve all assignments for a specific sub-admin with pagination and filtering.

```bash
GET /api/assignment/subadmin/64f8a1b2c3d4e5f6a7b8c9d0?page=1&limit=20&voterType=Voter&sortBy=assignedAt&sortOrder=desc

```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `voterType` (optional): Filter by "Voter" or "VoterFour"
- `sortBy` (optional): Sort field (default: "assignedAt")
- `sortOrder` (optional): "asc" or "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "voterId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "fullName": "John Doe",
        "voterId": "VOTER001",
        "phoneNumber": "9876543210"
      },
      "voterType": "Voter",
      "assignedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "email": "admin@example.com"
      },
      "notes": "Assigned for door-to-door campaign",
      "isActive": true,
      "assignedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 45,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

### 4. Get Voter Assignments
Retrieve all assignments for a specific voter.

```bash
GET /api/assignment/voter/64f8a1b2c3d4e5f6a7b8c9d1/Voter

```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "subAdminId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "fullName": "Jane Smith",
        "userId": "SUBADMIN001",
        "locationName": "Downtown District"
      },
      "voterId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "voterType": "Voter",
      "assignedBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
        "email": "admin@example.com"
      },
      "notes": "Assigned for door-to-door campaign",
      "isActive": true,
      "assignedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 5. Get Assignment Statistics
Retrieve comprehensive statistics about voter assignments.

```bash
GET /api/assignment/stats

```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAssignments": 150,
    "activeAssignments": 142,
    "subAdminStats": [
      {
        "subAdminName": "Jane Smith",
        "subAdminUserId": "SUBADMIN001",
        "assignmentCount": 25
      },
      {
        "subAdminName": "Bob Johnson",
        "subAdminUserId": "SUBADMIN002",
        "assignmentCount": 18
      }
    ],
    "voterTypeStats": [
      {
        "_id": "Voter",
        "count": 120
      },
      {
        "_id": "VoterFour",
        "count": 22
      }
    ],
    "recentAssignments": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
        "subAdminId": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "fullName": "Jane Smith",
          "userId": "SUBADMIN001"
        },
        "voterId": "64f8a1b2c3d4e5f6a7b8c9d1",
        "voterType": "Voter",
        "assignedBy": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
          "email": "admin@example.com"
        },
        "notes": "Assigned for door-to-door campaign",
        "isActive": true,
        "assignedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 6. Delete Specific Assignment
Permanently delete a specific assignment record.

```bash
DELETE /api/assignment/64f8a1b2c3d4e5f6a7b8c9d4

```

**Response:**
```json
{
  "success": true,
  "message": "Assignment deleted successfully"
}
```

## Data Model

### VoterAssignment Schema
```javascript
{
  _id: ObjectId,
  subAdminId: ObjectId (ref: 'SubAdmin'),
  voterId: ObjectId,
  voterType: String (enum: ['Voter', 'VoterFour']),
  assignedBy: ObjectId (ref: 'Admin'),
  assignedAt: Date (default: Date.now),
  isActive: Boolean (default: true),
  notes: String (max: 500 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- Compound index: `{ subAdminId: 1, voterId: 1, voterType: 1 }` (unique)
- `{ subAdminId: 1, isActive: 1 }`
- `{ voterId: 1, voterType: 1, isActive: 1 }`
- `{ assignedBy: 1, assignedAt: -1 }`

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Sub admin ID, voter IDs array, and voter type are required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Sub admin not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Some voters are already assigned to this sub admin",
  "alreadyAssigned": ["voterId1", "voterId2"]
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error assigning voters",
  "error": "Detailed error message"
}
```

## Usage Examples

### Example 1: Assign Regular Voters
```bash
curl -X POST http://localhost:3000/api/assignment/assign \
  -H "Content-Type: application/json" \
 
  -d '{
    "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "voterIds": ["64f8a1b2c3d4e5f6a7b8c9d1", "64f8a1b2c3d4e5f6a7b8c9d2"],
    "voterType": "Voter",
    "notes": "Campaign assignment for district 1"
  }'
```

### Example 2: Assign VoterFour
```bash
curl -X POST http://localhost:3000/api/assignment/assign \
  -H "Content-Type: application/json" \

  -d '{
    "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "voterIds": ["64f8a1b2c3d4e5f6a7b8c9d3"],
    "voterType": "VoterFour",
    "notes": "Special assignment for VIP voters"
  }'
```

### Example 3: Get SubAdmin Assignments with Filtering
```bash
curl -X GET "http://localhost:3000/api/assignment/subadmin/64f8a1b2c3d4e5f6a7b8c9d0?voterType=Voter&page=1&limit=10" \
 
```

### Example 4: Get Assignment Statistics
```bash
curl -X GET http://localhost:3000/api/assignment/stats \
 
```

### Example 5: Unassign Voters
```bash
curl -X DELETE http://localhost:3000/api/assignment/unassign \
  -H "Content-Type: application/json" \
 
  -d '{
    "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "voterIds": ["64f8a1b2c3d4e5f6a7b8c9d1"],
    "voterType": "Voter"
  }'
```

## Best Practices

1. **Batch Operations**: Use the assignment endpoint to assign multiple voters at once for better performance.

2. **Validation**: Always validate voter IDs and sub-admin IDs before making assignments.

3. **Notes**: Use the notes field to track the purpose or context of assignments.

4. **Monitoring**: Regularly check assignment statistics to ensure proper distribution.

5. **Cleanup**: Use the unassign endpoint instead of deleting assignments to maintain audit trails.

6. **Pagination**: Always use pagination when retrieving large lists of assignments.

## Related APIs

- **SubAdmin API**: `/api/subadmin/*` - Manage sub-administrators
- **Voter API**: `/api/voter/*` - Manage regular voters
- **VoterFour API**: `/api/voterfour/*` - Manage VoterFour records
- **Admin API**: `/api/admin/*` - Admin authentication and management
