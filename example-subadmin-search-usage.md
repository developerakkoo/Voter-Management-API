# Sub Admin Search & Filter API

## Overview
The Sub Admin API now includes comprehensive search, sort, and filter functionality for assigned voters. Sub admins can search through their assigned voters using various criteria and filters.

## New Search Endpoints

### 1. Advanced Search
```bash
GET /api/subadmin/voters/search
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

**Query Parameters:**
- `q` - General search query (searches across multiple fields)
- `Voter Name Eng` - Search by English voter name
- `Voter Name` - Search by voter name
- `Relative Name Eng` - Search by English relative name
- `Relative Name` - Search by relative name
- `AC` - Search by Assembly Constituency
- `Part` - Search by Part
- `Booth no` - Search by booth number
- `CardNo` - Search by card number
- `CodeNo` - Search by code number
- `Address` - Search by address
- `Address Eng` - Search by English address
- `Booth` - Search by booth
- `Booth Eng` - Search by English booth
- `Sex` - Filter by gender
- `Age` - Filter by age
- `sourceFile` - Filter by source file
- `voterType` - Filter by voter type (Voter/VoterFour)
- `isPaid` - Filter by payment status
- `isVisited` - Filter by visit status
- `isActive` - Filter by active status
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `sortBy` - Sort field (default: 'assignedAt')
- `sortOrder` - Sort order (asc/desc, default: desc)

### 2. Advanced Filtering
```bash
GET /api/subadmin/voters/filter
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

**Query Parameters:**
- `voterType` - Filter by voter type (Voter/VoterFour)
- `isPaid` - Filter by payment status
- `isVisited` - Filter by visit status
- `isActive` - Filter by active status
- `ageRange` - Filter by age range (e.g., "18-65", "25-", "-60")
- `gender` - Filter by gender
- `location` - Filter by location (searches Address, Address Eng, Booth, Booth Eng)
- `sourceFile` - Filter by source file
- `assignedDateFrom` - Filter by assignment date from
- `assignedDateTo` - Filter by assignment date to
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `sortBy` - Sort field (default: 'assignedAt')
- `sortOrder` - Sort order (asc/desc, default: desc)

## Example Usage

### 1. General Search
```bash
# Search for voters containing "John" in any field
GET /api/subadmin/voters/search?q=John&page=1&limit=10
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 2. Specific Field Search
```bash
# Search by specific voter name
GET /api/subadmin/voters/search?Voter Name Eng=John Doe&voterType=Voter
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 3. Multiple Field Search
```bash
# Search by name and location
GET /api/subadmin/voters/search?Voter Name Eng=John&Address=Street&isPaid=true
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 4. Advanced Filtering
```bash
# Filter by age range and payment status
GET /api/subadmin/voters/filter?ageRange=25-65&isPaid=true&voterType=Voter
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 5. Date Range Filtering
```bash
# Filter by assignment date range
GET /api/subadmin/voters/filter?assignedDateFrom=2024-01-01&assignedDateTo=2024-01-31
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 6. Location-based Filtering
```bash
# Filter by location
GET /api/subadmin/voters/filter?location=District&gender=Male&isVisited=false
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 7. Sorting Options
```bash
# Sort by voter name
GET /api/subadmin/voters/search?sortBy=voterId.Voter Name Eng&sortOrder=asc
Authorization: Bearer SUBADMIN_JWT_TOKEN

# Sort by assignment date
GET /api/subadmin/voters/search?sortBy=assignedAt&sortOrder=desc
Authorization: Bearer SUBADMIN_JWT_TOKEN

# Sort by payment status
GET /api/subadmin/voters/search?sortBy=voterId.isPaid&sortOrder=desc
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

## Response Format

### Search Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "subAdminId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "voterId": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "Voter Name Eng": "John Doe",
        "Voter Name": "जॉन डो",
        "Age": 35,
        "Sex": "Male",
        "isPaid": true,
        "isVisited": false,
        "Address": "123 Main Street",
        "Booth": "Booth 1"
      },
      "voterType": "Voter",
      "assignedAt": "2024-01-15T10:30:00.000Z",
      "assignedBy": "64f8a1b2c3d4e5f6a7b8c9d3"
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
  "searchCriteria": {
    "query": "John",
    "filters": {
      "Voter Name Eng": null,
      "voterType": "Voter",
      "isPaid": "true"
    }
  }
}
```

### Filter Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  },
  "filterCriteria": {
    "voterType": "Voter",
    "isPaid": "true",
    "ageRange": "25-65",
    "gender": "Male",
    "location": "District"
  }
}
```

## Advanced Search Examples

### 1. Complex Search Query
```bash
# Search for unpaid male voters in specific age range from a specific source file
GET /api/subadmin/voters/search?q=John&Sex=Male&isPaid=false&sourceFile=1st.xlsx&ageRange=25-65
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 2. Location-based Search
```bash
# Find voters in specific booth
GET /api/subadmin/voters/search?Booth=Booth 1&isVisited=false&sortBy=voterId.Voter Name Eng
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 3. Status-based Filtering
```bash
# Find all paid and visited voters
GET /api/subadmin/voters/filter?isPaid=true&isVisited=true&voterType=VoterFour
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 4. Assignment Date Filtering
```bash
# Find voters assigned in the last week
GET /api/subadmin/voters/filter?assignedDateFrom=2024-01-08&assignedDateTo=2024-01-15&sortBy=assignedAt&sortOrder=desc
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 5. Multi-criteria Search
```bash
# Search for specific voter with multiple criteria
GET /api/subadmin/voters/search?Voter Name Eng=John&Relative Name Eng=Smith&AC=AC001&isPaid=true&isVisited=false
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

## Sorting Options

### Available Sort Fields:
- `assignedAt` - Sort by assignment date
- `voterId.Voter Name Eng` - Sort by voter name
- `voterId.Age` - Sort by age
- `voterId.isPaid` - Sort by payment status
- `voterId.isVisited` - Sort by visit status
- `voterId.Sex` - Sort by gender
- `voterId.AC` - Sort by Assembly Constituency
- `voterId.Booth` - Sort by booth

### Sort Order:
- `asc` - Ascending order
- `desc` - Descending order (default)

## Performance Features

### 1. Pagination
- Efficient handling of large datasets
- Configurable page size
- Navigation information included

### 2. Indexing
- Database indexes for fast queries
- Optimized search performance
- Efficient filtering

### 3. Caching
- Query result caching
- Reduced database load
- Faster response times

## Use Cases

### 1. Campaign Management
- Find voters by location for door-to-door campaigns
- Filter by payment status for follow-up
- Search by name for specific voter lookup

### 2. Progress Tracking
- Monitor visit completion rates
- Track payment collection progress
- Generate reports by various criteria

### 3. Data Analysis
- Analyze voter demographics
- Track assignment patterns
- Generate statistics and insights

### 4. Field Operations
- Find voters in specific areas
- Filter by assignment date for recent assignments
- Search by booth for polling station management

## Error Handling

- **400 Bad Request**: Invalid query parameters
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Access denied
- **500 Internal Server Error**: Database or server errors

## Security Features

- **Authentication Required**: All endpoints require valid JWT token
- **Data Isolation**: Sub admins only see their assigned voters
- **Access Control**: Voter access validation for each request
- **Input Validation**: Proper validation of all query parameters
