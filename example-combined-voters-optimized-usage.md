# Combined Voters API - Optimized for Large Datasets

## Overview
The Combined Voters API has been optimized to handle large datasets efficiently, addressing MongoDB memory limit issues and providing multiple approaches for different use cases.

## Performance Optimizations

### 1. Memory Limit Solutions
- **Aggregation Pipelines**: Uses MongoDB aggregation for better performance
- **Result Limits**: Limits results to 5000 records per collection to prevent memory issues
- **Efficient Sorting**: Optimized sorting with database-level operations
- **Warning System**: Alerts users when approaching limits

### 2. Multiple Access Methods
- **Standard Endpoint**: `/api/voters/all` - For normal use cases
- **Stream Endpoint**: `/api/voters/all/stream` - For very large datasets with cursor-based pagination
- **Search Endpoint**: `/api/voters/all/search` - Optimized search across collections
- **Stats Endpoint**: `/api/voters/all/stats` - Efficient statistics without loading data

## API Endpoints

### 1. Standard Combined Voters (Optimized)

```bash
GET /api/voters/all
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20, max recommended: 100)
- `isActive` - Filter by active status (true/false)
- `isPaid` - Filter by payment status (true/false)
- `isVisited` - Filter by visit status (true/false)
- `search` - Search across multiple fields
- `sortBy` - Sort field (default: 'Voter Name Eng')
- `sortOrder` - Sort order (asc/desc, default: asc)
- `voterType` - Filter by collection type ('all', 'voter', 'voterfour')

**Example:**
```bash
GET /api/voters/all?page=1&limit=50&isActive=true&voterType=all&sortBy=Voter Name Eng&sortOrder=asc
```

**Response with Warnings:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "Voter Name Eng": "John Doe",
      "Voter Name": "जॉन डो",
      "AC": "001",
      "Part": "001",
      "Booth": "001",
      "isActive": true,
      "isPaid": false,
      "isVisited": false,
      "voterType": "Voter",
      "collectionId": "64f8a1b2c3d4e5f6a7b8c9d0"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 100,
    "totalCount": 5000,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 50
  },
  "statistics": {
    "totalVoters": 2500,
    "totalVoterFour": 2500,
    "totalCombined": 5000,
    "activeVoters": 2400,
    "activeVoterFour": 2450,
    "paidVoters": 800,
    "paidVoterFour": 900,
    "visitedVoters": 600,
    "visitedVoterFour": 700
  },
  "filters": {
    "isActive": "true",
    "isPaid": null,
    "isVisited": null,
    "search": null,
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc",
    "voterType": "all"
  },
  "warnings": [
    "Large dataset detected. Results are limited to 5000 records per collection for performance.",
    "Total dataset exceeds 10,000 records. Consider using filters to narrow results."
  ]
}
```

### 2. Stream Endpoint for Large Datasets

```bash
GET /api/voters/all/stream
```

**Query Parameters:**
- `limit` - Records per batch (default: 100, max: 1000)
- `isActive` - Filter by active status
- `isPaid` - Filter by payment status
- `isVisited` - Filter by visit status
- `search` - Search across multiple fields
- `sortBy` - Sort field (default: 'Voter Name Eng')
- `sortOrder` - Sort order (asc/desc, default: asc)
- `voterType` - Filter by collection type ('all', 'voter', 'voterfour')
- `lastId` - Cursor for pagination (from previous response)

**Example:**
```bash
# First request
GET /api/voters/all/stream?limit=100&voterType=all&sortBy=Voter Name Eng&sortOrder=asc

# Subsequent requests using cursor
GET /api/voters/all/stream?limit=100&voterType=all&sortBy=Voter Name Eng&sortOrder=asc&lastId=64f8a1b2c3d4e5f6a7b8c9d0
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
      "AC": "001",
      "Part": "001",
      "Booth": "001",
      "isActive": true,
      "isPaid": false,
      "isVisited": false,
      "voterType": "Voter",
      "collectionId": "64f8a1b2c3d4e5f6a7b8c9d0"
    }
  ],
  "pagination": {
    "limit": 100,
    "hasMore": true,
    "nextCursor": "64f8a1b2c3d4e5f6a7b8c9d1"
  },
  "filters": {
    "isActive": null,
    "isPaid": null,
    "isVisited": null,
    "search": null,
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc",
    "voterType": "all"
  }
}
```

### 3. Optimized Search

```bash
GET /api/voters/all/search
```

**Query Parameters:**
- `q` - Search term (required)
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20, max: 100)
- `voterType` - Filter by collection type ('all', 'voter', 'voterfour')
- `sortBy` - Sort field (default: 'Voter Name Eng')
- `sortOrder` - Sort order (asc/desc, default: asc)

**Example:**
```bash
GET /api/voters/all/search?q=John&voterType=all&page=1&limit=50
```

### 4. Efficient Statistics

```bash
GET /api/voters/all/stats
```

**Query Parameters:**
- `isActive` - Filter by active status
- `isPaid` - Filter by payment status
- `isVisited` - Filter by visit status

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
      "total": 50000,
      "active": 48000,
      "paid": 15000,
      "visited": 12000,
      "avgAge": 35
    },
    "voterFour": {
      "total": 30000,
      "active": 29000,
      "paid": 10000,
      "visited": 8000,
      "avgAge": 32
    },
    "combined": {
      "total": 80000,
      "active": 77000,
      "paid": 25000,
      "visited": 20000,
      "avgAge": 33
    }
  }
}
```

## Performance Guidelines

### 1. For Small Datasets (< 1000 records)
- Use standard endpoint: `/api/voters/all`
- No performance concerns
- Full sorting and filtering available

### 2. For Medium Datasets (1000 - 10000 records)
- Use standard endpoint with filters: `/api/voters/all?isActive=true`
- Apply filters to narrow results
- Use pagination with reasonable limits (50-100 records per page)

### 3. For Large Datasets (> 10000 records)
- Use stream endpoint: `/api/voters/all/stream`
- Implement cursor-based pagination
- Process data in batches
- Consider using filters to narrow results

### 4. For Very Large Datasets (> 100000 records)
- Use stream endpoint with filters
- Implement client-side caching
- Consider data archiving strategies
- Use statistics endpoint for overview

## Implementation Examples

### 1. Client-Side Streaming Implementation

```javascript
async function streamAllVoters(filters = {}) {
  const allVoters = [];
  let hasMore = true;
  let lastId = null;
  
  while (hasMore) {
    const params = new URLSearchParams({
      limit: '100',
      ...filters
    });
    
    if (lastId) {
      params.append('lastId', lastId);
    }
    
    const response = await fetch(`/api/voters/all/stream?${params}`);
    const data = await response.json();
    
    if (data.success) {
      allVoters.push(...data.data);
      hasMore = data.pagination.hasMore;
      lastId = data.pagination.nextCursor;
    } else {
      console.error('Error streaming voters:', data.message);
      break;
    }
  }
  
  return allVoters;
}

// Usage
const allVoters = await streamAllVoters({
  isActive: 'true',
  voterType: 'all'
});
```

### 2. Paginated Implementation

```javascript
async function getVotersPaginated(page = 1, limit = 50, filters = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  const response = await fetch(`/api/voters/all?${params}`);
  const data = await response.json();
  
  if (data.success) {
    return {
      voters: data.data,
      pagination: data.pagination,
      warnings: data.warnings
    };
  } else {
    throw new Error(data.message);
  }
}

// Usage
const result = await getVotersPaginated(1, 50, {
  isActive: 'true',
  voterType: 'all'
});
```

### 3. Search Implementation

```javascript
async function searchVoters(searchTerm, filters = {}) {
  const params = new URLSearchParams({
    q: searchTerm,
    limit: '50',
    ...filters
  });
  
  const response = await fetch(`/api/voters/all/search?${params}`);
  const data = await response.json();
  
  if (data.success) {
    return {
      voters: data.data,
      pagination: data.pagination,
      searchCriteria: data.searchCriteria
    };
  } else {
    throw new Error(data.message);
  }
}

// Usage
const searchResults = await searchVoters('John', {
  voterType: 'all',
  isActive: 'true'
});
```

## Error Handling

### 1. Memory Limit Errors
```json
{
  "success": false,
  "message": "Error fetching combined voters",
  "error": "Sort exceeded memory limit of 33554432 bytes"
}
```

**Solution**: Use stream endpoint or apply filters to reduce dataset size.

### 2. Large Dataset Warnings
```json
{
  "warnings": [
    "Large dataset detected. Results are limited to 5000 records per collection for performance.",
    "Total dataset exceeds 10,000 records. Consider using filters to narrow results."
  ]
}
```

**Solution**: Use stream endpoint for large datasets or apply filters.

### 3. Performance Recommendations
- Use filters to narrow results
- Implement pagination for large datasets
- Use stream endpoint for very large datasets
- Consider data archiving for old records

## Best Practices

### 1. Database Optimization
- **Indexes**: Ensure proper indexes on frequently queried fields
- **Compound Indexes**: Create compound indexes for common filter combinations
- **Text Indexes**: Use text indexes for search functionality

### 2. Application Optimization
- **Caching**: Implement caching for frequently accessed data
- **Pagination**: Always use pagination for large datasets
- **Filtering**: Apply filters to narrow results
- **Streaming**: Use stream endpoint for very large datasets

### 3. Monitoring
- **Performance Metrics**: Monitor query performance
- **Memory Usage**: Track memory usage for large operations
- **Response Times**: Monitor API response times
- **Error Rates**: Track error rates and types

The optimized Combined Voters API now efficiently handles large datasets while providing multiple access methods for different use cases! 🚀
