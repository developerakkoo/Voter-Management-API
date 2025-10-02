# Voter API Usage Examples

## Quick Start

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Upload your Excel file:**
   ```bash
   curl -X POST http://localhost:3000/api/upload \
     -F "excelFile=@excel/208-Voterlist-Partwise-5-49-177-191 (2) (2).xlsx"
   ```

3. **Search voters:**
   ```bash
   curl "http://localhost:3000/api/search?voterNameEng=john"
   ```

## Professional Search Examples

### 1. General Text Search
Search across all fields for any mention of "john":
```bash
curl "http://localhost:3000/api/search?q=john"
```

### 2. Specific Field Search
Search by voter name (English):
```bash
curl "http://localhost:3000/api/search?voterNameEng=john"
```

### 3. Multiple Criteria Search
Search by name and city:
```bash
curl "http://localhost:3000/api/search?voterNameEng=john&city=mumbai"
```

### 4. Paginated Search
Get first 10 results, sorted by name:
```bash
curl "http://localhost:3000/api/search?page=1&limit=10&sortBy=voterNameEng&sortOrder=asc"
```

### 5. Advanced Search with All Parameters
```bash
curl "http://localhost:3000/api/search?\
voterNameEng=john&\
fatherNameEng=smith&\
city=mumbai&\
constituency=central&\
page=1&\
limit=20&\
sortBy=voterNameEng&\
sortOrder=asc"
```

## JavaScript/Node.js Examples

### Upload Excel File
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function uploadExcel() {
  const form = new FormData();
  form.append('excelFile', fs.createReadStream('path/to/your/excel/file.xlsx'));
  
  try {
    const response = await axios.post('http://localhost:3000/api/upload', form, {
      headers: form.getHeaders()
    });
    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response.data);
  }
}
```

### Search Voters
```javascript
const axios = require('axios');

async function searchVoters() {
  try {
    const response = await axios.get('http://localhost:3000/api/search', {
      params: {
        voterNameEng: 'john',
        city: 'mumbai',
        page: 1,
        limit: 10
      }
    });
    
    console.log('Search results:', response.data.data);
    console.log('Total count:', response.data.pagination.totalCount);
  } catch (error) {
    console.error('Search failed:', error.response.data);
  }
}
```

### Get Statistics
```javascript
async function getStats() {
  try {
    const response = await axios.get('http://localhost:3000/api/stats');
    console.log('Statistics:', response.data.statistics);
  } catch (error) {
    console.error('Stats failed:', error.response.data);
  }
}
```

## Python Examples

### Upload Excel File
```python
import requests

def upload_excel(file_path):
    url = 'http://localhost:3000/api/upload'
    
    with open(file_path, 'rb') as file:
        files = {'excelFile': file}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        print('Upload successful:', response.json())
    else:
        print('Upload failed:', response.json())

# Usage
upload_excel('path/to/your/excel/file.xlsx')
```

### Search Voters
```python
import requests

def search_voters(voter_name=None, city=None, page=1, limit=20):
    url = 'http://localhost:3000/api/search'
    params = {
        'page': page,
        'limit': limit
    }
    
    if voter_name:
        params['voterNameEng'] = voter_name
    if city:
        params['city'] = city
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Found {data['pagination']['totalCount']} voters")
        return data['data']
    else:
        print('Search failed:', response.json())
        return []

# Usage
voters = search_voters(voter_name='john', city='mumbai')
```

## Excel File Format Requirements

Your Excel file should have columns that match common voter data fields. The API automatically maps these column names:

### Required Fields
- **Voter Name (English)** - Any of: `Voter Name Eng`, `Voter Name English`, `Name (English)`, `Voter Name`, `Name`

### Optional Fields
- **Father Name**: `Father Name Eng`, `Father Name English`, `Father Name`, `Father's Name`
- **Husband Name**: `Husband Name Eng`, `Husband Name English`, `Husband Name`, `Husband's Name`
- **Address**: `House Number`, `Street`, `Area`, `City`, `State`, `Pincode`
- **Electoral**: `Constituency`, `Assembly Constituency`, `Part Number`, `Voter ID`, `EPIC Number`
- **Personal**: `Age`, `Gender`

## API Response Formats

### Upload Response
```json
{
  "success": true,
  "message": "Data uploaded successfully",
  "statistics": {
    "totalRows": 1000,
    "savedCount": 950,
    "errorCount": 50,
    "headers": ["Voter Name Eng", "Father Name Eng", ...]
  }
}
```

### Search Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "voterNameEng": "John Doe",
      "fatherNameEng": "Robert Doe",
      "city": "Mumbai",
      "constituency": "Central",
      ...
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

### Statistics Response
```json
{
  "success": true,
  "statistics": {
    "totalVoters": 1000,
    "genderDistribution": [
      {"_id": "Male", "count": 600},
      {"_id": "Female", "count": 400}
    ],
    "topConstituencies": [
      {"_id": "Central", "count": 200},
      {"_id": "North", "count": 150}
    ],
    "ageStatistics": {
      "avgAge": 35.5,
      "minAge": 18,
      "maxAge": 80
    }
  }
}
```

## Error Handling

### Common Error Responses

**File Upload Errors:**
```json
{
  "success": false,
  "message": "No file uploaded"
}
```

**Search Errors:**
```json
{
  "success": false,
  "message": "Search failed",
  "error": "Invalid search parameters"
}
```

**Server Errors:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## Performance Tips

1. **Use pagination** for large result sets
2. **Combine search criteria** to narrow down results
3. **Use specific field searches** instead of general text search when possible
4. **Sort results** to get consistent ordering
5. **Limit results** to improve response time

## Testing the API

Run the test script to verify everything is working:

```bash
node test-api.js
```

This will test all endpoints and show you the results.
