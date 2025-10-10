# Merged Voters API - Complete Guide

Complete documentation for the unified/merged voter API that seamlessly handles both Voter and VoterFour collections with a single set of endpoints.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Read Operations](#read-operations)
3. [Search Operations](#search-operations)
4. [Update Operations](#update-operations)
5. [Delete Operations](#delete-operations)
6. [Statistics](#statistics)
7. [Frontend Integration](#frontend-integration)
8. [Migration from Separate APIs](#migration-from-separate-apis)

---

## Overview

### What is the Merged API?

The **Merged Voters API** provides a **unified interface** to work with both Voter and VoterFour collections without worrying about which collection a voter belongs to.

### Key Benefits

✅ **Single endpoint** for both collections  
✅ **Automatic collection detection** based on voterType parameter  
✅ **Consistent response format** with voterType field  
✅ **Combined search** across both collections  
✅ **Unified statistics** showing combined data  
✅ **No need to remember** separate endpoints  

### Base URL
```
/api/voters
```

---

## Read Operations

### 1. Get All Voters (Combined)

Get voters from both collections with pagination, filtering, and search.

**Endpoint:**
```
GET /api/voters/all
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|----------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Results per page |
| `voterType` | string | 'all' | 'all', 'Voter', or 'VoterFour' |
| `search` | string | - | Search term |
| `nameOnly` | boolean | false | Search names only |
| `sortBy` | string | 'Voter Name Eng' | Field to sort by |
| `sortOrder` | string | 'asc' | 'asc' or 'desc' |
| `isPaid` | boolean | - | Filter by payment status |
| `isVisited` | boolean | - | Filter by visit status |
| `AC` | string | - | Filter by AC |
| `Part` | string | - | Filter by Part |

**Examples:**

```bash
# Get all voters from both collections
curl "http://localhost:3000/api/voters/all?limit=100"

# Get only Voter collection
curl "http://localhost:3000/api/voters/all?voterType=Voter&limit=50"

# Get only VoterFour collection
curl "http://localhost:3000/api/voters/all?voterType=VoterFour&limit=50"

# Search across both collections
curl "http://localhost:3000/api/voters/all?search=Sharma&limit=50"

# Filter by status
curl "http://localhost:3000/api/voters/all?isPaid=false&isVisited=false&limit=100"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68dd9a8c90752b2d27b79da9",
      "Voter Name Eng": "Arati Jagtap",
      "AC": "208",
      "voterType": "Voter",
      "CardNo": "TBZ5096904",
      // ... other fields
    },
    {
      "_id": "68dd9c3733b43227162d4b22",
      "Voter Name Eng": "Nalage Sangita Prashant",
      "AC": "242",
      "voterType": "VoterFour",
      "CodeNo": "TBZ9089863",
      // ... other fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1503,
    "totalCount": 150435,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 100
  }
}
```

---

### 2. Get Single Voter (Merged)

Get a specific voter from either collection.

**Endpoint:**
```
GET /api/voters/merged/:voterId/:voterType
```

**Path Parameters:**
- `voterId` - MongoDB ObjectId
- `voterType` - 'Voter' or 'VoterFour'

**Examples:**

```bash
# Get Voter
curl "http://localhost:3000/api/voters/merged/68dd9a8c90752b2d27b79da9/Voter"

# Get VoterFour
curl "http://localhost:3000/api/voters/merged/68dd9c3733b43227162d4b22/VoterFour"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68dd9a8c90752b2d27b79da9",
    "Voter Name Eng": "Arati Jagtap",
    "Voter Name": "आरती जगताप",
    "AC": "208",
    "Part": "12",
    "CardNo": "TBZ5096904",
    "Age": 22,
    "Sex": "Female",
    "isPaid": false,
    "isVisited": false,
    "voterType": "Voter",
    // ... all other fields
  }
}
```

---

## Search Operations

### 1. Search Across Both Collections (GET)

**Endpoint:**
```
GET /api/voters/all/search
```

**Query Parameters:** Same as "Get All Voters"

**Example:**
```bash
curl "http://localhost:3000/api/voters/all/search?q=Sharma&limit=50"
```

---

### 2. Advanced Search (POST) - Recommended

More powerful search with all filters in request body.

**Endpoint:**
```
POST /api/voters/merged/search
```

**Request Body:**
```json
{
  "search": "Sharma",
  "voterType": "all",
  "page": 1,
  "limit": 50,
  "sortBy": "Voter Name Eng",
  "sortOrder": "asc",
  "AC": "208",
  "Part": "5",
  "Sex": "Male",
  "ageMin": 25,
  "ageMax": 45,
  "isPaid": false,
  "isVisited": false,
  "nameOnly": false
}
```

**Examples:**

**Search "Sharma" in both collections:**
```bash
curl -X POST "http://localhost:3000/api/voters/merged/search" \
  -H "Content-Type: application/json" \
  -d '{
    "search": "Sharma",
    "voterType": "all",
    "limit": 50
  }'
```

**Complex search with filters:**
```bash
curl -X POST "http://localhost:3000/api/voters/merged/search" \
  -H "Content-Type: application/json" \
  -d '{
    "search": "Kumar",
    "voterType": "all",
    "AC": "208",
    "Part": "5",
    "Sex": "Male",
    "ageMin": 30,
    "ageMax": 50,
    "isPaid": false,
    "nameOnly": false,
    "sortBy": "Age",
    "sortOrder": "desc",
    "limit": 100
  }'
```

**Name-only search (faster):**
```bash
curl -X POST "http://localhost:3000/api/voters/merged/search" \
  -H "Content-Type: application/json" \
  -d '{
    "search": "Patel",
    "nameOnly": true,
    "limit": 50
  }'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68dd9a8c...",
      "Voter Name Eng": "Ramesh Kumar Sharma",
      "voterType": "Voter",
      "AC": "208",
      "isPaid": false,
      "isVisited": false
      // ... other fields
    },
    {
      "_id": "68dd9c37...",
      "Voter Name Eng": "Priya Sharma",
      "voterType": "VoterFour",
      "AC": "242",
      "isPaid": false,
      "isVisited": false
      // ... other fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 245,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 50
  },
  "filters": {
    "search": "Sharma",
    "voterType": "all",
    "AC": "208",
    // ... all applied filters
  }
}
```

---

## Update Operations

### 1. Update Voter (Any Field)

**Endpoint:**
```
PUT /api/voters/merged/:voterId/:voterType
```

**Request Body:**
```json
{
  "Voter Name Eng": "Updated Name",
  "Age": 36,
  "Address": "New Address",
  "isPaid": true,
  "isVisited": true
}
```

**Examples:**

```bash
# Update Voter
curl -X PUT "http://localhost:3000/api/voters/merged/68dd9a8c.../Voter" \
  -H "Content-Type: application/json" \
  -d '{
    "Age": 36,
    "Address": "Updated Address",
    "isPaid": true
  }'

# Update VoterFour
curl -X PUT "http://localhost:3000/api/voters/merged/68dd9c37.../VoterFour" \
  -H "Content-Type: application/json" \
  -d '{
    "isVisited": true,
    "isPaid": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Voter updated successfully",
  "data": {
    "_id": "68dd9a8c...",
    "Voter Name Eng": "Updated Name",
    "Age": 36,
    "voterType": "Voter",
    // ... updated fields
  }
}
```

---

### 2. Update Status Only

**Endpoint:**
```
PATCH /api/voters/merged/:voterId/:voterType/status
```

**Request Body:**
```json
{
  "isPaid": true,
  "isVisited": true
}
```

**Examples:**

```bash
# Mark as paid
curl -X PATCH "http://localhost:3000/api/voters/merged/68dd9a8c.../Voter/status" \
  -H "Content-Type: application/json" \
  -d '{"isPaid": true}'

# Mark as visited
curl -X PATCH "http://localhost:3000/api/voters/merged/68dd9c37.../VoterFour/status" \
  -H "Content-Type: application/json" \
  -d '{"isVisited": true}'

# Mark as both paid and visited
curl -X PATCH "http://localhost:3000/api/voters/merged/68dd9a8c.../Voter/status" \
  -H "Content-Type: application/json" \
  -d '{
    "isPaid": true,
    "isVisited": true
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Voter status updated successfully",
  "data": {
    "_id": "68dd9a8c...",
    "Voter Name Eng": "Arati Jagtap",
    "voterType": "Voter",
    "isPaid": true,
    "isVisited": true,
    "lastUpdated": "2025-10-09T12:00:00.000Z"
  }
}
```

---

## Delete Operations

### Delete Voter from Either Collection

**Endpoint:**
```
DELETE /api/voters/merged/:voterId/:voterType
```

**Examples:**

```bash
# Delete Voter
curl -X DELETE "http://localhost:3000/api/voters/merged/68dd9a8c.../Voter"

# Delete VoterFour
curl -X DELETE "http://localhost:3000/api/voters/merged/68dd9c37.../VoterFour"
```

**Response:**
```json
{
  "success": true,
  "message": "Voter deleted successfully",
  "data": {
    "voterId": "68dd9a8c...",
    "voterType": "Voter",
    "voterName": "Arati Jagtap"
  }
}
```

---

## Statistics

### Get Combined Statistics

**Endpoint:**
```
GET /api/voters/all/stats
```

**Example:**
```bash
curl "http://localhost:3000/api/voters/all/stats"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "voter": {
      "total": 73286,
      "active": 73286,
      "inactive": 0,
      "paid": 1,
      "unpaid": 73285,
      "paidPercentage": "0.00",
      "visited": 0,
      "unvisited": 73286,
      "visitedPercentage": "0.00",
      "avgAge": 41
    },
    "voterFour": {
      "total": 77149,
      "active": 77149,
      "inactive": 0,
      "paid": 0,
      "unpaid": 77149,
      "paidPercentage": "0.00",
      "visited": 0,
      "unvisited": 77149,
      "visitedPercentage": "0.00",
      "avgAge": 43
    },
    "combined": {
      "total": 150435,
      "active": 150435,
      "inactive": 0,
      "paid": 1,
      "unpaid": 150434,
      "paidPercentage": "0.00",
      "visited": 0,
      "unvisited": 150435,
      "visitedPercentage": "0.00",
      "avgAge": 42
    }
  }
}
```

---

## Frontend Integration

### React Component - Merged Voter Manager

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MergedVoterManager() {
  const [voters, setVoters] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    search: '',
    voterType: 'all',
    AC: '',
    Part: '',
    Sex: '',
    isPaid: undefined,
    isVisited: undefined,
    ageMin: '',
    ageMax: '',
    nameOnly: false,
    page: 1,
    limit: 50,
    sortBy: 'Voter Name Eng',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});

  // Load voters with search
  const loadVoters = async () => {
    try {
      // Remove empty/undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(searchFilters).filter(([_, v]) => v !== '' && v !== undefined)
      );

      const response = await axios.post('/api/voters/merged/search', cleanFilters);
      
      setVoters(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading voters:', error);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await axios.get('/api/voters/all/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Update voter status
  const updateStatus = async (voterId, voterType, isPaid, isVisited) => {
    try {
      await axios.patch(
        `/api/voters/merged/${voterId}/${voterType}/status`,
        { isPaid, isVisited }
      );
      
      alert('Status updated successfully!');
      loadVoters();
      loadStats();
    } catch (error) {
      alert('Error updating status: ' + error.response.data.message);
    }
  };

  // Get voter details
  const getVoterDetails = async (voterId, voterType) => {
    try {
      const response = await axios.get(`/api/voters/merged/${voterId}/${voterType}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting voter:', error);
    }
  };

  useEffect(() => {
    loadVoters();
    loadStats();
  }, [searchFilters]);

  return (
    <div className="merged-voter-manager">
      <h1>Voter Management (Unified)</h1>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <h3>Total Voters</h3>
          <p className="big-number">{stats.combined?.total.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Paid</h3>
          <p className="big-number">{stats.combined?.paid}</p>
          <small>{stats.combined?.paidPercentage}%</small>
        </div>
        <div className="stat-card">
          <h3>Visited</h3>
          <p className="big-number">{stats.combined?.visited}</p>
          <small>{stats.combined?.visitedPercentage}%</small>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="big-number">{stats.combined?.unpaid}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search voters..."
          value={searchFilters.search}
          onChange={(e) => setSearchFilters({
            ...searchFilters,
            search: e.target.value,
            page: 1
          })}
        />

        <select
          value={searchFilters.voterType}
          onChange={(e) => setSearchFilters({
            ...searchFilters,
            voterType: e.target.value,
            page: 1
          })}
        >
          <option value="all">All Collections</option>
          <option value="Voter">Voter Only</option>
          <option value="VoterFour">VoterFour Only</option>
        </select>

        <input
          type="text"
          placeholder="AC"
          value={searchFilters.AC}
          onChange={(e) => setSearchFilters({
            ...searchFilters,
            AC: e.target.value,
            page: 1
          })}
        />

        <select
          value={searchFilters.Sex}
          onChange={(e) => setSearchFilters({
            ...searchFilters,
            Sex: e.target.value,
            page: 1
          })}
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select
          value={searchFilters.isPaid === undefined ? '' : searchFilters.isPaid}
          onChange={(e) => setSearchFilters({
            ...searchFilters,
            isPaid: e.target.value === '' ? undefined : e.target.value === 'true',
            page: 1
          })}
        >
          <option value="">All Payment Status</option>
          <option value="true">Paid Only</option>
          <option value="false">Unpaid Only</option>
        </select>

        <select
          value={searchFilters.isVisited === undefined ? '' : searchFilters.isVisited}
          onChange={(e) => setSearchFilters({
            ...searchFilters,
            isVisited: e.target.value === '' ? undefined : e.target.value === 'true',
            page: 1
          })}
        >
          <option value="">All Visit Status</option>
          <option value="true">Visited Only</option>
          <option value="false">Unvisited Only</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={searchFilters.nameOnly}
            onChange={(e) => setSearchFilters({
              ...searchFilters,
              nameOnly: e.target.checked
            })}
          />
          Search names only (faster)
        </label>
      </div>

      {/* Voter List */}
      <table className="voter-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>AC</th>
            <th>Part</th>
            <th>Age</th>
            <th>Sex</th>
            <th>Identifier</th>
            <th>Paid</th>
            <th>Visited</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {voters.map(voter => (
            <tr key={`${voter._id}-${voter.voterType}`}>
              <td>{voter['Voter Name Eng']}</td>
              <td>
                <span className={`badge ${voter.voterType.toLowerCase()}`}>
                  {voter.voterType}
                </span>
              </td>
              <td>{voter.AC}</td>
              <td>{voter.Part}</td>
              <td>{voter.Age}</td>
              <td>{voter.Sex}</td>
              <td>{voter.CardNo || voter.CodeNo}</td>
              <td>
                <button
                  className={voter.isPaid ? 'btn-success' : 'btn-warning'}
                  onClick={() => updateStatus(voter._id, voter.voterType, !voter.isPaid, undefined)}
                >
                  {voter.isPaid ? '✅ Paid' : '❌ Unpaid'}
                </button>
              </td>
              <td>
                <button
                  className={voter.isVisited ? 'btn-success' : 'btn-warning'}
                  onClick={() => updateStatus(voter._id, voter.voterType, undefined, !voter.isVisited)}
                >
                  {voter.isVisited ? '✅ Visited' : '❌ Unvisited'}
                </button>
              </td>
              <td>
                <button onClick={() => getVoterDetails(voter._id, voter.voterType)}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setSearchFilters({...searchFilters, page: searchFilters.page - 1})}
          disabled={!pagination.hasPrevPage}
        >
          Previous
        </button>
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <span>({pagination.totalCount.toLocaleString()} total)</span>
        <button
          onClick={() => setSearchFilters({...searchFilters, page: searchFilters.page + 1})}
          disabled={!pagination.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default MergedVoterManager;
```

---

## Complete API Reference

### Read Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/voters/all` | Get all voters from both collections |
| GET | `/api/voters/all/search` | Search across both collections |
| GET | `/api/voters/all/stats` | Get combined statistics |
| GET | `/api/voters/merged/:voterId/:voterType` | Get single voter |
| POST | `/api/voters/merged/search` | Advanced search with POST |

### Update Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PUT | `/api/voters/merged/:voterId/:voterType` | Update any voter field |
| PATCH | `/api/voters/merged/:voterId/:voterType/status` | Update status only |

### Delete Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| DELETE | `/api/voters/merged/:voterId/:voterType` | Delete voter |

---

## Use Cases

### Use Case 1: Universal Voter Search

**Search for "Sharma" across both collections:**

```javascript
const axios = require('axios');

async function searchAllVoters(searchTerm) {
  const response = await axios.post('/api/voters/merged/search', {
    search: searchTerm,
    voterType: 'all',
    limit: 100
  });

  console.log(`Found ${response.data.pagination.totalCount} voters`);
  
  response.data.data.forEach(voter => {
    console.log(`${voter['Voter Name Eng']} (${voter.voterType}) - ${voter.CardNo || voter.CodeNo}`);
  });
  
  return response.data.data;
}

searchAllVoters('Sharma');
```

### Use Case 2: Update Status Across Collections

**Mark voters as paid regardless of collection:**

```javascript
async function markVoterAsPaid(voterId, voterType) {
  try {
    const response = await axios.patch(
      `/api/voters/merged/${voterId}/${voterType}/status`,
      { isPaid: true }
    );
    
    console.log(`Marked ${response.data.data['Voter Name Eng']} as paid`);
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
}

// Works for both collections
markVoterAsPaid('68dd9a8c...', 'Voter');
markVoterAsPaid('68dd9c37...', 'VoterFour');
```

### Use Case 3: Unified Voter Details Page

**Get voter regardless of collection:**

```javascript
async function loadVoterDetails(voterId, voterType) {
  const response = await axios.get(`/api/voters/merged/${voterId}/${voterType}`);
  const voter = response.data.data;
  
  // Display voter details (same component for both types)
  return {
    id: voter._id,
    name: voter['Voter Name Eng'],
    nameHindi: voter['Voter Name'],
    ac: voter.AC,
    part: voter.Part,
    age: voter.Age,
    sex: voter.Sex,
    identifier: voter.CardNo || voter.CodeNo,
    isPaid: voter.isPaid,
    isVisited: voter.isVisited,
    collectionType: voter.voterType
  };
}
```

---

## Migration from Separate APIs

### Before (Separate Endpoints)

```javascript
// Had to check voter type and use different endpoints
if (voterType === 'Voter') {
  voter = await axios.get(`/api/voter/${voterId}`);
  await axios.patch(`/api/voter/${voterId}/status`, { isPaid: true });
} else {
  voter = await axios.get(`/api/voterfour/${voterId}`);
  await axios.patch(`/api/voterfour/${voterId}/status`, { isPaid: true });
}
```

### After (Merged API)

```javascript
// Single endpoint works for both!
voter = await axios.get(`/api/voters/merged/${voterId}/${voterType}`);
await axios.patch(`/api/voters/merged/${voterId}/${voterType}/status`, { isPaid: true });
```

---

## JavaScript/Axios Helper Functions

```javascript
const axios = require('axios');

const MergedVoterAPI = {
  // Get voter
  async getVoter(voterId, voterType) {
    const response = await axios.get(`/api/voters/merged/${voterId}/${voterType}`);
    return response.data.data;
  },

  // Update voter
  async updateVoter(voterId, voterType, updates) {
    const response = await axios.put(
      `/api/voters/merged/${voterId}/${voterType}`,
      updates
    );
    return response.data.data;
  },

  // Update status
  async updateStatus(voterId, voterType, isPaid, isVisited) {
    const response = await axios.patch(
      `/api/voters/merged/${voterId}/${voterType}/status`,
      { isPaid, isVisited }
    );
    return response.data.data;
  },

  // Delete voter
  async deleteVoter(voterId, voterType) {
    const response = await axios.delete(`/api/voters/merged/${voterId}/${voterType}`);
    return response.data;
  },

  // Search voters
  async search(filters) {
    const response = await axios.post('/api/voters/merged/search', filters);
    return response.data;
  },

  // Get statistics
  async getStats() {
    const response = await axios.get('/api/voters/all/stats');
    return response.data.data;
  }
};

// Usage Examples
(async () => {
  // Search
  const searchResults = await MergedVoterAPI.search({
    search: 'Sharma',
    voterType: 'all',
    AC: '208',
    isPaid: false,
    limit: 50
  });

  // Update status
  await MergedVoterAPI.updateStatus('68dd9a8c...', 'Voter', true, true);

  // Get voter details
  const voter = await MergedVoterAPI.getVoter('68dd9c37...', 'VoterFour');

  // Get statistics
  const stats = await MergedVoterAPI.getStats();
  console.log(`Total voters: ${stats.combined.total}`);
})();
```

---

## Testing Commands

```bash
# Test 1: Get all voters
curl "http://localhost:3000/api/voters/all?limit=10"

# Test 2: Search both collections
curl -X POST "http://localhost:3000/api/voters/merged/search" \
  -H "Content-Type: application/json" \
  -d '{"search": "test", "voterType": "all", "limit": 10}'

# Test 3: Get single voter
curl "http://localhost:3000/api/voters/merged/VOTER_ID/Voter"

# Test 4: Update status
curl -X PATCH "http://localhost:3000/api/voters/merged/VOTER_ID/Voter/status" \
  -H "Content-Type: application/json" \
  -d '{"isPaid": true, "isVisited": true}'

# Test 5: Get statistics
curl "http://localhost:3000/api/voters/all/stats"

# Test 6: Complex search
curl -X POST "http://localhost:3000/api/voters/merged/search" \
  -H "Content-Type: application/json" \
  -d '{
    "search": "Kumar",
    "voterType": "all",
    "AC": "208",
    "Sex": "Male",
    "ageMin": 25,
    "ageMax": 45,
    "isPaid": false,
    "limit": 100
  }'
```

---

## Best Practices

1. **Always include voterType** in requests to merged endpoints
2. **Use POST search** for complex filters (cleaner than long query strings)
3. **Cache statistics** - they don't change frequently
4. **Use nameOnly** for faster name searches
5. **Include voterType** in response display for user clarity
6. **Handle both identifier types** - CardNo for Voter, CodeNo for VoterFour

---

## Performance Notes

| Operation | Collections | Expected Time |
|-----------|-------------|---------------|
| Get All (50) | Both | < 150ms |
| Get All (100) | Both | < 250ms |
| Search (50) | Both | < 200ms |
| Search (100) | Both | < 350ms |
| Get Single | One | < 50ms |
| Update Status | One | < 100ms |
| Statistics | Both | < 300ms |

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────────┐
│  MERGED VOTERS API QUICK REFERENCE                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  📖 READ                                                      │
│  GET /api/voters/all                - Get all voters         │
│  GET /api/voters/merged/:id/:type   - Get single voter       │
│  GET /api/voters/all/stats          - Get statistics         │
│                                                               │
│  🔍 SEARCH                                                    │
│  POST /api/voters/merged/search     - Advanced search        │
│  GET /api/voters/all/search         - Simple search          │
│                                                               │
│  ✏️ UPDATE                                                    │
│  PUT /api/voters/merged/:id/:type   - Update voter           │
│  PATCH /api/voters/merged/:id/:type/status - Update status   │
│                                                               │
│  🗑️ DELETE                                                    │
│  DELETE /api/voters/merged/:id/:type - Delete voter          │
│                                                               │
│  💡 TIP: voterType can be 'Voter', 'VoterFour', or 'all'   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

**Version:** 1.0.0  
**Last Updated:** October 9, 2025  
**Status:** ✅ Production Ready  

The merged voters API provides a clean, unified interface for managing voters across both collections! 🎉

