# Combined Voters API - Fetch All Voters from Both Collections

## Overview
The Combined Voters API provides a unified interface to fetch voters from both Voter and VoterFour collections in a single response. This allows you to get all voters together with comprehensive filtering, sorting, and search capabilities.

## Key Features

### 1. Unified Data Access
- **Single Endpoint**: Access both Voter and VoterFour collections through one API
- **Combined Results**: Get all voters in a single response
- **Type Identification**: Each voter includes `voterType` field ('Voter' or 'VoterFour')
- **Collection ID**: Each voter includes `collectionId` for reference

### 2. Advanced Filtering
- **Status Filters**: Filter by `isActive`, `isPaid`, `isVisited`
- **Collection Filter**: Filter by `voterType` ('all', 'voter', 'voterfour')
- **Text Search**: Search across multiple fields
- **Combined Sorting**: Sort across both collections

### 3. Comprehensive Statistics
- **Collection Stats**: Separate statistics for Voter and VoterFour
- **Combined Stats**: Overall statistics across both collections
- **Detailed Metrics**: Active, paid, visited counts and averages

## API Endpoints

### 1. Get All Combined Voters

```bash
GET /api/voters/all
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `isActive` - Filter by active status (true/false)
- `isPaid` - Filter by payment status (true/false)
- `isVisited` - Filter by visit status (true/false)
- `search` - Search across multiple fields
- `sortBy` - Sort field (default: 'Voter Name Eng')
- `sortOrder` - Sort order (asc/desc, default: asc)
- `voterType` - Filter by collection type ('all', 'voter', 'voterfour')

**Example:**
```bash
GET /api/voters/all?page=1&limit=10&isActive=true&voterType=all&sortBy=Voter Name Eng&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "Voter Name Eng": "John Doe",
      "Voter Name": "जॉन डो",
      "Relative Name Eng": "Jane Doe",
      "Relative Name": "जेन डो",
      "AC": "001",
      "Part": "001",
      "Booth": "001",
      "CardNo": "123456",
      "Address": "123 Main Street",
      "Address Eng": "123 Main Street",
      "Sex": "M",
      "Age": "30",
      "isActive": true,
      "isPaid": false,
      "isVisited": false,
      "voterType": "Voter",
      "collectionId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "Voter Name Eng": "Alice Smith",
      "Voter Name": "ऐलिस स्मिथ",
      "Relative Name Eng": "Bob Smith",
      "Relative Name": "बॉब स्मिथ",
      "AC": "002",
      "Part": "002",
      "Booth": "002",
      "CardNo": "789012",
      "Address": "456 Oak Avenue",
      "Address Eng": "456 Oak Avenue",
      "Sex": "F",
      "Age": "25",
      "isActive": true,
      "isPaid": true,
      "isVisited": true,
      "voterType": "VoterFour",
      "collectionId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  },
  "statistics": {
    "totalVoters": 50,
    "totalVoterFour": 50,
    "totalCombined": 100,
    "activeVoters": 45,
    "activeVoterFour": 48,
    "paidVoters": 20,
    "paidVoterFour": 25,
    "visitedVoters": 15,
    "visitedVoterFour": 18
  },
  "filters": {
    "isActive": "true",
    "isPaid": null,
    "isVisited": null,
    "search": null,
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc",
    "voterType": "all"
  }
}
```

### 2. Get Combined Statistics

```bash
GET /api/voters/all/stats
```

**Query Parameters:**
- `isActive` - Filter by active status (true/false)
- `isPaid` - Filter by payment status (true/false)
- `isVisited` - Filter by visit status (true/false)

**Example:**
```bash
GET /api/voters/all/stats?isActive=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "voter": {
      "total": 1000,
      "active": 950,
      "paid": 300,
      "visited": 200,
      "avgAge": 35
    },
    "voterFour": {
      "total": 800,
      "active": 780,
      "paid": 250,
      "visited": 150,
      "avgAge": 32
    },
    "combined": {
      "total": 1800,
      "active": 1730,
      "paid": 550,
      "visited": 350,
      "avgAge": 33
    }
  }
}
```

### 3. Search Combined Voters

```bash
GET /api/voters/all/search
```

**Query Parameters:**
- `q` - Search term (required)
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `voterType` - Filter by collection type ('all', 'voter', 'voterfour')
- `sortBy` - Sort field (default: 'Voter Name Eng')
- `sortOrder` - Sort order (asc/desc, default: asc)

**Example:**
```bash
GET /api/voters/all/search?q=John&voterType=all&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "Voter Name Eng": "John Doe",
      "Voter Name": "जॉन डो",
      "Relative Name Eng": "Jane Doe",
      "Relative Name": "जेन डो",
      "AC": "001",
      "Part": "001",
      "Booth": "001",
      "CardNo": "123456",
      "Address": "123 Main Street",
      "Address Eng": "123 Main Street",
      "Sex": "M",
      "Age": "30",
      "isActive": true,
      "isPaid": false,
      "isVisited": false,
      "voterType": "Voter",
      "collectionId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "limit": 10
  },
  "searchCriteria": {
    "searchTerm": "John",
    "voterType": "all",
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc"
  }
}
```

## Advanced Usage Examples

### 1. Filter by Collection Type

```bash
# Get only Voter collection
GET /api/voters/all?voterType=voter&page=1&limit=20

# Get only VoterFour collection
GET /api/voters/all?voterType=voterfour&page=1&limit=20

# Get all collections (default)
GET /api/voters/all?voterType=all&page=1&limit=20
```

### 2. Advanced Filtering

```bash
# Get active, paid voters from both collections
GET /api/voters/all?isActive=true&isPaid=true&voterType=all

# Get visited voters from VoterFour only
GET /api/voters/all?isVisited=true&voterType=voterfour

# Get inactive voters from both collections
GET /api/voters/all?isActive=false&voterType=all
```

### 3. Search and Sort

```bash
# Search for voters with "John" in name, sorted by age
GET /api/voters/all/search?q=John&sortBy=Age&sortOrder=desc

# Search for voters in specific AC, sorted by name
GET /api/voters/all/search?q=001&sortBy=Voter Name Eng&sortOrder=asc

# Search for voters by address
GET /api/voters/all/search?q=Main Street&voterType=all
```

### 4. Pagination

```bash
# Get first page with 10 records
GET /api/voters/all?page=1&limit=10

# Get second page with 20 records
GET /api/voters/all?page=2&limit=20

# Get last page
GET /api/voters/all?page=5&limit=10
```

## Response Format

### 1. Voter Object Structure
Each voter object includes:
- **Original Fields**: All fields from the original Voter/VoterFour schema
- **voterType**: 'Voter' or 'VoterFour' to identify collection
- **collectionId**: Original document ID for reference
- **Metadata**: isActive, isPaid, isVisited status fields

### 2. Pagination Object
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 100,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

### 3. Statistics Object
```json
{
  "statistics": {
    "totalVoters": 50,
    "totalVoterFour": 50,
    "totalCombined": 100,
    "activeVoters": 45,
    "activeVoterFour": 48,
    "paidVoters": 20,
    "paidVoterFour": 25,
    "visitedVoters": 15,
    "visitedVoterFour": 18
  }
}
```

## Use Cases

### 1. Unified Voter Management
- **Single Interface**: Manage all voters through one API
- **Cross-Collection Operations**: Perform operations across both collections
- **Unified Reporting**: Generate reports from all voter data

### 2. Data Analysis
- **Combined Statistics**: Get overall statistics across collections
- **Comparative Analysis**: Compare data between Voter and VoterFour
- **Trend Analysis**: Analyze trends across all voter data

### 3. Search and Discovery
- **Global Search**: Search across all voter data
- **Unified Results**: Get results from both collections
- **Flexible Filtering**: Filter by collection type or status

### 4. Data Export
- **Bulk Export**: Export all voter data in one operation
- **Unified Format**: Consistent data format across collections
- **Complete Dataset**: Access to complete voter database

## Performance Considerations

### 1. Pagination
- **Efficient Pagination**: Use pagination to handle large datasets
- **Configurable Limits**: Adjust page size based on needs
- **Memory Management**: Avoid loading all data at once

### 2. Filtering
- **Indexed Fields**: Use indexed fields for better performance
- **Combined Filters**: Apply multiple filters for precise results
- **Collection Filtering**: Use voterType filter to limit collections

### 3. Sorting
- **Efficient Sorting**: Sort by indexed fields when possible
- **Combined Sorting**: Sort across both collections efficiently
- **Memory Usage**: Consider memory usage for large sorts

## Error Handling

### 1. Validation Errors
```json
{
  "success": false,
  "message": "Search term is required"
}
```

### 2. Server Errors
```json
{
  "success": false,
  "message": "Error fetching combined voters",
  "error": "Database connection failed"
}
```

### 3. Not Found Errors
```json
{
  "success": false,
  "message": "No voters found matching criteria"
}
```

## Best Practices

### 1. Query Optimization
- **Use Indexes**: Leverage database indexes for better performance
- **Limit Results**: Use pagination to limit result sets
- **Filter Early**: Apply filters before sorting and pagination

### 2. Data Management
- **Consistent Format**: Maintain consistent data format across collections
- **Regular Cleanup**: Clean up inactive or duplicate data
- **Data Validation**: Validate data before processing

### 3. API Usage
- **Pagination**: Always use pagination for large datasets
- **Filtering**: Use appropriate filters to narrow results
- **Caching**: Implement caching for frequently accessed data

The Combined Voters API provides a powerful unified interface to access all voter data from both collections with comprehensive filtering, sorting, and search capabilities! 🎉
