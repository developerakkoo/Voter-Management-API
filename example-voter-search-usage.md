# Voter Search Functionality - Usage Guide

## Overview
The Voter API now includes comprehensive search functionality for the "Voter Name Eng" field, allowing you to search for voters by name with pagination, filtering, and sorting capabilities.

## Search Features

### 1. Search in Main Endpoint
The main `/api/voter` endpoint now includes search functionality:

```bash
GET /api/voter?search=john&page=1&limit=20&isPaid=true&isActive=true&sortBy=Voter Name Eng&sortOrder=asc
```

**Query Parameters:**
- `search` (optional): Search term for "Voter Name Eng" field
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)
- `isPaid` (optional): Filter by payment status (true/false)
- `isVisited` (optional): Filter by visit status (true/false)
- `isActive` (optional): Filter by active status (true/false)
- `sortBy` (optional): Sort field (default: "Voter Name Eng")
- `sortOrder` (optional): Sort direction "asc" or "desc" (default: "asc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "Voter Name Eng": "John Doe",
      "Voter Name": "जॉन डो",
      "Relative Name Eng": "Jane Doe",
      "Sex": "Male",
      "Age": 35,
      "pno": "3",
      "isPaid": true,
      "isVisited": false,
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
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
    "isPaid": "true",
    "isVisited": null,
    "isActive": "true",
    "search": "john",
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc"
  }
}
```

### 2. Dedicated Search Endpoint
A dedicated search endpoint for more focused searching:

```bash
GET /api/voter/search?q=john&page=1&limit=20&isPaid=true&isActive=true&sortBy=Voter Name Eng&sortOrder=asc
```

**Query Parameters:**
- `q` (required): Search query for "Voter Name Eng" field
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20)
- `isPaid` (optional): Filter by payment status (true/false)
- `isVisited` (optional): Filter by visit status (true/false)
- `isActive` (optional): Filter by active status (true/false)
- `sortBy` (optional): Sort field (default: "Voter Name Eng")
- `sortOrder` (optional): Sort direction "asc" or "desc" (default: "asc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "Voter Name Eng": "John Doe",
      "Voter Name": "जॉन डो",
      "Relative Name Eng": "Jane Doe",
      "Sex": "Male",
      "Age": 35,
      "pno": "3",
      "isPaid": true,
      "isVisited": false,
      "isActive": true,
      "createdAt": "2024-01-10T08:00:00.000Z",
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
  "searchCriteria": {
    "query": "john",
    "isPaid": "true",
    "isVisited": null,
    "isActive": "true",
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc"
  }
}
```

## JavaScript Implementation Examples

### 1. Search Voters in Main Endpoint

```javascript
async function searchVotersInMain(searchTerm, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (searchTerm) queryParams.append('search', searchTerm);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.isPaid !== undefined) queryParams.append('isPaid', filters.isPaid);
    if (filters.isVisited !== undefined) queryParams.append('isVisited', filters.isVisited);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const response = await fetch(`/api/voter?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Search results:', result.data);
      console.log('Pagination:', result.pagination);
      console.log('Applied filters:', result.filters);
      return result;
    } else {
      console.error('Search error:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const searchResults = await searchVotersInMain('john', {
  page: 1,
  limit: 20,
  isPaid: true,
  isActive: true,
  sortBy: 'Voter Name Eng',
  sortOrder: 'asc'
});
```

### 2. Use Dedicated Search Endpoint

```javascript
async function searchVoters(query, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.isPaid !== undefined) queryParams.append('isPaid', filters.isPaid);
    if (filters.isVisited !== undefined) queryParams.append('isVisited', filters.isVisited);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const response = await fetch(`/api/voter/search?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('Search results:', result.data);
      console.log('Pagination:', result.pagination);
      console.log('Search criteria:', result.searchCriteria);
      return result;
    } else {
      console.error('Search error:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const searchResults = await searchVoters('john', {
  page: 1,
  limit: 20,
  isPaid: true,
  isActive: true,
  sortBy: 'Voter Name Eng',
  sortOrder: 'asc'
});
```

### 3. Advanced Search with Multiple Filters

```javascript
async function advancedVoterSearch(searchTerm, options = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    // Search term
    if (searchTerm) queryParams.append('search', searchTerm);
    
    // Pagination
    queryParams.append('page', options.page || 1);
    queryParams.append('limit', options.limit || 20);
    
    // Filters
    if (options.isPaid !== undefined) queryParams.append('isPaid', options.isPaid);
    if (options.isVisited !== undefined) queryParams.append('isVisited', options.isVisited);
    if (options.isActive !== undefined) queryParams.append('isActive', options.isActive);
    
    // Sorting
    queryParams.append('sortBy', options.sortBy || 'Voter Name Eng');
    queryParams.append('sortOrder', options.sortOrder || 'asc');
    
    const response = await fetch(`/api/voter?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        voters: result.data,
        pagination: result.pagination,
        filters: result.filters,
        totalResults: result.pagination.totalCount
      };
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Advanced search error:', error);
    return null;
  }
}

// Usage
const results = await advancedVoterSearch('john', {
  page: 1,
  limit: 50,
  isPaid: true,
  isVisited: false,
  isActive: true,
  sortBy: 'Age',
  sortOrder: 'desc'
});

if (results) {
  console.log(`Found ${results.totalResults} voters matching "john"`);
  console.log('Voters:', results.voters);
  console.log('Pagination:', results.pagination);
}
```

### 4. Real-time Search Implementation

```javascript
class VoterSearch {
  constructor() {
    this.searchTimeout = null;
    this.currentSearch = '';
  }
  
  // Debounced search to avoid too many API calls
  search(searchTerm, filters = {}) {
    clearTimeout(this.searchTimeout);
    
    this.searchTimeout = setTimeout(async () => {
      if (searchTerm.length >= 2) { // Minimum 2 characters
        this.currentSearch = searchTerm;
        const results = await this.performSearch(searchTerm, filters);
        this.displayResults(results);
      } else if (searchTerm.length === 0) {
        // Clear results when search is empty
        this.clearResults();
      }
    }, 300); // 300ms delay
  }
  
  async performSearch(searchTerm, filters) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('search', searchTerm);
      queryParams.append('page', filters.page || 1);
      queryParams.append('limit', filters.limit || 20);
      
      if (filters.isPaid !== undefined) queryParams.append('isPaid', filters.isPaid);
      if (filters.isVisited !== undefined) queryParams.append('isVisited', filters.isVisited);
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
      
      const response = await fetch(`/api/voter?${queryParams}`);
      const result = await response.json();
      
      return result.success ? result : null;
    } catch (error) {
      console.error('Search error:', error);
      return null;
    }
  }
  
  displayResults(results) {
    if (results && results.data.length > 0) {
      console.log(`Found ${results.pagination.totalCount} voters matching "${this.currentSearch}"`);
      console.log('Results:', results.data);
    } else {
      console.log('No voters found matching your search');
    }
  }
  
  clearResults() {
    console.log('Search cleared');
  }
}

// Usage
const voterSearch = new VoterSearch();

// Simulate user typing
voterSearch.search('john', { isPaid: true, isActive: true });
```

## Search Examples

### 1. Basic Name Search
```bash
# Search for voters with "john" in their name
GET /api/voter?search=john

# Search for voters with "smith" in their name
GET /api/voter?search=smith
```

### 2. Search with Filters
```bash
# Search for paid voters with "john" in their name
GET /api/voter?search=john&isPaid=true

# Search for active, visited voters with "alice" in their name
GET /api/voter?search=alice&isActive=true&isVisited=true
```

### 3. Search with Sorting
```bash
# Search for "john" and sort by age descending
GET /api/voter?search=john&sortBy=Age&sortOrder=desc

# Search for "smith" and sort by name ascending
GET /api/voter?search=smith&sortBy=Voter Name Eng&sortOrder=asc
```

### 4. Dedicated Search Endpoint
```bash
# Use dedicated search endpoint
GET /api/voter/search?q=john&isPaid=true&isActive=true

# Search with pagination
GET /api/voter/search?q=alice&page=2&limit=10
```

## Error Handling

### Search Query Required Error
```json
{
  "success": false,
  "message": "Search query (q) is required"
}
```

### No Results Found
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
  "searchCriteria": {
    "query": "nonexistent",
    "isPaid": null,
    "isVisited": null,
    "isActive": null,
    "sortBy": "Voter Name Eng",
    "sortOrder": "asc"
  }
}
```

## Best Practices

### 1. Search Performance
- Use minimum 2-3 characters for search to avoid too many results
- Implement debouncing for real-time search
- Use pagination for large result sets

### 2. User Experience
- Show search results count
- Provide clear feedback when no results found
- Allow users to clear search easily

### 3. Search Optimization
- Combine search with filters for better results
- Use appropriate sorting for better user experience
- Cache frequent search results if needed

The Voter API now provides powerful search functionality for finding voters by name with comprehensive filtering and sorting options! 🔍
