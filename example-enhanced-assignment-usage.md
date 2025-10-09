# Enhanced Voter Assignment API - Complete Guide

This guide covers the enhanced voter assignment features including Excel upload, bulk selection, and a comprehensive assignment page.

## Table of Contents
1. [Assignment Page Endpoint](#1-assignment-page-endpoint)
2. [Assign Selected Voters (Bulk)](#2-assign-selected-voters-bulk)
3. [Assign from Excel Upload](#3-assign-from-excel-upload)
4. [Complete Workflow Examples](#4-complete-workflow-examples)

---

## 1. Assignment Page Endpoint

A comprehensive endpoint designed specifically for the voter assignment page UI. It provides all voters with their assignment status, with extensive filtering, sorting, and pagination options.

### Endpoint
```
GET /api/assignment/assignment-page
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 100 | Results per page (100, 500, 1000, etc.) |
| `voterType` | string | 'Voter' | 'Voter' or 'VoterFour' |
| `subAdminId` | string | - | Filter by specific sub admin |
| `assignmentStatus` | string | 'all' | 'all', 'assigned', 'unassigned' |
| `search` | string | - | Search in name, address, CardNo, CodeNo |
| `sortBy` | string | 'Voter Name Eng' | Field to sort by |
| `sortOrder` | string | 'asc' | 'asc' or 'desc' |
| `ac` | string/array | - | Assembly Constituency (comma-separated) |
| `part` | string/array | - | Part numbers (comma-separated) |
| `booth` | string/array | - | Booth numbers (comma-separated) |
| `sex` | string/array | - | Gender filter (comma-separated) |
| `ageMin` | number | - | Minimum age |
| `ageMax` | number | - | Maximum age |
| `isPaid` | boolean | - | Filter by payment status |
| `isVisited` | boolean | - | Filter by visit status |
| `surveyDone` | boolean | - | Filter by survey completion |

### Examples

#### Get First 100 Unassigned Voters
```bash
curl "http://localhost:3000/api/assignment/assignment-page?limit=100&assignmentStatus=unassigned&voterType=Voter"
```

#### Get 500 Voters with Filters
```bash
curl "http://localhost:3000/api/assignment/assignment-page?limit=500&voterType=VoterFour&ac=208,242&sex=Male&ageMin=25&ageMax=45&assignmentStatus=unassigned"
```

#### Get 1000 Voters Sorted by Name
```bash
curl "http://localhost:3000/api/assignment/assignment-page?limit=1000&sortBy=Voter%20Name%20Eng&sortOrder=asc&assignmentStatus=all"
```

#### Search and Filter
```bash
curl "http://localhost:3000/api/assignment/assignment-page?limit=200&search=Sharma&ac=208&part=5&assignmentStatus=unassigned"
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "68dd9a8c90752b2d27b79da9",
      "voterType": "Voter",
      "Voter Name Eng": "Arati Jagtap",
      "Voter Name": "आरती जगताप",
      "AC": "208",
      "Part": "12",
      "Booth": "श्री एकनाथराव खेसे स्कुल...",
      "Age": 22,
      "Sex": "Female",
      "CardNo": "TBZ5096904",
      "CodeNo": null,
      "Address": "साठे बस्ती...",
      "isPaid": false,
      "isVisited": false,
      "surveyDone": true,
      "pno": "3",
      "assignmentStatus": {
        "isAssigned": false,
        "assignmentId": null,
        "subAdmin": null,
        "assignedAt": null,
        "notes": null
      }
    },
    {
      "_id": "68dd9c3733b43227162d4b22",
      "voterType": "Voter",
      "Voter Name Eng": "Nalage Sangita Prashant",
      "AC": "242",
      "Part": "",
      "Age": 38,
      "Sex": "Female",
      "CodeNo": "TBZ9089863",
      "isPaid": false,
      "isVisited": false,
      "surveyDone": true,
      "pno": "4",
      "assignmentStatus": {
        "isAssigned": true,
        "assignmentId": "68e123...",
        "subAdmin": {
          "_id": "68e456...",
          "fullName": "Vijay Patil",
          "userId": "vijaypatil",
          "locationName": "Kharadi Zone"
        },
        "assignedAt": "2025-10-09T10:00:00.000Z",
        "notes": "Assigned for survey"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 952,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 100
  },
  "stats": {
    "totalVoters": 100,
    "assignedVoters": 23,
    "unassignedVoters": 77,
    "assignmentPercentage": "23.00"
  },
  "filters": {
    "voterType": "Voter",
    "subAdminId": null,
    "assignmentStatus": "unassigned",
    "search": null,
    "ac": null,
    "part": null,
    "booth": null,
    "sex": null,
    "ageMin": null,
    "ageMax": null,
    "isPaid": null,
    "isVisited": null,
    "surveyDone": null,
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc"
  }
}
```

---

## 2. Assign Selected Voters (Bulk)

Assign multiple selected voters (100, 500, 1000+) to a sub-admin at once. Perfect for when you've filtered and selected specific voters from the assignment page.

### Endpoint
```
POST /api/assignment/assign-selected
```

### Request Body
```json
{
  "subAdminId": "68e456789abcdef123456789",
  "voterType": "Voter",
  "voterIds": [
    "68dd9a8c90752b2d27b79da9",
    "68dd9a9990752b2d27b7c22c",
    "68dd9aa890752b2d27b7ed84",
    "... (100, 500, or 1000+ voter IDs)"
  ],
  "notes": "Bulk assignment - Kharadi Zone Phase 1"
}
```

### Features
- ✅ Supports up to 10,000 voters at once
- ✅ Validates all voter IDs exist in database
- ✅ Skips already assigned voters automatically
- ✅ Provides detailed success/failure report
- ✅ Shows which voters were not found

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Successfully assigned 487 voters to sub admin",
  "data": {
    "subAdminId": "68e456789abcdef123456789",
    "subAdminName": "Vijay Patil",
    "voterType": "Voter",
    "requestedCount": 500,
    "votersFound": 495,
    "votersNotFound": 5,
    "alreadyAssigned": 8,
    "newlyAssigned": 487,
    "notFoundIds": [
      "68dd9a8c90752b2d27b79999",
      "68dd9a9990752b2d27b7c999"
    ],
    "summary": {
      "total": 500,
      "successful": 487,
      "skipped": 8,
      "notFound": 5
    }
  }
}
```

### cURL Example - Assign 100 Voters
```bash
curl -X POST http://localhost:3000/api/assignment/assign-selected \
  -H "Content-Type: application/json" \
  -d '{
    "subAdminId": "68e456789abcdef123456789",
    "voterType": "Voter",
    "voterIds": ["68dd9a8c90752b2d27b79da9", "68dd9a9990752b2d27b7c22c", "..."],
    "notes": "Bulk assignment - 100 voters"
  }'
```

---

## 3. Assign from Excel Upload

Upload an Excel file containing CardNo (for Voter) or CodeNo (for VoterFour), and automatically assign all matching voters to a sub-admin.

### Endpoint
```
POST /api/assignment/assign-from-excel
```

### Request
This is a **multipart/form-data** request with:
- `file` - Excel file (.xlsx, .xls, .csv)
- `subAdminId` - Sub admin ID (form field)
- `voterType` - 'Voter' or 'VoterFour' (form field)
- `notes` - Optional notes (form field)

### Excel File Format

#### For Voter Type (CardNo)
```
| CardNo      | (other columns optional) |
|-------------|--------------------------|
| TBZ5096904  |                          |
| TBZ8997157  |                          |
| ABC1234567  |                          |
```

#### For VoterFour Type (CodeNo)
```
| CodeNo      | (other columns optional) |
|-------------|--------------------------|
| TBZ9089863  |                          |
| XYZ1234567  |                          |
| ABC9876543  |                          |
```

### Response (Success - 201)
```json
{
  "success": true,
  "message": "Successfully processed Excel file and assigned voters",
  "data": {
    "subAdminId": "68e456789abcdef123456789",
    "subAdminName": "Vijay Patil",
    "voterType": "Voter",
    "excelStats": {
      "totalIdentifiersInExcel": 150,
      "votersFoundInDatabase": 145,
      "votersNotFound": 5,
      "alreadyAssigned": 12,
      "newlyAssigned": 133
    },
    "assignments": {
      "created": 133,
      "skipped": 12
    }
  }
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/assignment/assign-from-excel \
  -F "file=@voters-to-assign.xlsx" \
  -F "subAdminId=68e456789abcdef123456789" \
  -F "voterType=Voter" \
  -F "notes=Assignment from Excel - October 2025"
```

### Using Postman
1. Select POST method
2. URL: `http://localhost:3000/api/assignment/assign-from-excel`
3. Go to "Body" tab
4. Select "form-data"
5. Add fields:
   - Key: `file`, Type: File, Value: Select your Excel file
   - Key: `subAdminId`, Type: Text, Value: `68e456789abcdef123456789`
   - Key: `voterType`, Type: Text, Value: `Voter`
   - Key: `notes`, Type: Text, Value: `Assignment from Excel`
6. Click Send

### JavaScript Example
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function assignFromExcel(excelFilePath, subAdminId, voterType) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(excelFilePath));
  formData.append('subAdminId', subAdminId);
  formData.append('voterType', voterType);
  formData.append('notes', 'Assigned from Excel upload');

  try {
    const response = await axios.post(
      'http://localhost:3000/api/assignment/assign-from-excel',
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    console.log('Assignment Result:', response.data);
    console.log(`Assigned ${response.data.data.excelStats.newlyAssigned} voters`);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Usage
assignFromExcel('./voters.xlsx', '68e456789abcdef123456789', 'Voter');
```

---

## 4. Complete Workflow Examples

### Workflow 1: Filter, Select, and Assign

#### Step 1: Get Unassigned Voters for Assignment Page
```bash
curl "http://localhost:3000/api/assignment/assignment-page?limit=500&voterType=Voter&assignmentStatus=unassigned&ac=208&part=5,49&sex=Male&ageMin=25&ageMax=45"
```

**Response:**
```json
{
  "success": true,
  "data": [/* 500 voters with assignment status */],
  "stats": {
    "totalVoters": 500,
    "assignedVoters": 0,
    "unassignedVoters": 500,
    "assignmentPercentage": "0.00"
  }
}
```

#### Step 2: Extract Voter IDs from Response
```javascript
const voterIds = response.data.data
  .filter(v => !v.assignmentStatus.isAssigned)
  .map(v => v._id);

console.log(`Selected ${voterIds.length} voters for assignment`);
```

#### Step 3: Assign Selected Voters
```bash
curl -X POST http://localhost:3000/api/assignment/assign-selected \
  -H "Content-Type: application/json" \
  -d '{
    "subAdminId": "68e456789abcdef123456789",
    "voterType": "Voter",
    "voterIds": ["68dd9a8c...", "68dd9a99...", "..."],
    "notes": "Male voters aged 25-45 from AC 208"
  }'
```

### Workflow 2: Excel-Based Assignment

#### Step 1: Prepare Excel File
Create an Excel file with CardNo or CodeNo column:

**voters-assignment.xlsx:**
```
| CardNo      |
|-------------|
| TBZ5096904  |
| TBZ8997157  |
| ABC1234567  |
| ABC1234568  |
| ABC1234569  |
```

#### Step 2: Upload and Assign
```bash
curl -X POST http://localhost:3000/api/assignment/assign-from-excel \
  -F "file=@voters-assignment.xlsx" \
  -F "subAdminId=68e456789abcdef123456789" \
  -F "voterType=Voter" \
  -F "notes=Assignment from Excel - Batch 1"
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully processed Excel file and assigned voters",
  "data": {
    "excelStats": {
      "totalIdentifiersInExcel": 5,
      "votersFoundInDatabase": 5,
      "votersNotFound": 0,
      "alreadyAssigned": 0,
      "newlyAssigned": 5
    }
  }
}
```

### Workflow 3: Paginated Assignment (1000+ Voters)

#### Step 1: Get Page 1 (First 1000 Voters)
```bash
curl "http://localhost:3000/api/assignment/assignment-page?page=1&limit=1000&voterType=Voter&assignmentStatus=unassigned"
```

#### Step 2: Collect Voter IDs
```javascript
const page1VoterIds = response.data.data.map(v => v._id);
// You now have 1000 voter IDs
```

#### Step 3: Assign First 1000
```bash
curl -X POST http://localhost:3000/api/assignment/assign-selected \
  -H "Content-Type: application/json" \
  -d '{
    "subAdminId": "68e456789abcdef123456789",
    "voterType": "Voter",
    "voterIds": [/* 1000 IDs */],
    "notes": "Batch 1 - 1000 voters"
  }'
```

#### Step 4: Get Page 2 (Next 1000 Voters)
```bash
curl "http://localhost:3000/api/assignment/assignment-page?page=2&limit=1000&voterType=Voter&assignmentStatus=unassigned"
```

#### Step 5: Assign Second 1000
Repeat the process...

---

## Frontend Integration Examples

### React Component - Assignment Page

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VoterAssignmentPage() {
  const [voters, setVoters] = useState([]);
  const [selectedVoters, setSelectedVoters] = useState([]);
  const [filters, setFilters] = useState({
    limit: 100,
    voterType: 'Voter',
    assignmentStatus: 'unassigned',
    page: 1
  });
  const [stats, setStats] = useState({});

  // Load voters
  const loadVoters = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(
        `http://localhost:3000/api/assignment/assignment-page?${params}`
      );
      
      setVoters(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading voters:', error);
    }
  };

  // Select/deselect voter
  const toggleVoter = (voterId) => {
    setSelectedVoters(prev => 
      prev.includes(voterId)
        ? prev.filter(id => id !== voterId)
        : [...prev, voterId]
    );
  };

  // Select all on current page
  const selectAll = () => {
    const unassignedIds = voters
      .filter(v => !v.assignmentStatus.isAssigned)
      .map(v => v._id);
    setSelectedVoters(unassignedIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedVoters([]);
  };

  // Assign selected voters
  const assignSelected = async (subAdminId) => {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/assignment/assign-selected',
        {
          subAdminId,
          voterType: filters.voterType,
          voterIds: selectedVoters,
          notes: `Assigned ${selectedVoters.length} voters from UI`
        }
      );
      
      alert(`Successfully assigned ${response.data.data.newlyAssigned} voters!`);
      setSelectedVoters([]);
      loadVoters(); // Reload to update status
    } catch (error) {
      console.error('Error assigning voters:', error);
      alert('Failed to assign voters');
    }
  };

  // Upload Excel and assign
  const uploadExcelAndAssign = async (file, subAdminId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subAdminId', subAdminId);
    formData.append('voterType', filters.voterType);
    formData.append('notes', 'Assigned from Excel upload');

    try {
      const response = await axios.post(
        'http://localhost:3000/api/assignment/assign-from-excel',
        formData
      );
      
      alert(`Assigned ${response.data.data.excelStats.newlyAssigned} voters from Excel!`);
      loadVoters(); // Reload
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to assign from Excel');
    }
  };

  useEffect(() => {
    loadVoters();
  }, [filters]);

  return (
    <div>
      <h1>Voter Assignment Page</h1>
      
      {/* Stats */}
      <div className="stats">
        <div>Total: {stats.totalVoters}</div>
        <div>Assigned: {stats.assignedVoters}</div>
        <div>Unassigned: {stats.unassignedVoters}</div>
        <div>Percentage: {stats.assignmentPercentage}%</div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => setFilters({...filters, limit: e.target.value})}>
          <option value="100">Show 100</option>
          <option value="500">Show 500</option>
          <option value="1000">Show 1000</option>
        </select>
        
        <select onChange={(e) => setFilters({...filters, assignmentStatus: e.target.value})}>
          <option value="all">All Voters</option>
          <option value="assigned">Assigned Only</option>
          <option value="unassigned">Unassigned Only</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Search..."
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
      </div>

      {/* Actions */}
      <div className="actions">
        <button onClick={selectAll}>Select All ({voters.length})</button>
        <button onClick={clearSelection}>Clear Selection</button>
        <button onClick={() => assignSelected('SUBADMIN_ID_HERE')}>
          Assign Selected ({selectedVoters.length})
        </button>
        <input type="file" onChange={(e) => uploadExcelAndAssign(e.target.files[0], 'SUBADMIN_ID_HERE')} />
      </div>

      {/* Voter List */}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>AC</th>
            <th>Part</th>
            <th>Age</th>
            <th>Sex</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {voters.map(voter => (
            <tr key={voter._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedVoters.includes(voter._id)}
                  onChange={() => toggleVoter(voter._id)}
                  disabled={voter.assignmentStatus.isAssigned}
                />
              </td>
              <td>{voter['Voter Name Eng']}</td>
              <td>{voter.AC}</td>
              <td>{voter.Part}</td>
              <td>{voter.Age}</td>
              <td>{voter.Sex}</td>
              <td>
                {voter.assignmentStatus.isAssigned 
                  ? `Assigned to ${voter.assignmentStatus.subAdmin?.fullName}`
                  : 'Unassigned'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => setFilters({...filters, page: filters.page - 1})}
          disabled={filters.page === 1}
        >
          Previous
        </button>
        <span>Page {filters.page}</span>
        <button onClick={() => setFilters({...filters, page: filters.page + 1})}>
          Next
        </button>
      </div>
    </div>
  );
}

export default VoterAssignmentPage;
```

---

## Best Practices

### 1. **Use Assignment Page Endpoint for UI**
- Load voters with filters
- Show assigned/unassigned status
- Allow selection of 100, 500, or 1000 at a time

### 2. **Batch Selection Strategy**
```javascript
// Get first 1000 unassigned voters
const response = await axios.get('/api/assignment/assignment-page?limit=1000&assignmentStatus=unassigned');

// Extract IDs
const voterIds = response.data.data.map(v => v._id);

// Assign in batches of 1000
await axios.post('/api/assignment/assign-selected', {
  subAdminId: 'xxx',
  voterType: 'Voter',
  voterIds: voterIds
});
```

### 3. **Excel Upload Best Practices**
- ✅ Include only CardNo/CodeNo column (required)
- ✅ Remove headers if not standard
- ✅ One identifier per row
- ✅ File size under 10MB
- ✅ Verify voter type matches identifier type

### 4. **Filter Before Assignment**
```bash
# Filter to get specific voters
curl "http://localhost:3000/api/assignment/assignment-page?limit=500&ac=208&part=5&sex=Male&ageMin=25&ageMax=45&assignmentStatus=unassigned"

# Then assign the filtered set
```

---

## Performance Tips

1. **Use appropriate page sizes:**
   - UI display: 100 voters
   - Bulk selection: 500-1000 voters
   - Maximum: Up to 10,000 voters

2. **Filter before assigning:**
   - Use AC, Part, Booth filters to narrow down
   - Search by specific criteria
   - Check assignment status

3. **Monitor progress:**
   - Use pagination stats to track total
   - Check `assignmentPercentage` in response
   - Review failed assignments in response

---

## API Endpoint Summary

| Method | Endpoint | Description | Max Voters |
|--------|----------|-------------|------------|
| GET | `/api/assignment/assignment-page` | Get voters with filters for UI | N/A (paginated) |
| POST | `/api/assignment/assign-selected` | Assign selected voter IDs | 10,000 |
| POST | `/api/assignment/assign-from-excel` | Assign from Excel upload | Unlimited |

---

## Error Handling

### Excel Upload Errors

**No CardNo/CodeNo in Excel:**
```json
{
  "success": false,
  "message": "No CardNo or CodeNo found in Excel file..."
}
```

**No Matching Voters Found:**
```json
{
  "success": false,
  "message": "No voters found matching the CardNo in the Excel file",
  "details": {
    "identifiersInExcel": 150,
    "identifiersSample": ["TBZ5096904", "TBZ8997157", ...]
  }
}
```

### Bulk Assignment Errors

**Too Many Voters:**
```json
{
  "success": false,
  "message": "Cannot assign more than 10,000 voters at once..."
}
```

**Some Voters Not Found:**
```json
{
  "success": true,
  "data": {
    "votersNotFound": 5,
    "notFoundIds": ["68dd9a8c...", "68dd9a99..."],
    "summary": {
      "total": 100,
      "successful": 95,
      "notFound": 5
    }
  }
}
```

---

## Sample Excel Templates

### For Voter Type (CardNo)
Download: Create an Excel file with this structure:
```
CardNo
TBZ5096904
TBZ8997157
ABC1234567
ABC1234568
```

### For VoterFour Type (CodeNo)
Download: Create an Excel file with this structure:
```
CodeNo
TBZ9089863
XYZ1234567
ABC9876543
```

**Note:** You can include additional columns, but only CardNo/CodeNo will be used for matching.

