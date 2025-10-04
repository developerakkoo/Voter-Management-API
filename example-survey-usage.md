# Survey API - Complete Usage Guide

## Overview
The Survey API provides comprehensive functionality for managing surveys with voter mapping, location tracking, member management, and analytics. Surveys can be linked to both Voter and VoterFour collections, and include GPS coordinates, phone numbers, and multiple survey members.

## Key Features

### 🎯 **Core Features:**
- **Voter Mapping**: Link surveys to Voter or VoterFour collections
- **Location Tracking**: GPS coordinates (latitude, longitude) with address
- **Phone Number Storage**: Voter and member phone numbers
- **Member Management**: Multiple survey members with name, age, phone
- **Surveyor Tracking**: Link surveys to User accounts
- **Status Management**: Draft, completed, submitted, verified, rejected
- **Analytics**: Comprehensive statistics and reporting
- **Search & Filter**: Advanced search and filtering capabilities
- **Auto-Population**: Main voterId and members' voterId are automatically populated with full voter details

### 📊 **Survey Status Flow:**
```
completed → submitted → verified/rejected
```

**Note**: All surveys are created with `status: "completed"` by default. The `draft` status is available for manual use if needed.

## API Endpoints

### 1. **Get All Surveys**
```bash
GET /api/survey
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)
- `status` (optional): Filter by status (draft, completed, submitted, verified, rejected)
- `surveyorId` (optional): Filter by surveyor ID
- `voterType` (optional): Filter by voter type (Voter, VoterFour)
- `voterId` (optional): Filter by specific voter ID
- `voterPhoneNumber` (optional): Filter by voter phone number
- `search` (optional): Search in phone numbers, addresses, notes, member names
- `dateFrom` (optional): Filter from date (YYYY-MM-DD)
- `dateTo` (optional): Filter to date (YYYY-MM-DD)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort direction asc/desc (default: desc)

**Example:**
```bash
GET /api/survey?page=1&limit=20&status=completed&voterType=Voter&sortBy=createdAt&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "voterId": "64a1b2c3d4e5f6789012346",
      "voterType": "Voter",
      "surveyorId": {
        "_id": "64a1b2c3d4e5f6789012347",
        "fullName": "John Doe",
        "userId": "john_doe",
        "pno": "3"
      },
      "location": {
        "latitude": 18.5204,
        "longitude": 73.8567,
        "address": "Pune, Maharashtra, India",
        "accuracy": 10
      },
      "voterPhoneNumber": "9876543210",
      "status": "completed",
      "surveyData": {
        "question1": "Answer 1",
        "question2": "Answer 2"
      },
      "notes": "Survey completed successfully",
      "members": [
        {
          "name": "Jane Doe",
          "age": 25,
          "phoneNumber": "9876543211",
          "relationship": "Spouse",
          "isVoter": true,
          "voterId": {
            "_id": "64a1b2c3d4e5f6789012348",
            "CardNo": "TBZ4771515",
            "pno": "3",
            "Voter Name Eng": "Jane Doe"
          },
          "voterType": "Voter"
        }
      ],
      "completedAt": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-15T09:00:00.000Z",
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
  "filters": {
    "status": "completed",
    "voterType": "Voter",
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

### 2. **Get Survey by ID**
```bash
GET /api/survey/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "voterId": {
      "_id": "64a1b2c3d4e5f6789012346",
      "Voter Name Eng": "Rajesh Pathare",
      "Voter Name": "राजेश पठारे",
      "pno": "3",
      "CardNo": "TBZ4724761"
    },
    "voterType": "Voter",
    "surveyorId": {
      "_id": "64a1b2c3d4e5f6789012347",
      "fullName": "John Doe",
      "userId": "john_doe",
      "pno": "3",
      "email": "john@example.com",
      "phone": "9876543210"
    },
    "location": {
      "latitude": 18.5204,
      "longitude": 73.8567,
      "address": "Pune, Maharashtra, India",
      "accuracy": 10
    },
    "voterPhoneNumber": "9876543210",
    "status": "completed",
    "surveyData": {
      "question1": "Answer 1",
      "question2": "Answer 2"
    },
    "notes": "Survey completed successfully",
    "members": [
      {
        "name": "Jane Doe",
        "age": 25,
        "phoneNumber": "9876543211",
        "relationship": "Spouse",
        "isVoter": true,
        "voterId": "64a1b2c3d4e5f6789012348",
        "voterType": "Voter"
      }
    ],
    "completedAt": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. **Create Survey**
```bash
POST /api/survey
```

**Request Body:**
```json
{
  "voterId": "64a1b2c3d4e5f6789012346",
  "voterType": "Voter",
  "surveyorId": "64a1b2c3d4e5f6789012347",
  "location": {
    "latitude": 18.5204,
    "longitude": 73.8567,
    "address": "Pune, Maharashtra, India",
    "accuracy": 10
  },
  "voterPhoneNumber": "9876543210",
  "surveyData": {
    "question1": "Answer 1",
    "question2": "Answer 2"
  },
  "notes": "Survey notes",
  "members": [
    {
      "name": "Jane Doe",
      "age": 25,
      "phoneNumber": "9876543211",
      "relationship": "Spouse",
      "isVoter": true,
      "voterId": "64a1b2c3d4e5f6789012348",
      "voterType": "Voter"
    }
  ],
  "metadata": {
    "device": "mobile",
    "appVersion": "1.0.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Survey created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "voterId": "64a1b2c3d4e5f6789012346",
    "voterType": "Voter",
    "surveyorId": {
      "_id": "64a1b2c3d4e5f6789012347",
      "fullName": "John Doe",
      "userId": "john_doe",
      "pno": "3"
    },
    "location": {
      "latitude": 18.5204,
      "longitude": 73.8567,
      "address": "Pune, Maharashtra, India",
      "accuracy": 10
    },
    "voterPhoneNumber": "9876543210",
    "status": "completed",
    "surveyData": {
      "question1": "Answer 1",
      "question2": "Answer 2"
    },
    "notes": "Survey notes",
    "members": [
      {
        "name": "Jane Doe",
        "age": 25,
        "phoneNumber": "9876543211",
        "relationship": "Spouse",
        "isVoter": true,
        "voterId": "64a1b2c3d4e5f6789012348",
        "voterType": "Voter"
      }
    ],
    "createdAt": "2024-01-15T09:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z"
  }
}
```

### 4. **Update Survey**
```bash
PUT /api/survey/:id
```

**Request Body:**
```json
{
  "location": {
    "latitude": 18.5204,
    "longitude": 73.8567,
    "address": "Updated Address"
  },
  "voterPhoneNumber": "9876543210",
  "surveyData": {
    "question1": "Updated Answer 1",
    "question2": "Updated Answer 2"
  },
  "notes": "Updated notes",
  "members": [
    {
      "name": "Jane Doe",
      "age": 26,
      "phoneNumber": "9876543211",
      "relationship": "Spouse"
    }
  ],
  "status": "completed"
}
```

### 5. **Update Survey Status**
```bash
PATCH /api/survey/:id/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**For Verification:**
```json
{
  "status": "verified",
  "verifiedBy": "64a1b2c3d4e5f6789012349"
}
```

**For Rejection:**
```json
{
  "status": "rejected",
  "verifiedBy": "64a1b2c3d4e5f6789012349",
  "reason": "Incomplete information"
}
```

### 6. **Delete Survey**
```bash
DELETE /api/survey/:id
```

### 7. **Delete All Surveys**
```bash
DELETE /api/survey
```

### 8. **Get Survey Statistics**
```bash
GET /api/survey/stats
```

**Query Parameters:**
- `surveyorId` (optional): Filter by surveyor ID
- `voterType` (optional): Filter by voter type
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSurveys": 1000,
      "completedSurveys": 800,
      "submittedSurveys": 750,
      "verifiedSurveys": 700,
      "rejectedSurveys": 50,
      "draftSurveys": 200,
      "totalMembers": 2500,
      "avgQualityScore": 85.5,
      "avgDuration": 15.2
    },
    "byStatus": [
      { "_id": "completed", "count": 800 },
      { "_id": "submitted", "count": 750 },
      { "_id": "verified", "count": 700 }
    ],
    "byVoterType": [
      { "_id": "Voter", "count": 600 },
      { "_id": "VoterFour", "count": 400 }
    ],
    "topSurveyors": [
      {
        "_id": "64a1b2c3d4e5f6789012347",
        "surveyorName": "John Doe",
        "count": 150
      }
    ],
    "avgMembersPerSurvey": 2.5,
    "totalSurveys": 1000
  }
}
```

### 9. **Search Surveys**
```bash
GET /api/survey/search
```

**Query Parameters:**
- `q` (required): Search query
- `status` (optional): Filter by status
- `surveyorId` (optional): Filter by surveyor ID
- `voterType` (optional): Filter by voter type
- `voterPhoneNumber` (optional): Filter by voter phone number
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Records per page
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort direction

**Example:**
```bash
GET /api/survey/search?q=9876543210&status=completed&page=1&limit=20
```

### 10. **Get Surveys by Surveyor**
```bash
GET /api/survey/surveyor/:surveyorId
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Records per page
- `status` (optional): Filter by status
- `voterType` (optional): Filter by voter type
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort direction

### 11. **Get Surveys by Voter**
```bash
GET /api/survey/voter/:voterId/:voterType
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Records per page
- `status` (optional): Filter by status
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort direction

**Example:**
```bash
GET /api/survey/voter/64a1b2c3d4e5f6789012346/Voter?status=completed
```

## JavaScript Implementation Examples

### 1. **Create Survey**
```javascript
async function createSurvey(surveyData) {
  try {
    const response = await fetch('/api/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(surveyData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Survey created successfully:', result.data);
      return result.data;
    } else {
      console.error('Error creating survey:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const surveyData = {
  voterId: "64a1b2c3d4e5f6789012346",
  voterType: "Voter",
  surveyorId: "64a1b2c3d4e5f6789012347",
  location: {
    latitude: 18.5204,
    longitude: 73.8567,
    address: "Pune, Maharashtra, India",
    accuracy: 10
  },
  voterPhoneNumber: "9876543210",
  surveyData: {
    question1: "Answer 1",
    question2: "Answer 2"
  },
  notes: "Survey notes",
  members: [
    {
      name: "Jane Doe",
      age: 25,
      phoneNumber: "9876543211",
      relationship: "Spouse"
    }
  ]
};

const survey = await createSurvey(surveyData);
```

### 2. **Get Surveys with Filters**
```javascript
async function getSurveys(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.surveyorId) queryParams.append('surveyorId', filters.surveyorId);
    if (filters.voterType) queryParams.append('voterType', filters.voterType);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const response = await fetch(`/api/survey?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`Found ${result.pagination.totalCount} surveys`);
      return result;
    } else {
      console.error('Error fetching surveys:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const surveys = await getSurveys({
  page: 1,
  limit: 20,
  status: 'completed',
  voterType: 'Voter',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### 3. **Update Survey Status**
```javascript
async function updateSurveyStatus(surveyId, status, verifiedBy = null, reason = null) {
  try {
    const requestBody = { status };
    
    if (verifiedBy) requestBody.verifiedBy = verifiedBy;
    if (reason) requestBody.reason = reason;
    
    const response = await fetch(`/api/survey/${surveyId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Survey status updated successfully:', result.data);
      return result.data;
    } else {
      console.error('Error updating survey status:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const updatedSurvey = await updateSurveyStatus(
  "64a1b2c3d4e5f6789012345",
  "completed"
);

// For verification
const verifiedSurvey = await updateSurveyStatus(
  "64a1b2c3d4e5f6789012345",
  "verified",
  "64a1b2c3d4e5f6789012349"
);
```

### 4. **Get Survey Statistics**
```javascript
async function getSurveyStats(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.surveyorId) queryParams.append('surveyorId', filters.surveyorId);
    if (filters.voterType) queryParams.append('voterType', filters.voterType);
    if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
    
    const response = await fetch(`/api/survey/stats?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Survey statistics:', result.data);
      return result.data;
    } else {
      console.error('Error fetching survey statistics:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const stats = await getSurveyStats({
  voterType: 'Voter',
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31'
});
```

### 5. **Search Surveys**
```javascript
async function searchSurveys(query, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.surveyorId) queryParams.append('surveyorId', filters.surveyorId);
    if (filters.voterType) queryParams.append('voterType', filters.voterType);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const response = await fetch(`/api/survey/search?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`Found ${result.pagination.totalCount} surveys matching "${query}"`);
      return result;
    } else {
      console.error('Error searching surveys:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const searchResults = await searchSurveys('9876543210', {
  status: 'completed',
  page: 1,
  limit: 20
});
```

## Survey Status Management

### **Status Flow:**
1. **completed** - Survey created and completed (default status)
2. **submitted** - Survey submitted for review
3. **verified** - Survey approved by admin
4. **rejected** - Survey rejected by admin
5. **draft** - Survey created but not completed (manual use only)

### **Automatic Updates:**
- All surveys are created with `status: "completed"` by default
- When survey status is `completed`, `submitted`, or `verified`, the linked voter's `surveyDone` field is automatically set to `true`
- The voter's `surveyId` and `lastSurveyDate` are also updated
- The `completedAt` timestamp is automatically set when survey is created
- When a survey is deleted, the voter's survey status is reset

### **Automatic Population:**
- **Main voterId**: Automatically populated with voter details (CardNo, pno, Voter Name Eng, etc.)
- **Members' voterId**: Each member's voterId is also automatically populated with full voter details
- **surveyorId**: Populated with surveyor details (fullName, userId, pno)
- **verifiedBy**: Populated with admin email when applicable

**Populated Fields in Response:**

**For Voter Collection:**
```json
{
  "voterId": {
    "_id": "68dd9aa890752b2d27b7ed84",
    "CardNo": "TBZ4771515",
    "CodeNo": null,
    "pno": "3",
    "Voter Name Eng": "John Doe",
    "Sex": "Male",
    "Age": 62
  },
  "members": [
    {
      "name": "Jane Doe",
      "voterId": {
        "_id": "68dd9a8090752b2d27b779d1",
        "CardNo": "TBZ3900677",
        "CodeNo": null,
        "pno": "3",
        "Voter Name Eng": "Jane Doe"
      }
    }
  ]
}
```

**For VoterFour Collection:**
```json
{
  "voterId": {
    "_id": "68dd9c3533b43227162d3fc7",
    "CardNo": null,
    "CodeNo": "FGD1246370",
    "pno": "4",
    "Voter Name Eng": "John Doe",
    "Sex": "Male",
    "Age": 62
  },
  "members": [
    {
      "name": "Jane Doe",
      "voterId": {
        "_id": "68dd9c1e33b43227162cf352",
        "CardNo": null,
        "CodeNo": "FGD1246371",
        "pno": "4",
        "Voter Name Eng": "Jane Doe"
      }
    }
  ]
}
```

## Data Validation

### **Required Fields:**
- `voterId` - Must exist in Voter or VoterFour collection
- `voterType` - Must be "Voter" or "VoterFour"
- `surveyorId` - Must exist in User collection
- `location.latitude` - Must be between -90 and 90
- `location.longitude` - Must be between -180 and 180
- `voterPhoneNumber` - Must be 10 digits

### **Member Validation:**
- `name` - Required
- `age` - Required, must be between 0 and 150
- `phoneNumber` - Required, must be 10 digits

### **Phone Number Format:**
- Must be exactly 10 digits
- Only numbers allowed
- Example: "9876543210"

## Error Handling

### **Common Errors:**
```json
{
  "success": false,
  "message": "Voter ID, voter type, surveyor ID, location, and voter phone number are required"
}
```

```json
{
  "success": false,
  "message": "Survey already exists for this voter"
}
```

```json
{
  "success": false,
  "message": "Voter phone number must be 10 digits"
}
```

```json
{
  "success": false,
  "message": "Survey not found"
}
```

## Best Practices

### 1. **Survey Creation:**
- Always validate GPS coordinates before submission
- Ensure phone numbers are in correct format
- Validate member information before adding
- Use appropriate status transitions

### 2. **Data Management:**
- Use pagination for large result sets
- Implement proper error handling
- Cache frequently accessed data
- Use appropriate indexes for performance

### 3. **Security:**
- Validate all input data
- Use proper authentication for sensitive operations
- Implement rate limiting for API calls
- Sanitize user inputs

### 4. **Performance:**
- Use appropriate page sizes (20-100 records)
- Implement caching for statistics
- Use database indexes effectively
- Monitor API response times

## Integration with Other APIs

### **Voter Integration:**
- Surveys automatically update voter `surveyDone` status
- Voter search can include survey status
- Voter statistics include survey completion rates

### **User Integration:**
- Surveyors are linked to User accounts
- User statistics include survey performance
- Surveyor authentication through User API

### **Analytics Integration:**
- Survey data contributes to overall analytics
- Location data for geographic analysis
- Member data for demographic analysis

The Survey API provides a comprehensive solution for managing surveys with full integration into the existing voter management system! 📊
