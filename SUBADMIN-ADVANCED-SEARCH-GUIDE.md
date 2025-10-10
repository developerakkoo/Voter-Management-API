# Sub-Admin Advanced Voter Search Guide

Complete guide for sub-admins to search and filter their assigned voters with powerful regex search capabilities.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Basic Search](#basic-search)
3. [Advanced Regex Search](#advanced-regex-search)
4. [Multi-Field Filtering](#multi-field-filtering)
5. [Sorting Options](#sorting-options)
6. [Combined Search Examples](#combined-search-examples)
7. [Frontend Integration](#frontend-integration)

---

## Overview

Sub-admins can search their assigned voters using two main endpoints:

| Endpoint | Purpose | Search Capability |
|----------|---------|-------------------|
| `GET /api/subadmin/voters` | Get all assigned voters | ✅ Advanced regex search |
| `GET /api/subadmin/voters/search` | Dedicated search endpoint | ✅ Multi-field advanced search |

Both endpoints now support:
- ✅ **Full-text regex search** across all fields
- ✅ **Name-only search** for faster queries
- ✅ **Multi-field filtering** (AC, Part, Booth, Sex, Age)
- ✅ **Status filtering** (isPaid, isVisited)
- ✅ **Flexible sorting** on any field
- ✅ **Pagination** for large result sets

---

## Basic Search

### Get All Assigned Voters (No Search)

**Endpoint:**
```
GET /api/subadmin/voters
```

**Example:**
```bash
curl "http://localhost:3000/api/subadmin/voters?page=1&limit=20" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
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
      "Part": "12",
      "isPaid": false,
      "isVisited": false,
      "voterType": "Voter",
      "assignmentInfo": {
        "assignmentId": "68e123...",
        "assignedAt": "2025-10-09T10:00:00.000Z",
        "notes": "Assigned for survey",
        "voterType": "Voter"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 95,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

---

## Advanced Regex Search

### 1. Simple Text Search (All Fields)

Search across **all fields** including name, address, booth, CardNo/CodeNo.

**Parameters:**
- `search` or `q` - Search term (case-insensitive)

**Example - Search for "Sharma":**
```bash
curl "http://localhost:3000/api/subadmin/voters?search=Sharma&limit=50" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

**Searches in:**
- Voter Name Eng
- Voter Name (Hindi)
- Relative Name Eng
- Relative Name (Hindi)
- Address
- Address Eng
- Booth
- Booth Eng
- CardNo
- CodeNo

---

### 2. Name-Only Search (Faster)

Search **only in name fields** for better performance.

**Parameters:**
- `search` or `q` - Search term
- `nameOnly=true` - Enable name-only mode

**Example - Search "Kumar" in names only:**
```bash
curl "http://localhost:3000/api/subadmin/voters?search=Kumar&nameOnly=true&limit=50" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

**Searches in:**
- Voter Name Eng
- Voter Name (Hindi)
- Relative Name Eng
- Relative Name (Hindi)

---

### 3. Partial Match Search

The regex search supports **partial matches** - you don't need the full name.

**Examples:**

**Search "Ram"** - Finds: Ramesh, Rama, Raman, Ram Kumar
```bash
curl "http://localhost:3000/api/subadmin/voters?search=Ram" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

**Search "Jag"** - Finds: Jagtap, Jagdish, Jagannath
```bash
curl "http://localhost:3000/api/subadmin/voters?search=Jag" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

**Search "208"** - Finds all with AC 208, or 208 in address
```bash
curl "http://localhost:3000/api/subadmin/voters?search=208" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

---

## Multi-Field Filtering

### Available Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` / `q` | string | Full-text search | `search=Sharma` |
| `nameOnly` | boolean | Search names only | `nameOnly=true` |
| `AC` | string | Assembly Constituency | `AC=208` |
| `Part` | string | Part number | `Part=5` |
| `Booth` | string | Booth name | `Booth=Community` |
| `Sex` | string | Gender | `Sex=Male` |
| `ageMin` | number | Minimum age | `ageMin=25` |
| `ageMax` | number | Maximum age | `ageMax=45` |
| `CardNo` | string | Card number search | `CardNo=TBZ` |
| `CodeNo` | string | Code number search | `CodeNo=XYZ` |
| `isPaid` | boolean | Payment status | `isPaid=true` |
| `isVisited` | boolean | Visit status | `isVisited=false` |
| `voterType` | string | Voter or VoterFour | `voterType=Voter` |
| `sortBy` | string | Field to sort by | `sortBy=Age` |
| `sortOrder` | string | asc or desc | `sortOrder=desc` |
| `page` | number | Page number | `page=1` |
| `limit` | number | Results per page | `limit=50` |

---

### Filter Examples

#### Example 1: Filter by AC (Assembly Constituency)
```bash
curl "http://localhost:3000/api/subadmin/voters?AC=208&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Example 2: Filter by Part
```bash
curl "http://localhost:3000/api/subadmin/voters?Part=5&limit=50" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Example 3: Filter by Gender
```bash
curl "http://localhost:3000/api/subadmin/voters?Sex=Female&limit=50" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Example 4: Filter by Age Range
```bash
curl "http://localhost:3000/api/subadmin/voters?ageMin=25&ageMax=45&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Example 5: Filter by Payment Status
```bash
# Get unpaid voters
curl "http://localhost:3000/api/subadmin/voters?isPaid=false&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"

# Get paid voters
curl "http://localhost:3000/api/subadmin/voters?isPaid=true&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Example 6: Filter by Visit Status
```bash
# Get unvisited voters
curl "http://localhost:3000/api/subadmin/voters?isVisited=false&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"

# Get visited voters
curl "http://localhost:3000/api/subadmin/voters?isVisited=true&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Example 7: Filter by Voter Type
```bash
# Get only Voter collection voters
curl "http://localhost:3000/api/subadmin/voters?voterType=Voter" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"

# Get only VoterFour collection voters
curl "http://localhost:3000/api/subadmin/voters?voterType=VoterFour" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

---

## Sorting Options

### Sort by Any Field

**Available Sort Fields:**
- `Voter Name Eng` - English name
- `Age` - Voter age
- `AC` - Assembly Constituency
- `Part` - Part number
- `assignedAt` - Assignment date (default)
- `isPaid` - Payment status
- `isVisited` - Visit status

### Sorting Examples

#### Example 1: Sort by Name (A-Z)
```bash
curl "http://localhost:3000/api/subadmin/voters?sortBy=Voter%20Name%20Eng&sortOrder=asc" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Example 2: Sort by Age (Oldest First)
```bash
curl "http://localhost:3000/api/subadmin/voters?sortBy=Age&sortOrder=desc" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Example 3: Sort by Assignment Date (Newest First)
```bash
curl "http://localhost:3000/api/subadmin/voters?sortBy=assignedAt&sortOrder=desc" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

---

## Combined Search Examples

### Example 1: Search + Filter + Sort

**Find "Sharma" voters from AC 208, aged 25-45, unpaid, sorted by age:**
```bash
curl "http://localhost:3000/api/subadmin/voters?search=Sharma&AC=208&ageMin=25&ageMax=45&isPaid=false&sortBy=Age&sortOrder=asc&limit=50" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

### Example 2: Name Search + Status Filter

**Find "Kumar" in names, show only unpaid and unvisited:**
```bash
curl "http://localhost:3000/api/subadmin/voters?search=Kumar&nameOnly=true&isPaid=false&isVisited=false&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

### Example 3: Location-Based Search

**Find voters from "Community Center" booth who are paid:**
```bash
curl "http://localhost:3000/api/subadmin/voters?Booth=Community&isPaid=true&limit=50" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

### Example 4: Complex Multi-Filter

**Male voters, AC 208, Part 5, aged 30-50, visited but not paid:**
```bash
curl "http://localhost:3000/api/subadmin/voters?AC=208&Part=5&Sex=Male&ageMin=30&ageMax=50&isVisited=true&isPaid=false&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

### Example 5: CardNo/CodeNo Search

**Find voters with specific card patterns:**
```bash
# Find all cards starting with "TBZ"
curl "http://localhost:3000/api/subadmin/voters?CardNo=TBZ&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"

# Find all codes starting with "XYZ"
curl "http://localhost:3000/api/subadmin/voters?CodeNo=XYZ&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

---

## Dedicated Search Endpoint

For more advanced searches with specific field targeting:

**Endpoint:**
```
GET /api/subadmin/voters/search
```

### Additional Parameters

| Parameter | Description |
|-----------|-------------|
| `Voter Name Eng` | Search in English voter name |
| `Voter Name` | Search in Hindi voter name |
| `Relative Name Eng` | Search in English relative name |
| `Relative Name` | Search in Hindi relative name |
| `Address` | Search in Hindi address |
| `Address Eng` | Search in English address |
| `Booth Eng` | Search in booth English name |
| `sourceFile` | Filter by source file (VoterFour only) |

### Example - Multi-Field Specific Search
```bash
curl "http://localhost:3000/api/subadmin/voters/search?Voter%20Name%20Eng=Sharma&AC=208&Sex=Male&isPaid=false" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

---

## Frontend Integration

### React Component Example

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SubAdminVoterList() {
  const [voters, setVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    sortBy: 'Voter Name Eng',
    sortOrder: 'asc',
    nameOnly: false,
    isPaid: undefined,
    isVisited: undefined,
    AC: '',
    Part: '',
    Sex: '',
    ageMin: '',
    ageMax: ''
  });
  const [pagination, setPagination] = useState({});
  
  const token = localStorage.getItem('subAdminToken');

  // Load voters with search and filters
  const loadVoters = async () => {
    try {
      const params = new URLSearchParams();
      
      // Add all non-empty filters
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      
      // Add search term
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await axios.get(
        `/api/subadmin/voters?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setVoters(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading voters:', error);
      alert('Failed to load voters');
    }
  };

  // Quick filter functions
  const showUnpaidVoters = () => {
    setFilters({ ...filters, isPaid: false, page: 1 });
  };

  const showUnvisitedVoters = () => {
    setFilters({ ...filters, isVisited: false, page: 1 });
  };

  const showPendingVoters = () => {
    setFilters({ ...filters, isPaid: false, isVisited: false, page: 1 });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: 50,
      sortBy: 'Voter Name Eng',
      sortOrder: 'asc',
      nameOnly: false,
      isPaid: undefined,
      isVisited: undefined,
      AC: '',
      Part: '',
      Sex: '',
      ageMin: '',
      ageMax: ''
    });
  };

  useEffect(() => {
    loadVoters();
  }, [filters, searchTerm]);

  return (
    <div className="voter-list">
      <h2>My Assigned Voters</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, address, CardNo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={filters.nameOnly}
            onChange={(e) => setFilters({...filters, nameOnly: e.target.checked})}
          />
          Search names only
        </label>
      </div>

      {/* Quick Filters */}
      <div className="quick-filters">
        <button onClick={showUnpaidVoters}>Unpaid Only</button>
        <button onClick={showUnvisitedVoters}>Unvisited Only</button>
        <button onClick={showPendingVoters}>Pending (Unpaid & Unvisited)</button>
        <button onClick={clearFilters}>Clear All Filters</button>
      </div>

      {/* Advanced Filters */}
      <div className="advanced-filters">
        <select 
          value={filters.AC} 
          onChange={(e) => setFilters({...filters, AC: e.target.value, page: 1})}
        >
          <option value="">All ACs</option>
          <option value="208">AC 208</option>
          <option value="242">AC 242</option>
        </select>

        <select 
          value={filters.Sex} 
          onChange={(e) => setFilters({...filters, Sex: e.target.value, page: 1})}
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          type="number"
          placeholder="Min Age"
          value={filters.ageMin}
          onChange={(e) => setFilters({...filters, ageMin: e.target.value, page: 1})}
        />
        
        <input
          type="number"
          placeholder="Max Age"
          value={filters.ageMax}
          onChange={(e) => setFilters({...filters, ageMax: e.target.value, page: 1})}
        />

        <select 
          value={filters.sortBy} 
          onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
        >
          <option value="Voter Name Eng">Sort by Name</option>
          <option value="Age">Sort by Age</option>
          <option value="AC">Sort by AC</option>
          <option value="assignedAt">Sort by Assignment Date</option>
        </select>

        <select 
          value={filters.sortOrder} 
          onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Results */}
      <div className="results">
        <p>Showing {voters.length} of {pagination.totalCount} voters</p>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>AC</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Paid</th>
              <th>Visited</th>
              <th>Assigned</th>
            </tr>
          </thead>
          <tbody>
            {voters.map(voter => (
              <tr key={voter._id}>
                <td>{voter['Voter Name Eng']}</td>
                <td>{voter.AC}</td>
                <td>{voter.Age}</td>
                <td>{voter.Sex}</td>
                <td>{voter.isPaid ? '✅' : '❌'}</td>
                <td>{voter.isVisited ? '✅' : '❌'}</td>
                <td>{new Date(voter.assignmentInfo?.assignedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setFilters({...filters, page: filters.page - 1})}
          disabled={!pagination.hasPrevPage}
        >
          Previous
        </button>
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button
          onClick={() => setFilters({...filters, page: filters.page + 1})}
          disabled={!pagination.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default SubAdminVoterList;
```

---

## Complete Workflows

### Workflow 1: Find and Visit Unpaid Voters

```bash
# Step 1: Get all unpaid voters
curl "http://localhost:3000/api/subadmin/voters?isPaid=false&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN" > unpaid.json

# Step 2: Visit them and mark as visited
# ... visit voters in field ...

# Step 3: Mark as visited (using voter IDs)
curl -X PATCH "http://localhost:3000/api/subadmin/voters/{voterId}/{voterType}/visited" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isVisited": true}'
```

### Workflow 2: Search by Name and Update Status

```bash
# Step 1: Search for "Sharma" voters
curl "http://localhost:3000/api/subadmin/voters?search=Sharma&nameOnly=true" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"

# Step 2: Mark specific Sharma voter as paid
curl -X PATCH "http://localhost:3000/api/subadmin/voters/{voterId}/Voter/paid" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPaid": true}'
```

### Workflow 3: Filter by Location and Age

```bash
# Find young voters (18-30) from specific booth
curl "http://localhost:3000/api/subadmin/voters?Booth=Community%20Center&ageMin=18&ageMax=30&limit=50" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

### Workflow 4: Daily Work Planning

```bash
# Morning: Get unvisited voters for today
curl "http://localhost:3000/api/subadmin/voters?isVisited=false&AC=208&Part=5&limit=50" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"

# Evening: Get visited but unpaid voters
curl "http://localhost:3000/api/subadmin/voters?isVisited=true&isPaid=false&limit=100" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

---

## Search Performance Tips

### 1. Use Name-Only Search When Possible
```bash
# Faster ⚡
curl "http://localhost:3000/api/subadmin/voters?search=Sharma&nameOnly=true"

# Slower (searches more fields)
curl "http://localhost:3000/api/subadmin/voters?search=Sharma"
```

### 2. Add Specific Filters to Narrow Results
```bash
# Good - Specific filters reduce search space
curl "http://localhost:3000/api/subadmin/voters?search=Kumar&AC=208&Part=5"

# Less efficient - Too broad
curl "http://localhost:3000/api/subadmin/voters?search=Kumar"
```

### 3. Use Appropriate Page Sizes
```bash
# For UI display
limit=20 or limit=50

# For data export or bulk operations
limit=100 or limit=500
```

---

## API Response Format

### Successful Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "68dd9a8c90752b2d27b79da9",
      "Voter Name Eng": "Arati Jagtap",
      "Voter Name": "आरती जगताप",
      "Relative Name Eng": "Ramesh Jagtap",
      "AC": "208",
      "Part": "12",
      "Booth": "श्री एकनाथराव खेसे स्कुल...",
      "Age": 22,
      "Sex": "Female",
      "CardNo": "TBZ5096904",
      "Address": "साठे बस्ती...",
      "isPaid": false,
      "isVisited": false,
      "surveyDone": true,
      "voterType": "Voter",
      "assignmentInfo": {
        "assignmentId": "68e123...",
        "assignedAt": "2025-10-09T10:00:00.000Z",
        "notes": "Assigned for survey",
        "voterType": "Voter"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 95,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error fetching assigned voters",
  "error": "Error details..."
}
```

---

## Search Query Examples Table

| Use Case | Query String |
|----------|--------------|
| Search "Sharma" | `?search=Sharma` |
| Search names only | `?search=Kumar&nameOnly=true` |
| Search with AC filter | `?search=Patel&AC=208` |
| Filter unpaid | `?isPaid=false` |
| Filter unvisited | `?isVisited=false` |
| Filter pending (both) | `?isPaid=false&isVisited=false` |
| Age range | `?ageMin=25&ageMax=45` |
| Male voters | `?Sex=Male` |
| Sort by age | `?sortBy=Age&sortOrder=desc` |
| Sort by name | `?sortBy=Voter%20Name%20Eng&sortOrder=asc` |
| Paginate | `?page=2&limit=50` |
| Complex filter | `?search=Sharma&AC=208&Sex=Male&isPaid=false&ageMin=30&ageMax=50&limit=100` |

---

## Testing Commands

### Test 1: Basic Search
```bash
curl "http://localhost:3000/api/subadmin/voters?search=test&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: Name-Only Search
```bash
curl "http://localhost:3000/api/subadmin/voters?search=Sharma&nameOnly=true&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Multi-Filter
```bash
curl "http://localhost:3000/api/subadmin/voters?AC=208&isPaid=false&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Complex Search
```bash
curl "http://localhost:3000/api/subadmin/voters?search=Kumar&AC=208&Part=5&Sex=Male&ageMin=25&ageMax=45&isPaid=false&sortBy=Age&sortOrder=asc&limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Use Cases

### 1. Daily Task Planning
```javascript
// Get today's pending voters (unpaid and unvisited)
const pending = await axios.get('/api/subadmin/voters?isPaid=false&isVisited=false&limit=50');

// Get visited but unpaid voters (need payment collection)
const needPayment = await axios.get('/api/subadmin/voters?isVisited=true&isPaid=false&limit=50');
```

### 2. Location-Based Work
```javascript
// Get all voters from specific AC
const acVoters = await axios.get('/api/subadmin/voters?AC=208&limit=100');

// Get voters from specific booth
const boothVoters = await axios.get('/api/subadmin/voters?Booth=Community%20Center&limit=50');
```

### 3. Demographic Targeting
```javascript
// Get young male voters
const youngMales = await axios.get('/api/subadmin/voters?Sex=Male&ageMin=18&ageMax=35&limit=100');

// Get senior female voters
const seniorFemales = await axios.get('/api/subadmin/voters?Sex=Female&ageMin=60&limit=50');
```

### 4. Progress Tracking
```javascript
// Get completion statistics
const completed = await axios.get('/api/subadmin/voters?isPaid=true&isVisited=true');
const pending = await axios.get('/api/subadmin/voters?isPaid=false&isVisited=false');

console.log(`Completed: ${completed.data.pagination.totalCount}`);
console.log(`Pending: ${pending.data.pagination.totalCount}`);
```

---

## Best Practices

1. **Use `nameOnly=true`** when searching for voter names (faster)
2. **Combine filters** to narrow down results before searching
3. **Use appropriate page sizes** - 20-50 for UI, 100-500 for exports
4. **Cache filter options** (AC, Part, Booth) on frontend
5. **Debounce search input** to avoid too many requests
6. **Show loading states** during search operations
7. **Display total count** so users know result size

---

## Performance Benchmarks

| Operation | Voters | Expected Time |
|-----------|--------|---------------|
| Get all (no search) | 50 | < 100ms |
| Simple search | 50 | < 150ms |
| Name-only search | 50 | < 120ms |
| Multi-filter search | 100 | < 250ms |
| Complex search | 500 | < 500ms |

---

## Troubleshooting

### Issue: Search returns no results

**Check:**
- Search term spelling
- Try with `nameOnly=false` to search all fields
- Verify voters are actually assigned to you
- Check if filters are too restrictive

### Issue: Search is slow

**Solutions:**
- Use `nameOnly=true` for name searches
- Add more specific filters (AC, Part)
- Reduce page size
- Check database indexes

### Issue: Wrong results returned

**Verify:**
- Search is case-insensitive (works correctly)
- Regex matches partial strings (expected behavior)
- Filters are AND conditions (all must match)
- Check voterType parameter if searching specific collection

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  SUB-ADMIN VOTER SEARCH QUICK REFERENCE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 BASIC SEARCH                                            │
│  GET /api/subadmin/voters?search=Sharma                     │
│                                                              │
│  📝 NAME-ONLY SEARCH (Faster)                               │
│  GET /api/subadmin/voters?search=Kumar&nameOnly=true        │
│                                                              │
│  🎯 FILTER BY STATUS                                        │
│  ?isPaid=false&isVisited=false                              │
│                                                              │
│  📍 FILTER BY LOCATION                                      │
│  ?AC=208&Part=5&Booth=Community                             │
│                                                              │
│  👥 FILTER BY DEMOGRAPHICS                                  │
│  ?Sex=Male&ageMin=25&ageMax=45                              │
│                                                              │
│  🔄 SORT RESULTS                                            │
│  ?sortBy=Age&sortOrder=desc                                 │
│                                                              │
│  📄 PAGINATION                                              │
│  ?page=2&limit=50                                           │
│                                                              │
│  🎨 COMPLEX EXAMPLE                                         │
│  ?search=Sharma&AC=208&Sex=Male&isPaid=false&              │
│   ageMin=30&ageMax=50&sortBy=Age&limit=100                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Version:** 1.0.0  
**Last Updated:** October 9, 2025  
**Status:** ✅ Production Ready  

All search features are fully implemented and tested. Sub-admins can now efficiently search and filter their assigned voters! 🚀

