# Unified Voter API - Usage Examples

This API provides a unified interface to create, read, update, and delete voters in both `Voter` and `VoterFour` collections with a single set of endpoints.

## Base URL
```
http://localhost:3000/api/unified-voter
```

## Table of Contents
1. [Create Single Voter](#1-create-single-voter)
2. [Create Multiple Voters (Bulk)](#2-create-multiple-voters-bulk)
3. [Get Voter](#3-get-voter)
4. [Update Voter](#4-update-voter)
5. [Delete Voter](#5-delete-voter)
6. [Search Voters](#6-search-voters)

---

## 1. Create Single Voter

Create a voter in either the `Voter` or `VoterFour` collection.

### Endpoint
```
POST /api/unified-voter
```

### Request Body

#### Create a Voter (Type: Voter)
```json
{
  "voterType": "Voter",
  "voterData": {
    "Voter Name Eng": "Ramesh Kumar Sharma",
    "Voter Name": "रमेश कुमार शर्मा",
    "Relative Name Eng": "Suresh Sharma",
    "Relative Name": "सुरेश शर्मा",
    "AC": "208",
    "Part": "5",
    "Sr No": "1234",
    "House No": "A-101",
    "Sex": "Male",
    "Age": 35,
    "CardNo": "ABC1234567",
    "Address": "123 Main Street, Area Name",
    "Address Eng": "123 Main Street, Area Name",
    "Booth": "Booth Name",
    "Booth Eng": "Booth Name English",
    "pno": "3"
  }
}
```

#### Create a VoterFour
```json
{
  "voterType": "VoterFour",
  "voterData": {
    "Voter Name Eng": "Priya Devi Patel",
    "Voter Name": "प्रिया देवी पटेल",
    "Relative Name Eng": "Rahul Patel",
    "Relative Name": "राहुल पटेल",
    "AC": "242",
    "Booth no": "123",
    "Sr No": "5678",
    "Sex": "Female",
    "Age": 28,
    "CodeNo": "XYZ9876543",
    "Address": "456 Park Road, Colony",
    "Booth": "Community Center",
    "Booth Eng": "Community Center",
    "pno": "4",
    "sourceFile": "3rd.xlsx"
  }
}
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Voter created successfully",
  "data": {
    "voterId": "68e12345abcdef1234567890",
    "voterType": "Voter",
    "voterData": {
      "_id": "68e12345abcdef1234567890",
      "Voter Name Eng": "Ramesh Kumar Sharma",
      "Voter Name": "रमेश कुमार शर्मा",
      // ... all other fields
      "createdAt": "2025-10-09T10:00:00.000Z",
      "updatedAt": "2025-10-09T10:00:00.000Z"
    }
  }
}
```

### Response (Error - 400)
```json
{
  "success": false,
  "message": "Voter Name Eng is required in voterData"
}
```

### Response (Error - 409 - Duplicate)
```json
{
  "success": false,
  "message": "A voter with this CardNo already exists",
  "error": "E11000 duplicate key error..."
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/unified-voter \
  -H "Content-Type: application/json" \
  -d '{
    "voterType": "Voter",
    "voterData": {
      "Voter Name Eng": "Ramesh Kumar Sharma",
      "Voter Name": "रमेश कुमार शर्मा",
      "AC": "208",
      "Part": "5",
      "Sex": "Male",
      "Age": 35,
      "CardNo": "ABC1234567",
      "pno": "3"
    }
  }'
```

---

## 2. Create Multiple Voters (Bulk)

Create multiple voters at once in either the `Voter` or `VoterFour` collection. This is useful for batch imports or adding multiple voters efficiently.

### Endpoint
```
POST /api/unified-voter/bulk
```

### Request Body

#### Create Multiple Voters
```json
{
  "voterType": "Voter",
  "voters": [
    {
      "Voter Name Eng": "Ramesh Kumar Sharma",
      "Voter Name": "रमेश कुमार शर्मा",
      "AC": "208",
      "Part": "5",
      "Sex": "Male",
      "Age": 35,
      "CardNo": "ABC1234567",
      "pno": "3"
    },
    {
      "Voter Name Eng": "Sunita Devi Verma",
      "Voter Name": "सुनीता देवी वर्मा",
      "AC": "208",
      "Part": "5",
      "Sex": "Female",
      "Age": 32,
      "CardNo": "ABC1234568",
      "pno": "3"
    },
    {
      "Voter Name Eng": "Rajesh Singh Patel",
      "Voter Name": "राजेश सिंह पटेल",
      "AC": "208",
      "Part": "12",
      "Sex": "Male",
      "Age": 45,
      "CardNo": "ABC1234569",
      "pno": "3"
    }
  ]
}
```

#### Create Multiple VoterFour Records
```json
{
  "voterType": "VoterFour",
  "voters": [
    {
      "Voter Name Eng": "Priya Devi Patel",
      "Voter Name": "प्रिया देवी पटेल",
      "AC": "242",
      "Booth no": "123",
      "Sex": "Female",
      "Age": 28,
      "CodeNo": "XYZ9876543",
      "pno": "4"
    },
    {
      "Voter Name Eng": "Amit Kumar Singh",
      "Voter Name": "अमित कुमार सिंह",
      "AC": "242",
      "Booth no": "123",
      "Sex": "Male",
      "Age": 30,
      "CodeNo": "XYZ9876544",
      "pno": "4"
    }
  ]
}
```

### Response (All Successful - 201)
```json
{
  "success": true,
  "message": "Processed 3 voters: 3 successful, 0 failed",
  "data": {
    "voterType": "Voter",
    "totalProcessed": 3,
    "successfulCount": 3,
    "failedCount": 0,
    "successful": [
      {
        "index": 0,
        "voterId": "68e12345abcdef1234567890",
        "voterName": "Ramesh Kumar Sharma"
      },
      {
        "index": 1,
        "voterId": "68e12345abcdef1234567891",
        "voterName": "Sunita Devi Verma"
      },
      {
        "index": 2,
        "voterId": "68e12345abcdef1234567892",
        "voterName": "Rajesh Singh Patel"
      }
    ],
    "failed": []
  }
}
```

### Response (Partial Success - 207 Multi-Status)
```json
{
  "success": false,
  "message": "Processed 3 voters: 2 successful, 1 failed",
  "data": {
    "voterType": "Voter",
    "totalProcessed": 3,
    "successfulCount": 2,
    "failedCount": 1,
    "successful": [
      {
        "index": 0,
        "voterId": "68e12345abcdef1234567890",
        "voterName": "Ramesh Kumar Sharma"
      },
      {
        "index": 2,
        "voterId": "68e12345abcdef1234567892",
        "voterName": "Rajesh Singh Patel"
      }
    ],
    "failed": [
      {
        "index": 1,
        "voterName": "Sunita Devi Verma",
        "error": "Duplicate CardNo: ABC1234568"
      }
    ]
  }
}
```

### Response (Validation Error - 400)
```json
{
  "success": false,
  "message": "Some voters are missing \"Voter Name Eng\"",
  "invalidIndexes": [1, 3]
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/unified-voter/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "voterType": "Voter",
    "voters": [
      {
        "Voter Name Eng": "Ramesh Kumar Sharma",
        "AC": "208",
        "Part": "5",
        "Sex": "Male",
        "Age": 35,
        "CardNo": "ABC1234567",
        "pno": "3"
      },
      {
        "Voter Name Eng": "Sunita Devi Verma",
        "AC": "208",
        "Part": "5",
        "Sex": "Female",
        "Age": 32,
        "CardNo": "ABC1234568",
        "pno": "3"
      }
    ]
  }'
```

### Features
- ✅ **Handles duplicates gracefully** - Continues processing even if some voters fail
- ✅ **Detailed error reporting** - Shows which voters succeeded and which failed with reasons
- ✅ **Index tracking** - Identifies failed voters by their array index
- ✅ **Partial success support** - Returns 207 status when some succeed and some fail
- ✅ **Validates all voters** - Checks for required fields before processing

---

## 3. Get Voter

Retrieve a voter from either collection by ID and type.

### Endpoint
```
GET /api/unified-voter/:voterId/:voterType
```

### Parameters
- `voterId` - The MongoDB ObjectId of the voter
- `voterType` - Either "Voter" or "VoterFour"

### Response (Success - 200)
```json
{
  "success": true,
  "data": {
    "voterId": "68e12345abcdef1234567890",
    "voterType": "Voter",
    "voterData": {
      "_id": "68e12345abcdef1234567890",
      "Voter Name Eng": "Ramesh Kumar Sharma",
      "AC": "208",
      // ... all other fields
    }
  }
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "Voter not found"
}
```

### cURL Example
```bash
curl -X GET http://localhost:3000/api/unified-voter/68e12345abcdef1234567890/Voter
```

---

## 3. Update Voter

Update a voter's information in either collection.

### Endpoint
```
PUT /api/unified-voter/:voterId/:voterType
```

### Parameters
- `voterId` - The MongoDB ObjectId of the voter
- `voterType` - Either "Voter" or "VoterFour"

### Request Body
```json
{
  "voterData": {
    "Voter Name Eng": "Ramesh Kumar Sharma (Updated)",
    "Age": 36,
    "Address": "New Address 789",
    "isPaid": true,
    "isVisited": true
  }
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Voter updated successfully",
  "data": {
    "voterId": "68e12345abcdef1234567890",
    "voterType": "Voter",
    "voterData": {
      "_id": "68e12345abcdef1234567890",
      "Voter Name Eng": "Ramesh Kumar Sharma (Updated)",
      "Age": 36,
      // ... updated fields
      "lastUpdated": "2025-10-09T11:00:00.000Z"
    }
  }
}
```

### cURL Example
```bash
curl -X PUT http://localhost:3000/api/unified-voter/68e12345abcdef1234567890/Voter \
  -H "Content-Type: application/json" \
  -d '{
    "voterData": {
      "Age": 36,
      "isPaid": true
    }
  }'
```

---

## 4. Delete Voter

Delete a voter from either collection.

### Endpoint
```
DELETE /api/unified-voter/:voterId/:voterType
```

### Parameters
- `voterId` - The MongoDB ObjectId of the voter
- `voterType` - Either "Voter" or "VoterFour"

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Voter deleted successfully",
  "data": {
    "voterId": "68e12345abcdef1234567890",
    "voterType": "Voter"
  }
}
```

### cURL Example
```bash
curl -X DELETE http://localhost:3000/api/unified-voter/68e12345abcdef1234567890/Voter
```

---

## 5. Search Voters

Search for voters across one or both collections.

### Endpoint
```
POST /api/unified-voter/search
```

### Request Body

#### Search in Both Collections
```json
{
  "voterType": "all",
  "search": "Sharma",
  "page": 1,
  "limit": 20,
  "sortBy": "Voter Name Eng",
  "sortOrder": "asc"
}
```

#### Search Only in Voter Collection
```json
{
  "voterType": "Voter",
  "search": "Kumar",
  "isPaid": false,
  "isVisited": false,
  "page": 1,
  "limit": 10
}
```

#### Search Only in VoterFour Collection
```json
{
  "voterType": "VoterFour",
  "search": "Patel",
  "isPaid": true,
  "page": 1,
  "limit": 20
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "data": [
    {
      "voterId": "68e12345abcdef1234567890",
      "voterType": "Voter",
      "voterData": {
        "_id": "68e12345abcdef1234567890",
        "Voter Name Eng": "Ramesh Kumar Sharma",
        "AC": "208",
        // ... all fields
      }
    },
    {
      "voterId": "68e98765fedcba0987654321",
      "voterType": "VoterFour",
      "voterData": {
        "_id": "68e98765fedcba0987654321",
        "Voter Name Eng": "Priya Sharma",
        "AC": "242",
        // ... all fields
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 98,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  },
  "filters": {
    "voterType": "all",
    "search": "Sharma",
    "isPaid": null,
    "isVisited": null,
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc"
  }
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/unified-voter/search \
  -H "Content-Type: application/json" \
  -d '{
    "voterType": "all",
    "search": "Sharma",
    "page": 1,
    "limit": 20
  }'
```

---

## JavaScript/Node.js Examples

### Using Axios

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/unified-voter';

// Create a single voter
async function createVoter() {
  try {
    const response = await axios.post(API_BASE, {
      voterType: 'Voter',
      voterData: {
        'Voter Name Eng': 'Ramesh Kumar Sharma',
        'Voter Name': 'रमेश कुमार शर्मा',
        'AC': '208',
        'Part': '5',
        'Sex': 'Male',
        'Age': 35,
        'CardNo': 'ABC1234567',
        'pno': '3'
      }
    });
    
    console.log('Voter created:', response.data);
    return response.data.data.voterId;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Create multiple voters at once
async function createMultipleVoters() {
  try {
    const response = await axios.post(`${API_BASE}/bulk`, {
      voterType: 'Voter',
      voters: [
        {
          'Voter Name Eng': 'Ramesh Kumar Sharma',
          'AC': '208',
          'Part': '5',
          'Sex': 'Male',
          'Age': 35,
          'CardNo': 'ABC1234567',
          'pno': '3'
        },
        {
          'Voter Name Eng': 'Sunita Devi Verma',
          'AC': '208',
          'Part': '5',
          'Sex': 'Female',
          'Age': 32,
          'CardNo': 'ABC1234568',
          'pno': '3'
        },
        {
          'Voter Name Eng': 'Rajesh Singh Patel',
          'AC': '208',
          'Part': '12',
          'Sex': 'Male',
          'Age': 45,
          'CardNo': 'ABC1234569',
          'pno': '3'
        }
      ]
    });
    
    console.log('Bulk creation result:', response.data);
    console.log(`Created ${response.data.data.successfulCount} voters`);
    
    if (response.data.data.failed.length > 0) {
      console.log('Failed voters:', response.data.data.failed);
    }
    
    return response.data.data.successful.map(v => v.voterId);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Get a voter
async function getVoter(voterId, voterType) {
  try {
    const response = await axios.get(`${API_BASE}/${voterId}/${voterType}`);
    console.log('Voter data:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Update a voter
async function updateVoter(voterId, voterType, updates) {
  try {
    const response = await axios.put(`${API_BASE}/${voterId}/${voterType}`, {
      voterData: updates
    });
    console.log('Voter updated:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Search voters
async function searchVoters(searchTerm) {
  try {
    const response = await axios.post(`${API_BASE}/search`, {
      voterType: 'all',
      search: searchTerm,
      page: 1,
      limit: 20
    });
    console.log('Search results:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Usage Examples
(async () => {
  // Create a single voter
  const voterId = await createVoter();
  await getVoter(voterId, 'Voter');
  await updateVoter(voterId, 'Voter', { Age: 36, isPaid: true });
  
  // Create multiple voters
  const voterIds = await createMultipleVoters();
  console.log('Created voter IDs:', voterIds);
  
  // Search for voters
  await searchVoters('Sharma');
})();
```

---

## Key Features

1. **Single Endpoint for Both Collections**: No need to remember separate endpoints for Voter and VoterFour
2. **Type-Safe**: Automatically validates voterType parameter
3. **Consistent Response Format**: All responses follow the same structure with voterId and voterType
4. **Comprehensive Search**: Search across both collections simultaneously
5. **Full CRUD Support**: Create, Read, Update, Delete operations
6. **Error Handling**: Detailed error messages for validation, duplicates, and not found errors
7. **Pagination**: Built-in pagination support for search results

---

## Best Practices

1. **Always specify voterType**: Required for all operations
2. **Use unique identifiers**: CardNo for Voter, CodeNo for VoterFour
3. **Validate data before sending**: Ensure "Voter Name Eng" is always provided
4. **Handle errors gracefully**: Check for duplicate entries (409) and not found (404)
5. **Use search for listing**: More flexible than getting individual voters
6. **Monitor voterType in responses**: Important when searching across both collections

---

## Error Codes

- `400` - Bad Request (missing required fields, invalid voterType)
- `404` - Not Found (voter doesn't exist)
- `409` - Conflict (duplicate CardNo/CodeNo)
- `500` - Server Error (database or server issues)

