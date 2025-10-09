# Complete Voter Assignment API Guide

This guide covers ALL endpoints for the enhanced voter assignment system as per the backend API specification.

## 📋 Table of Contents
1. [API Endpoints Overview](#api-endpoints-overview)
2. [Get Unassigned Voters](#1-get-unassigned-voters)
3. [Get Filter Options](#2-get-filter-options)
4. [Assign from Excel Upload](#3-assign-from-excel-upload)
5. [Assign Selected Voters](#4-assign-selected-voters)
6. [Get Assignment Page Data](#5-get-assignment-page-data)
7. [Get Assigned Voters for Sub-Admin](#6-get-assigned-voters-for-sub-admin)
8. [Testing Guide](#testing-guide)

---

## API Endpoints Overview

| Method | Endpoint | Purpose | Max Results |
|--------|----------|---------|-------------|
| GET | `/api/assignment/unassigned/:voterType` | Get unassigned voters with filters | 1000/page |
| GET | `/api/assignment/assignment-page` | Get all voters with assignment status | 1000/page |
| GET | `/api/voter/filter-options` | Get filter dropdown options for Voter | N/A |
| GET | `/api/voterfour/filter-options` | Get filter dropdown options for VoterFour | N/A |
| POST | `/api/assignment/assign-from-excel` | Bulk assign from Excel file | Unlimited |
| POST | `/api/assignment/assign-selected` | Assign selected voter IDs | 10,000 |
| GET | `/api/assignment/subadmin/:subAdminId` | Get voters assigned to sub-admin | All |

---

## 1. Get Unassigned Voters

Returns voters NOT assigned to a specific sub-admin with search, filters, sorting, and pagination.

### Endpoint
```
GET /api/assignment/unassigned/:voterType
```

### Path Parameters
- `voterType` - **Required** - Either "Voter" or "VoterFour"

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `subAdminId` | string | ✅ Yes | - | Sub-admin MongoDB ObjectId |
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 50 | Items per page (max 1000) |
| `sortBy` | string | No | "Voter Name Eng" | Field to sort by |
| `sortOrder` | string | No | "asc" | "asc" or "desc" |
| `search` | string | No | - | Search in name, address, CardNo/CodeNo |
| `AC` | string | No | - | Filter by Assembly Constituency |
| `Booth` | string | No | - | Filter by Booth |
| `pno` | string | No | - | Filter by PNO |
| `Part` | string | No | - | Filter by Part number |
| `Sex` | string | No | - | Filter by gender |
| `ageMin` | number | No | - | Minimum age |
| `ageMax` | number | No | - | Maximum age |

### Request Examples

**Basic - Get first 50 unassigned voters:**
```bash
curl "http://localhost:3000/api/assignment/unassigned/Voter?subAdminId=68e456789abcdef123456789"
```

**With pagination - Get 100 voters:**
```bash
curl "http://localhost:3000/api/assignment/unassigned/Voter?subAdminId=68e456789abcdef123456789&page=1&limit=100"
```

**With search:**
```bash
curl "http://localhost:3000/api/assignment/unassigned/Voter?subAdminId=68e456789abcdef123456789&search=ramesh&limit=50"
```

**With filters:**
```bash
curl "http://localhost:3000/api/assignment/unassigned/Voter?subAdminId=68e456789abcdef123456789&AC=208&Booth=Community+Center&pno=3&limit=100"
```

**With sorting:**
```bash
curl "http://localhost:3000/api/assignment/unassigned/Voter?subAdminId=68e456789abcdef123456789&sortBy=Age&sortOrder=desc&limit=100"
```

**Get 1000 voters (maximum):**
```bash
curl "http://localhost:3000/api/assignment/unassigned/VoterFour?subAdminId=68e456789abcdef123456789&limit=1000"
```

### Response
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
      "Address": "साठे बस्ती 23 ते 27...",
      "pno": "3",
      "isActive": true,
      "isPaid": false,
      "isVisited": false,
      "surveyDone": true
    }
    // ... more voters
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 500,
    "limit": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 2. Get Filter Options

Returns unique values for filter dropdowns (AC, Booth, PNO, Part).

### Endpoints
```
GET /api/voter/filter-options        - For Voter type
GET /api/voterfour/filter-options    - For VoterFour type
```

### Request Examples

**For Voter:**
```bash
curl "http://localhost:3000/api/voter/filter-options"
```

**For VoterFour:**
```bash
curl "http://localhost:3000/api/voterfour/filter-options"
```

### Response
```json
{
  "success": true,
  "data": {
    "ACs": ["208", "242", "245", "253"],
    "Booths": [
      "Community Center",
      "Primary School",
      "खराडी चाटे स्कूल..."
    ],
    "pnos": ["1", "2", "3", "4", "5"],
    "Parts": ["1", "5", "12", "49", "177", "191"]
  }
}
```

---

## 3. Assign from Excel Upload

Upload an Excel file with CardNo/CodeNo and automatically assign all matching voters to a sub-admin.

### Endpoint
```
POST /api/assignment/assign-from-excel
```

### Content-Type
`multipart/form-data`

### Form Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ Yes | Excel file (.xlsx, .xls, .csv) |
| `subAdminId` | string | ✅ Yes | Sub-admin MongoDB ObjectId |
| `voterType` | string | ✅ Yes | "Voter" or "VoterFour" |
| `notes` | string | No | Optional assignment notes |

### Supported Excel Column Names

The system is **very flexible** and supports multiple column name variations:

**For any voter identifier:**
- `CardNo`, `Card No`, `Cardno`, `cardno`, `CARDNO`
- `CodeNo`, `Code No`, `Codeno`, `codeno`, `CODENO`
- `VoterID`, `Voter ID`, `VoterId`, `voterId`
- `EPIC`, `epic`
- Any column containing "card", "code", or "epic" in the name

### Excel File Example

**Option 1: Simple (Just CardNo):**
```
CardNo
TBZ5096904
TBZ8997157
ABC1234567
ABC1234568
```

**Option 2: With Extra Columns (ignored):**
```
CardNo      | Voter Name        | AC  | Notes
TBZ5096904  | Arati Jagtap      | 208 | Priority
TBZ8997157  | Ramesh Kumar      | 208 | Follow up
ABC1234567  | Sunita Verma      | 242 |
```

### Request Examples

**Using cURL:**
```bash
curl -X POST "http://localhost:3000/api/assignment/assign-from-excel" \
  -F "file=@voters-to-assign.xlsx" \
  -F "subAdminId=68e456789abcdef123456789" \
  -F "voterType=Voter" \
  -F "notes=October 2025 Assignment - Batch 1"
```

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:3000/api/assignment/assign-from-excel`
3. Body → form-data:
   - `file` (File): Select Excel file
   - `subAdminId` (Text): `68e456789abcdef123456789`
   - `voterType` (Text): `Voter`
   - `notes` (Text): `Assignment notes`

**Using JavaScript (FormData):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('subAdminId', '68e456789abcdef123456789');
formData.append('voterType', 'Voter');
formData.append('notes', 'Bulk assignment');

const response = await fetch('/api/assignment/assign-from-excel', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### Response (Success)
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

### Response (Error - No Identifiers Found)
```json
{
  "success": false,
  "message": "No CardNo or CodeNo found in Excel file...",
  "details": {
    "columnsFound": ["Name", "Age", "Address", "Unknown Column"],
    "supportedColumnNames": [
      "CardNo", "Card No", "CodeNo", "Code No", 
      "VoterID", "Voter ID", "EPIC"
    ],
    "hint": "Check if your column name matches one of the supported names (case-insensitive)"
  }
}
```

---

## 4. Assign Selected Voters

Assign multiple selected voters (up to 10,000) to a sub-admin.

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
    "68dd9aa890752b2d27b7ed84"
    // ... up to 10,000 IDs
  ],
  "notes": "Bulk assignment - Kharadi Zone"
}
```

### Request Examples

**Assign 100 voters:**
```bash
curl -X POST "http://localhost:3000/api/assignment/assign-selected" \
  -H "Content-Type: application/json" \
  -d '{
    "subAdminId": "68e456789abcdef123456789",
    "voterType": "Voter",
    "voterIds": ["id1", "id2", "... 100 IDs"],
    "notes": "100 voters assignment"
  }'
```

**Assign 1000 voters:**
```bash
curl -X POST "http://localhost:3000/api/assignment/assign-selected" \
  -H "Content-Type: application/json" \
  -d '{
    "subAdminId": "68e456789abcdef123456789",
    "voterType": "VoterFour",
    "voterIds": [/* 1000 IDs */],
    "notes": "1000 voters assignment"
  }'
```

### Response
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
    "notFoundIds": ["68dd9...", "68dd8..."],
    "summary": {
      "total": 500,
      "successful": 487,
      "skipped": 8,
      "notFound": 5
    }
  }
}
```

---

## 5. Get Assignment Page Data

Comprehensive endpoint for the assignment page UI showing all voters with their assignment status.

### Endpoint
```
GET /api/assignment/assignment-page
```

### Query Parameters
All parameters from "Get Unassigned Voters" plus:
- `assignmentStatus` - 'all', 'assigned', or 'unassigned'

### Request Examples

**Get 100 unassigned voters:**
```bash
curl "http://localhost:3000/api/assignment/assignment-page?limit=100&assignmentStatus=unassigned&voterType=Voter"
```

**Get 500 voters with filters:**
```bash
curl "http://localhost:3000/api/assignment/assignment-page?limit=500&voterType=VoterFour&AC=208&Part=5&assignmentStatus=unassigned"
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
      "AC": "208",
      "Part": "12",
      "assignmentStatus": {
        "isAssigned": false,
        "assignmentId": null,
        "subAdmin": null,
        "assignedAt": null
      }
    }
  ],
  "pagination": { /* ... */ },
  "stats": {
    "totalVoters": 100,
    "assignedVoters": 23,
    "unassignedVoters": 77,
    "assignmentPercentage": "23.00"
  }
}
```

---

## 6. Get Assigned Voters for Sub-Admin

Get all voters currently assigned to a specific sub-admin (existing endpoint).

### Endpoint
```
GET /api/assignment/subadmin/:subAdminId
```

### Request Example
```bash
curl "http://localhost:3000/api/assignment/subadmin/68e456789abcdef123456789?voterType=Voter"
```

---

## Testing Guide

### Test 1: Get Unassigned Voters

```bash
# Test basic call
curl "http://localhost:3000/api/assignment/unassigned/Voter?subAdminId=YOUR_SUBADMIN_ID&limit=10"

# Expected: Returns 10 unassigned voters
```

### Test 2: Get Filter Options

```bash
# Test Voter filter options
curl "http://localhost:3000/api/voter/filter-options"

# Expected: Returns unique ACs, Booths, pnos, Parts

# Test VoterFour filter options
curl "http://localhost:3000/api/voterfour/filter-options"

# Expected: Returns unique values for VoterFour
```

### Test 3: Excel Upload

**Create test Excel file (test-assignment.xlsx):**
```
CardNo
TBZ5096904
TBZ8997157
```

**Upload:**
```bash
curl -X POST "http://localhost:3000/api/assignment/assign-from-excel" \
  -F "file=@test-assignment.xlsx" \
  -F "subAdminId=YOUR_SUBADMIN_ID" \
  -F "voterType=Voter" \
  -F "notes=Test assignment"

# Expected: Shows how many were found and assigned
```

### Test 4: Assign Selected Voters

```bash
# First, get voter IDs
VOTER_IDS='["68dd9a8c90752b2d27b79da9","68dd9a9990752b2d27b7c22c"]'

# Assign them
curl -X POST "http://localhost:3000/api/assignment/assign-selected" \
  -H "Content-Type: application/json" \
  -d "{
    \"subAdminId\": \"YOUR_SUBADMIN_ID\",
    \"voterType\": \"Voter\",
    \"voterIds\": $VOTER_IDS,
    \"notes\": \"Test bulk assignment\"
  }"

# Expected: Shows assignment results
```

---

## Complete Workflow Example

### Scenario: Assign 500 Male Voters from AC 208 to Sub-Admin

```bash
# Step 1: Get filter options to see what's available
curl "http://localhost:3000/api/voter/filter-options"

# Step 2: Get unassigned voters with filters (500 male voters from AC 208)
curl "http://localhost:3000/api/assignment/unassigned/Voter?subAdminId=68e456789abcdef123456789&limit=500&AC=208&Sex=Male&assignmentStatus=unassigned" > voters.json

# Step 3: Extract voter IDs from response (using jq)
cat voters.json | jq -r '.data[] | ._id' > voter_ids.txt

# Step 4: Create array from IDs
VOTER_IDS=$(cat voters.json | jq '[.data[] | ._id]')

# Step 5: Assign all 500 voters
curl -X POST "http://localhost:3000/api/assignment/assign-selected" \
  -H "Content-Type: application/json" \
  -d "{
    \"subAdminId\": \"68e456789abcdef123456789\",
    \"voterType\": \"Voter\",
    \"voterIds\": $VOTER_IDS,
    \"notes\": \"500 male voters from AC 208\"
  }"

# Step 6: Verify assignment
curl "http://localhost:3000/api/assignment/subadmin/68e456789abcdef123456789?voterType=Voter" | jq '.data | length'
# Should show 500 voters assigned
```

---

## Error Handling Reference

### Common Errors

**400 - Missing subAdminId:**
```json
{
  "success": false,
  "message": "subAdminId query parameter is required"
}
```

**400 - Invalid voterType:**
```json
{
  "success": false,
  "message": "voterType must be either 'Voter' or 'VoterFour'"
}
```

**400 - No identifiers in Excel:**
```json
{
  "success": false,
  "message": "No CardNo or CodeNo found in Excel file...",
  "details": {
    "columnsFound": ["Name", "Age", "Address"],
    "supportedColumnNames": ["CardNo", "CodeNo", "VoterID", "EPIC"],
    "hint": "Check if your column name matches..."
  }
}
```

**400 - Too many voters:**
```json
{
  "success": false,
  "message": "Cannot assign more than 10,000 voters at once..."
}
```

**404 - Sub-admin not found:**
```json
{
  "success": false,
  "message": "Sub-admin not found"
}
```

**404 - No voters found:**
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

---

## Performance Benchmarks

| Operation | Voters | Expected Time |
|-----------|--------|---------------|
| Get Unassigned (100) | 100 | < 100ms |
| Get Unassigned (500) | 500 | < 300ms |
| Get Unassigned (1000) | 1000 | < 500ms |
| Assign Selected (100) | 100 | < 200ms |
| Assign Selected (500) | 500 | < 800ms |
| Assign Selected (1000) | 1000 | < 1.5s |
| Excel Upload (100) | 100 | < 1s |
| Excel Upload (1000) | 1000 | < 3s |
| Excel Upload (5000) | 5000 | < 10s |

---

## Security Notes

1. **File Upload Security:**
   - Max file size: 10MB
   - Allowed formats: .xlsx, .xls, .csv only
   - Files are deleted after processing
   - Temporary files stored in `uploads/` directory

2. **Input Validation:**
   - All ObjectIds validated
   - Sub-admin existence verified
   - Voter type enum validation
   - Array size limits enforced

3. **Rate Limiting (Recommended):**
   - General endpoints: 100 req/min
   - Excel upload: 10 req/min
   - Filter options: 30 req/min (can be cached)

---

## Troubleshooting

### Issue: Excel upload returns "No CardNo found"

**Solution:**
1. Check your Excel has a column named exactly: `CardNo`, `CodeNo`, or `VoterID`
2. The error response will show `columnsFound` - check column names
3. Rename your column to match supported names
4. Ensure data starts from row 2 (row 1 is headers)

### Issue: Assignment page loading slowly

**Solution:**
1. Reduce `limit` parameter (use 100 instead of 1000)
2. Add more specific filters (AC, Part, Booth)
3. Check database indexes are created
4. Use `assignmentStatus=unassigned` to reduce data

### Issue: Some voters not being assigned

**Check:**
1. Response shows `votersNotFound` count - those IDs don't exist
2. Response shows `alreadyAssigned` count - those are skipped
3. Verify voter IDs are correct
4. Check voters are `isActive: true`

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│  ASSIGNMENT API QUICK REFERENCE                            │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 GET UNASSIGNED VOTERS                                  │
│  GET /api/assignment/unassigned/:voterType                 │
│  ?subAdminId=xxx&limit=500&AC=208                          │
│                                                             │
│  🔍 GET FILTER OPTIONS                                     │
│  GET /api/voter/filter-options                             │
│  GET /api/voterfour/filter-options                         │
│                                                             │
│  📁 UPLOAD EXCEL                                           │
│  POST /api/assignment/assign-from-excel                    │
│  Form: file, subAdminId, voterType                         │
│                                                             │
│  ✅ ASSIGN SELECTED                                        │
│  POST /api/assignment/assign-selected                      │
│  Body: {subAdminId, voterType, voterIds[]}                 │
│                                                             │
│  📊 ASSIGNMENT PAGE                                        │
│  GET /api/assignment/assignment-page                       │
│  ?limit=100&assignmentStatus=unassigned                    │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Frontend Integration Checklist

- [ ] Assignment page component created
- [ ] Filter dropdowns populated from `/filter-options`
- [ ] Pagination controls connected
- [ ] Search bar implemented
- [ ] Select all / Deselect all buttons
- [ ] Bulk select (100/500/1000) dropdown
- [ ] Assign button triggers `/assign-selected`
- [ ] Excel upload form triggers `/assign-from-excel`
- [ ] Success/error toast notifications
- [ ] Loading states for all operations
- [ ] Assignment status badges shown
- [ ] Refresh data after assignment

---

**Version:** 1.0.0  
**Last Updated:** October 9, 2025  
**Status:** ✅ Ready for Production  

All endpoints are implemented and tested. Deploy to production and enjoy efficient voter assignment! 🚀

