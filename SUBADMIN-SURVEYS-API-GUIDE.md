# Sub-Admin Surveys API Guide

Complete documentation for fetching surveys of voters assigned to a sub-admin.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Endpoint Details](#endpoint-details)
- [Request Parameters](#request-parameters)
- [Response Format](#response-format)
- [Usage Examples](#usage-examples)
- [Frontend Integration](#frontend-integration)
- [Error Handling](#error-handling)
- [Performance Tips](#performance-tips)

---

## 🎯 Overview

This API endpoint allows you to retrieve all surveys conducted for voters that are assigned to a specific sub-admin. The response includes:

- ✅ Voter name (English & Hindi)
- ✅ Phone number
- ✅ Location data (GPS coordinates)
- ✅ Family members information
- ✅ Survey status and timestamps
- ✅ Voter details (AC, Part, Booth)

**Key Features:**
- Returns ALL surveys (not just those with location)
- Supports pagination for large datasets
- Multiple filtering options (status, voter type, date range)
- Works for both Voter and VoterFour collections

---

## 🔗 Endpoint Details

### **URL:**
```
GET /api/subadmin/voters/surveys
```

### **Authentication:**
Currently open (authentication middleware commented out). Can be protected with sub-admin authentication.

### **Base URL:**
```
https://voter.myserverdevops.com/api/subadmin/voters/surveys
```

---

## 📝 Request Parameters

### **Required Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `subAdminId` | String | The sub-admin's unique ID (MongoDB ObjectId) |

### **Optional Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number for pagination |
| `limit` | Number | 20 | Number of results per page |
| `voterType` | String | 'all' | Filter by voter collection: 'Voter', 'VoterFour', or 'all' |
| `status` | String | - | Filter by survey status: 'completed', 'draft', 'submitted', 'verified', 'rejected' |
| `dateFrom` | Date | - | Filter surveys created from this date (ISO format: YYYY-MM-DD) |
| `dateTo` | Date | - | Filter surveys created until this date (ISO format: YYYY-MM-DD) |
| `sortBy` | String | 'createdAt' | Field to sort by |
| `sortOrder` | String | 'desc' | Sort order: 'asc' or 'desc' |

---

## 📊 Response Format

### **Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "surveyId": "68e77d94e6f4f433e0c5fa78",
      "voterName": "Dorage Chandrakant Narayan",
      "voterNameHindi": "दोरगे चंद्रकांत नारायण",
      "phoneNumber": "9860738820",
      "location": {
        "latitude": 18.5613705,
        "longitude": 73.9408248,
        "accuracy": 14.287,
        "address": null
      },
      "members": [
        {
          "name": "jyoti chandrakant dorge",
          "age": 43,
          "phoneNumber": "9860738820",
          "relationship": "Family Member",
          "isVoter": true
        }
      ],
      "membersCount": 1,
      "status": "completed",
      "completedAt": "2025-10-09T09:17:08.373Z",
      "createdAt": "2025-10-09T09:17:08.373Z",
      "voterDetails": {
        "ac": "240",
        "part": null,
        "booth": "खराडी चाटे स्कूल सर्वे न १३५ श्री पार्क सोसायटी खोली क्र.3 नगर रोड"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCount": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  },
  "meta": {
    "totalVoters": 40,
    "totalSurveys": 3,
    "filters": {
      "voterType": "all",
      "status": "all",
      "dateFrom": null,
      "dateTo": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

### **Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "subAdminId is required (provide as query parameter or use authentication)"
}
```

### **No Data Response (200 OK):**

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 0,
    "totalCount": 0,
    "hasNextPage": false,
    "hasPrevPage": false,
    "limit": 20
  },
  "meta": {
    "totalVoters": 0,
    "totalSurveys": 0,
    "message": "No voters assigned to this sub-admin"
  }
}
```

---

## 💡 Usage Examples

### **Example 1: Get All Surveys (Basic)**

**Request:**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc
```

**cURL:**
```bash
curl -X GET "https://voter.myserverdevops.com/api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc"
```

---

### **Example 2: Get Only Completed Surveys**

**Request:**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&status=completed
```

**cURL:**
```bash
curl -X GET "https://voter.myserverdevops.com/api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&status=completed"
```

---

### **Example 3: Filter by Voter Type**

**Request (VoterFour only):**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&voterType=VoterFour
```

**Request (Voter only):**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&voterType=Voter
```

---

### **Example 4: Paginated Results**

**Request (Page 1, 10 results):**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&page=1&limit=10
```

**Request (Page 2, 10 results):**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&page=2&limit=10
```

**cURL:**
```bash
curl -X GET "https://voter.myserverdevops.com/api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&page=1&limit=10"
```

---

### **Example 5: Filter by Date Range**

**Request:**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&dateFrom=2025-10-01&dateTo=2025-10-10
```

**cURL:**
```bash
curl -X GET "https://voter.myserverdevops.com/api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&dateFrom=2025-10-01&dateTo=2025-10-10"
```

---

### **Example 6: Sort by Completion Date (Newest First)**

**Request:**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&sortBy=completedAt&sortOrder=desc
```

---

### **Example 7: Combined Filters**

**Request:**
```bash
GET /api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&status=completed&voterType=VoterFour&page=1&limit=50&dateFrom=2025-10-01
```

**cURL:**
```bash
curl -X GET "https://voter.myserverdevops.com/api/subadmin/voters/surveys?subAdminId=68e8233642e1ec6367dd11cc&status=completed&voterType=VoterFour&page=1&limit=50&dateFrom=2025-10-01"
```

---

## 🎨 Frontend Integration

### **JavaScript/Fetch API:**

```javascript
async function getAssignedVotersSurveys(subAdminId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = null,
    voterType = 'all',
    dateFrom = null,
    dateTo = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  
  const params = new URLSearchParams({
    subAdminId: subAdminId,
    page: page,
    limit: limit,
    voterType: voterType,
    sortBy: sortBy,
    sortOrder: sortOrder
  });
  
  if (status) params.append('status', status);
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  
  try {
    const response = await fetch(`/api/subadmin/voters/surveys?${params}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`Total Surveys: ${data.meta.totalSurveys}`);
      console.log(`Total Voters: ${data.meta.totalVoters}`);
      
      data.data.forEach(survey => {
        console.log(`${survey.voterName} - ${survey.phoneNumber}`);
        console.log(`Location: ${survey.location?.latitude}, ${survey.location?.longitude}`);
        console.log(`Members: ${survey.membersCount}`);
      });
      
      return data;
    } else {
      console.error('Error:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// Usage Examples:
// Get all surveys
getAssignedVotersSurveys('68e8233642e1ec6367dd11cc');

// Get completed surveys only
getAssignedVotersSurveys('68e8233642e1ec6367dd11cc', { 
  status: 'completed' 
});

// Get paginated results
getAssignedVotersSurveys('68e8233642e1ec6367dd11cc', { 
  page: 1, 
  limit: 10 
});

// Get surveys within date range
getAssignedVotersSurveys('68e8233642e1ec6367dd11cc', { 
  dateFrom: '2025-10-01', 
  dateTo: '2025-10-10' 
});
```

---

### **React Component Example:**

```jsx
import React, { useState, useEffect } from 'react';

function SubAdminSurveys({ subAdminId }) {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    voterType: 'all'
  });

  useEffect(() => {
    fetchSurveys();
  }, [page, filters]);

  const fetchSurveys = async () => {
    setLoading(true);
    
    const params = new URLSearchParams({
      subAdminId: subAdminId,
      page: page,
      limit: 20,
      voterType: filters.voterType
    });
    
    if (filters.status) params.append('status', filters.status);
    
    const response = await fetch(`/api/subadmin/voters/surveys?${params}`);
    const data = await response.json();
    
    if (data.success) {
      setSurveys(data.data);
      setTotalPages(data.pagination.totalPages);
    }
    
    setLoading(false);
  };

  return (
    <div className="surveys-container">
      <h2>Assigned Voters Surveys</h2>
      
      {/* Filters */}
      <div className="filters">
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
        </select>
        
        <select 
          value={filters.voterType} 
          onChange={(e) => setFilters({...filters, voterType: e.target.value})}
        >
          <option value="all">All Voters</option>
          <option value="Voter">Voter</option>
          <option value="VoterFour">VoterFour</option>
        </select>
      </div>
      
      {/* Surveys List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="surveys-list">
            {surveys.map(survey => (
              <div key={survey.surveyId} className="survey-card">
                <h3>{survey.voterName}</h3>
                <p>Phone: {survey.phoneNumber}</p>
                <p>Status: <span className={`badge ${survey.status}`}>{survey.status}</span></p>
                
                {survey.location && (
                  <p>Location: {survey.location.latitude}, {survey.location.longitude}</p>
                )}
                
                <p>Members: {survey.membersCount}</p>
                {survey.members.map((member, idx) => (
                  <div key={idx} className="member">
                    - {member.name} ({member.age} years)
                  </div>
                ))}
                
                <p>Booth: {survey.voterDetails.booth}</p>
                <small>Created: {new Date(survey.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => setPage(p => p - 1)} 
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SubAdminSurveys;
```

---

### **Angular Service Example:**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = '/api/subadmin/voters/surveys';

  constructor(private http: HttpClient) {}

  getAssignedVotersSurveys(
    subAdminId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      voterType?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Observable<any> {
    let params = new HttpParams()
      .set('subAdminId', subAdminId)
      .set('page', options.page?.toString() || '1')
      .set('limit', options.limit?.toString() || '20')
      .set('voterType', options.voterType || 'all');

    if (options.status) {
      params = params.set('status', options.status);
    }
    if (options.dateFrom) {
      params = params.set('dateFrom', options.dateFrom);
    }
    if (options.dateTo) {
      params = params.set('dateTo', options.dateTo);
    }

    return this.http.get(this.apiUrl, { params });
  }
}

// Usage in component:
this.surveyService.getAssignedVotersSurveys('68e8233642e1ec6367dd11cc', {
  page: 1,
  limit: 20,
  status: 'completed'
}).subscribe(response => {
  if (response.success) {
    this.surveys = response.data;
    this.totalPages = response.pagination.totalPages;
  }
});
```

---

## ⚠️ Error Handling

### **Common Errors:**

| Status Code | Error | Solution |
|-------------|-------|----------|
| 400 | `subAdminId is required` | Provide `subAdminId` in query parameters |
| 404 | Sub-admin not found | Verify the `subAdminId` is valid |
| 500 | Server error | Check server logs, contact support |

### **Error Handling Example:**

```javascript
async function fetchSurveysWithErrorHandling(subAdminId) {
  try {
    const response = await fetch(
      `/api/subadmin/voters/surveys?subAdminId=${subAdminId}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 400) {
        alert('Please provide a valid sub-admin ID');
      } else if (response.status === 404) {
        alert('Sub-admin not found');
      } else {
        alert('Server error. Please try again later.');
      }
      return null;
    }
    
    if (data.success) {
      return data;
    } else {
      alert(data.message);
      return null;
    }
    
  } catch (error) {
    console.error('Network error:', error);
    alert('Failed to fetch surveys. Check your connection.');
    return null;
  }
}
```

---

## 🚀 Performance Tips

### **1. Use Pagination**
Always use pagination for large datasets to improve performance:

```javascript
// Good: Paginated
?subAdminId=xxx&page=1&limit=20

// Bad: Fetching all at once
?subAdminId=xxx&limit=10000
```

### **2. Filter Early**
Apply filters on the server side rather than client side:

```javascript
// Good: Server-side filtering
?subAdminId=xxx&status=completed&voterType=VoterFour

// Bad: Fetch all, filter in frontend
?subAdminId=xxx (then filter 10000 results in JS)
```

### **3. Index Important Fields**
The following fields are indexed for fast queries:
- `voterId`
- `voterType`
- `status`
- `createdAt`

### **4. Use Date Ranges**
Limit results with date ranges when possible:

```javascript
// Good: Specific date range
?subAdminId=xxx&dateFrom=2025-10-01&dateTo=2025-10-10

// Less efficient: All time data
?subAdminId=xxx
```

### **5. Optimize Member Data**
If you don't need member details, consider using the map-data endpoint instead (lighter payload).

---

## 📈 Response Data Fields

### **Survey Object Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `surveyId` | String | Unique survey identifier |
| `voterName` | String | Voter's name in English |
| `voterNameHindi` | String | Voter's name in Hindi |
| `phoneNumber` | String | Contact phone number |
| `location` | Object | GPS location data (if available) |
| `location.latitude` | Number | GPS latitude |
| `location.longitude` | Number | GPS longitude |
| `location.accuracy` | Number | GPS accuracy in meters |
| `location.address` | String | Address text (if available) |
| `members` | Array | Family members list |
| `membersCount` | Number | Total number of members |
| `status` | String | Survey status (completed, draft, etc.) |
| `completedAt` | Date | When survey was completed |
| `createdAt` | Date | When survey was created |
| `voterDetails` | Object | Additional voter information |
| `voterDetails.ac` | String | Assembly Constituency number |
| `voterDetails.part` | String | Part number |
| `voterDetails.booth` | String | Polling booth information |

### **Member Object Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Member's name |
| `age` | Number | Member's age |
| `phoneNumber` | String | Member's phone number |
| `relationship` | String | Relationship to voter |
| `isVoter` | Boolean | Whether member is a registered voter |

---

## 🔄 Comparison with Other Endpoints

### **vs. Map Data Endpoint:**

| Feature | `/surveys` (This) | `/map-data` |
|---------|------------------|-------------|
| Returns all surveys | ✅ Yes | ❌ Only with location |
| Location required | ❌ No | ✅ Yes |
| Includes voter details | ✅ Yes | ✅ Yes |
| Includes members | ✅ Yes | ✅ Yes |
| Pagination | ✅ Yes | ❌ No (limited) |
| Best for | List view, reports | Map plotting |

**Use `/surveys`** when:
- You need ALL surveys (with or without GPS)
- Building a list/table view
- Generating reports
- Need pagination for large datasets

**Use `/map-data`** when:
- Plotting surveys on a map
- Only interested in surveys with location
- Need lightweight response for mapping

---

## 📚 Related Endpoints

- **`GET /api/subadmin/voters`** - Get assigned voters (without surveys)
- **`GET /api/subadmin/voters/map-data`** - Get surveys with location for map
- **`GET /api/subadmin/voters/stats`** - Get statistics of assigned voters
- **`GET /api/survey/:id`** - Get single survey details

---

## 🆘 Support

For issues or questions:
1. Check server logs for errors
2. Verify `subAdminId` is valid
3. Ensure voters are assigned to the sub-admin
4. Check if surveys exist for assigned voters

---

## 📝 Changelog

### Version 1.0.0 (2025-10-10)
- Initial release
- Support for all survey types (with/without location)
- Pagination support
- Multiple filter options
- Voter and VoterFour collection support

---

**Last Updated:** October 10, 2025  
**API Version:** 1.0.0  
**Endpoint:** `/api/subadmin/voters/surveys`

