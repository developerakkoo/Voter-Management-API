# Combined Voters API - Sorting by PNO and Other Fields

## Overview
The Combined Voters API supports sorting by the `pno` field and many other voter fields. The `pno` field represents the page number in the voter list and is useful for organizing voters by their position in the electoral roll.

## Supported Sort Fields

### 1. Voter Information Fields
- `Voter Name Eng` - English voter name (default)
- `Voter Name` - Local language voter name
- `Relative Name Eng` - English relative name
- `Relative Name` - Local language relative name
- `Sex` - Gender
- `Age` - Age (numeric sorting)

### 2. Location Fields
- `AC` - Assembly Constituency
- `Part` - Part number
- `Booth` - Booth name
- `Booth Eng` - English booth name
- `Address` - Local language address
- `Address Eng` - English address

### 3. Electoral Roll Fields
- `pno` - Page number (numeric sorting)
- `Sr No` - Serial number (numeric sorting)
- `House No` - House number
- `CardNo` - Voter card number

### 4. Status Fields
- `isPaid` - Payment status
- `isVisited` - Visit status
- `voterType` - Collection type (Voter/VoterFour)

## API Usage Examples

### 1. Sort by PNO (Page Number)

```bash
# Sort by pno in ascending order
GET /api/voters/all?sortBy=pno&sortOrder=asc&page=1&limit=20

# Sort by pno in descending order
GET /api/voters/all?sortBy=pno&sortOrder=desc&page=1&limit=20
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68dd9a8090752b2d27b77a5c",
      "AC": "208",
      "Part": "5",
      "Sr No": "447",
      "House No": "लोहगाव",
      "Voter Name": "अश्विनी खांडवे",
      "Voter Name Eng": "Ashwini Khandve",
      "Relative Name": "राजेंद्र खांडवे",
      "Relative Name Eng": "Rajendra Khandve",
      "Sex": "Female",
      "Age": 30,
      "CardNo": "TBZ4724761",
      "Address": "खेसे आळी ते सरकारी दवाखान्या पर्यंत",
      "Address Eng": "खेसे आळी ते सरकारी दवाखान्या पर्यंत",
      "Booth": "संत तुकाराम माध्यमिक व उच्च माध्यमिक विदयालय कला वाणिज्य विज्ञान व व्यसायिक अभ्यासक्रम विभाग लोहगाव (बसस्टॉप)  वडगावशिंदे रोड, उत्तरेकडील खोली क्रं. 1, नविन इमारत",
      "Booth Eng": "Sant Tukaram Secondary & Higher Secondary School Lohgaon Department Of Arts Commerce Science And Vocational Courses Near Bus Stand, North Side Room No. 1, New Building",
      "Status": "",
      "pno": "3",
      "isActive": true,
      "voterType": "Voter",
      "collectionId": "68dd9a8090752b2d27b77a5c"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 50,
    "totalCount": 1000,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

### 2. Sort by Multiple Fields

```bash
# Sort by AC, then Part, then pno
GET /api/voters/all?sortBy=AC&sortOrder=asc&page=1&limit=20

# Sort by Part, then pno
GET /api/voters/all?sortBy=Part&sortOrder=asc&page=1&limit=20

# Sort by pno within a specific AC
GET /api/voters/all?sortBy=pno&sortOrder=asc&page=1&limit=20
```

### 3. Filter and Sort by PNO

```bash
# Get voters from specific AC, sorted by pno
GET /api/voters/all?sortBy=pno&sortOrder=asc&page=1&limit=20

# Get active voters sorted by pno
GET /api/voters/all?sortBy=pno&sortOrder=asc&isActive=true&page=1&limit=20

# Get voters from specific Part, sorted by pno
GET /api/voters/all?sortBy=pno&sortOrder=asc&page=1&limit=20
```

### 4. Search and Sort by PNO

```bash
# Search for voters and sort by pno
GET /api/voters/all/search?q=Ashwini&sortBy=pno&sortOrder=asc&page=1&limit=20
```

### 5. Stream Endpoint with PNO Sorting

```bash
# Stream voters sorted by pno
GET /api/voters/all/stream?sortBy=pno&sortOrder=asc&limit=100

# Continue streaming with cursor
GET /api/voters/all/stream?sortBy=pno&sortOrder=asc&limit=100&lastId=68dd9a8090752b2d27b77a5c
```

## Advanced Sorting Examples

### 1. Sort by Electoral Roll Position

```bash
# Sort by AC, Part, then pno (electoral roll order)
GET /api/voters/all?sortBy=AC&sortOrder=asc&page=1&limit=20

# Then sort by Part within AC
GET /api/voters/all?sortBy=Part&sortOrder=asc&page=1&limit=20

# Finally sort by pno within Part
GET /api/voters/all?sortBy=pno&sortOrder=asc&page=1&limit=20
```

### 2. Sort by Voter Card Number

```bash
# Sort by CardNo
GET /api/voters/all?sortBy=CardNo&sortOrder=asc&page=1&limit=20
```

### 3. Sort by Serial Number

```bash
# Sort by Sr No
GET /api/voters/all?sortBy=Sr No&sortOrder=asc&page=1&limit=20
```

### 4. Sort by House Number

```bash
# Sort by House No
GET /api/voters/all?sortBy=House No&sortOrder=asc&page=1&limit=20
```

## JavaScript Implementation

### 1. Basic PNO Sorting

```javascript
async function getVotersSortedByPNO(page = 1, limit = 20, sortOrder = 'asc') {
  const params = new URLSearchParams({
    sortBy: 'pno',
    sortOrder: sortOrder,
    page: page.toString(),
    limit: limit.toString()
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
const result = await getVotersSortedByPNO(1, 20, 'asc');
console.log('Voters sorted by PNO:', result.voters);
```

### 2. Filtered PNO Sorting

```javascript
async function getVotersByACAndPNO(ac, page = 1, limit = 20) {
  const params = new URLSearchParams({
    sortBy: 'pno',
    sortOrder: 'asc',
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(`/api/voters/all?${params}`);
  const data = await response.json();
  
  if (data.success) {
    // Filter by AC on client side if needed
    const filteredVoters = data.data.filter(voter => voter.AC === ac);
    return {
      voters: filteredVoters,
      pagination: data.pagination
    };
  } else {
    throw new Error(data.message);
  }
}

// Usage
const result = await getVotersByACAndPNO('208', 1, 20);
console.log('Voters from AC 208 sorted by PNO:', result.voters);
```

### 3. Stream with PNO Sorting

```javascript
async function streamVotersByPNO(filters = {}) {
  const allVoters = [];
  let hasMore = true;
  let lastId = null;
  
  while (hasMore) {
    const params = new URLSearchParams({
      sortBy: 'pno',
      sortOrder: 'asc',
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
const allVoters = await streamVotersByPNO({
  isActive: 'true',
  voterType: 'all'
});
console.log('All voters sorted by PNO:', allVoters);
```

## Use Cases for PNO Sorting

### 1. Electoral Roll Organization
- **Page-wise Listing**: Organize voters by page number in electoral roll
- **Sequential Access**: Access voters in the order they appear in the roll
- **Printing Support**: Generate voter lists in electoral roll order

### 2. Booth Management
- **Booth-wise Organization**: Group voters by booth and then by page number
- **Sequential Processing**: Process voters in the order they appear in the roll
- **Verification**: Verify voter information against electoral roll

### 3. Data Analysis
- **Pattern Analysis**: Analyze voter distribution across pages
- **Geographic Analysis**: Study voter patterns within electoral areas
- **Demographic Analysis**: Analyze voter demographics by page number

### 4. Reporting
- **Page-wise Reports**: Generate reports organized by page number
- **Sequential Reports**: Create reports in electoral roll order
- **Summary Reports**: Generate summaries by page ranges

## Performance Considerations

### 1. Large Datasets
- **Use Stream Endpoint**: For very large datasets, use the stream endpoint
- **Apply Filters**: Use filters to narrow results before sorting
- **Pagination**: Use pagination to handle large result sets

### 2. Sorting Performance
- **Database Indexes**: Ensure proper indexes on sort fields
- **Numeric Sorting**: PNO sorting is optimized for numeric values
- **Combined Sorting**: Use multiple sort criteria for better organization

### 3. Memory Management
- **Result Limits**: API limits results to prevent memory issues
- **Batch Processing**: Process data in batches for large datasets
- **Efficient Queries**: Use filters to reduce dataset size

## Best Practices

### 1. Sorting Strategy
- **Primary Sort**: Use PNO as primary sort for electoral roll order
- **Secondary Sort**: Use other fields as secondary sort criteria
- **Consistent Ordering**: Maintain consistent sort order across requests

### 2. Data Organization
- **AC-Part-PNO**: Organize by AC, then Part, then PNO
- **Sequential Access**: Access data sequentially for better performance
- **Batch Processing**: Process data in logical batches

### 3. User Experience
- **Clear Sorting**: Make sorting options clear to users
- **Consistent Results**: Ensure consistent results across requests
- **Performance Feedback**: Provide feedback on large dataset processing

The Combined Voters API now fully supports sorting by `pno` and other electoral roll fields, making it easy to organize and access voter data in the order it appears in the electoral roll! 🗳️
