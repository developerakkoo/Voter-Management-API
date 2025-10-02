# Voter API - Complete Endpoints Documentation

## 🎉 **Successfully Deployed Voter API with Multiple Collections**

### **Database Collections:**
- **Voter Collection**: 73,285 records (Original Excel file)
- **VoterFour Collection**: 77,149 records (1st.xlsx, 2nd.xlsx, 3rd.xlsx)
- **Total Combined**: 150,434 voter records

---

## 📋 **API Endpoints**

### **1. Health Check**
- **GET** `/health`
- **Description**: Check API status
- **Response**: Server status and timestamp

### **2. Upload Endpoints**

#### **Upload Original Voter Data**
- **POST** `/api/upload`
- **Description**: Upload the main voter Excel file
- **Content-Type**: `multipart/form-data`
- **Field**: `excelFile`
- **Target Collection**: `Voter`

#### **Upload Additional Voter Data**
- **POST** `/api/upload-four`
- **Description**: Upload additional Excel files (1st.xlsx, 2nd.xlsx, 3rd.xlsx)
- **Content-Type**: `multipart/form-data`
- **Field**: `excelFile`
- **Target Collection**: `VoterFour`

### **3. Search Endpoints**

#### **Search Original Voters**
- **GET** `/api/search`
- **Description**: Search in the main voter collection
- **Parameters**:
  - `q` - General text search
  - `voterNameEng` - Search by voter name (English)
  - `fatherNameEng` - Search by father's name
  - `husbandNameEng` - Search by husband's name
  - `area` - Search by area
  - `city` - Search by city
  - `constituency` - Search by constituency
  - `assemblyConstituency` - Search by assembly constituency
  - `partNumber` - Search by part number
  - `pincode` - Search by pincode
  - `page` - Page number (default: 1)
  - `limit` - Results per page (default: 20)
  - `sortBy` - Sort field (default: voterNameEng)
  - `sortOrder` - Sort order: asc/desc (default: asc)

#### **Search Additional Voters**
- **GET** `/api/search-four`
- **Description**: Search in the VoterFour collection
- **Parameters**:
  - `q` - General text search
  - `voterNameEng` - Search by voter name (English)
  - `fatherNameEng` - Search by father's name
  - `husbandNameEng` - Search by husband's name
  - `assemblyConstituency` - Search by assembly constituency
  - `boothNumber` - Search by booth number
  - `sourceFile` - Search by source file (1st.xlsx, 2nd.xlsx, 3rd.xlsx)
  - `page` - Page number (default: 1)
  - `limit` - Results per page (default: 20)
  - `sortBy` - Sort field (default: voterNameEng)
  - `sortOrder` - Sort order: asc/desc (default: asc)

### **4. Statistics**
- **GET** `/api/stats`
- **Description**: Get comprehensive statistics for both collections
- **Response**: Combined statistics including:
  - Total voters in each collection
  - Gender distribution
  - Constituency distribution
  - Age statistics
  - Source file distribution

### **5. Data Management**

#### **Delete Original Voters**
- **DELETE** `/api/voters`
- **Description**: Delete all records from main voter collection

#### **Delete Additional Voters**
- **DELETE** `/api/voters-four`
- **Description**: Delete all records from VoterFour collection

---

## 🔍 **Search Examples**

### **General Search**
```bash
# Search across all fields
curl "http://localhost:3000/api/search?q=john"

# Search in VoterFour collection
curl "http://localhost:3000/api/search-four?q=anjali"
```

### **Specific Field Search**
```bash
# Search by voter name
curl "http://localhost:3000/api/search?voterNameEng=Arun"

# Search by assembly constituency
curl "http://localhost:3000/api/search-four?assemblyConstituency=208"

# Search by source file
curl "http://localhost:3000/api/search-four?sourceFile=1st.xlsx"
```

### **Pagination and Sorting**
```bash
# Paginated results with sorting
curl "http://localhost:3000/api/search?page=1&limit=10&sortBy=voterNameEng&sortOrder=asc"

# Search with multiple criteria
curl "http://localhost:3000/api/search-four?voterNameEng=john&gender=Female&page=1&limit=5"
```

---

## 📊 **Current Database Statistics**

### **Main Voter Collection (Voter)**
- **Total Records**: 73,285
- **Gender Distribution**: 38,586 Male, 34,699 Female
- **Age Range**: 18-104 years (Average: 41.5 years)
- **Source**: Original Excel file

### **Additional Voter Collection (VoterFour)**
- **Total Records**: 77,149
- **Gender Distribution**: 40,720 Male, 36,429 Female
- **Age Range**: 18-104 years (Average: 43.1 years)
- **Source Files**:
  - 3rd.xlsx: 70,902 records
  - 2nd.xlsx: 3,206 records
  - 1st.xlsx: 3,041 records

### **Combined Statistics**
- **Total Voters**: 150,434
- **Top Assembly Constituencies**: 208, 227, 412, 413, 410, 404, 414, 400, 246, 387

---

## 🚀 **Usage Examples**

### **Upload Files**
```bash
# Upload original voter data
curl -X POST http://localhost:3000/api/upload -F "excelFile=@original-file.xlsx"

# Upload additional voter data
curl -X POST http://localhost:3000/api/upload-four -F "excelFile=@1st.xlsx"
curl -X POST http://localhost:3000/api/upload-four -F "excelFile=@2nd.xlsx"
curl -X POST http://localhost:3000/api/upload-four -F "excelFile=@3rd.xlsx"
```

### **Search Voters**
```bash
# Search in main collection
curl "http://localhost:3000/api/search?voterNameEng=john&limit=5"

# Search in additional collection
curl "http://localhost:3000/api/search-four?voterNameEng=anjali&sourceFile=3rd.xlsx&limit=5"
```

### **Get Statistics**
```bash
curl "http://localhost:3000/api/stats"
```

---

## 🔧 **Technical Features**

### **Professional Search Capabilities**
- **Full-text Search**: Search across multiple fields simultaneously
- **Field-specific Search**: Target specific fields for precise results
- **Case-insensitive Matching**: All searches are case-insensitive
- **Partial Matching**: Find voters with partial name matches
- **Pagination**: Handle large result sets efficiently
- **Sorting**: Sort by any field in ascending or descending order
- **Multiple Criteria**: Combine multiple search parameters

### **Data Management**
- **Batch Processing**: Large files processed in batches of 1000 records
- **Duplicate Handling**: Automatic duplicate detection and reporting
- **Data Validation**: Comprehensive validation during upload
- **Source Tracking**: Track which file each record came from
- **Error Reporting**: Detailed error reporting for failed records

### **Performance Optimizations**
- **Database Indexing**: Optimized indexes for fast searches
- **Text Search**: MongoDB text indexes for full-text search
- **Pagination**: Efficient handling of large datasets
- **Batch Operations**: Efficient bulk operations for large data uploads

---

## 📝 **Response Formats**

### **Search Response**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 100,
    "totalCount": 2000,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  },
  "searchCriteria": {...}
}
```

### **Upload Response**
```json
{
  "success": true,
  "message": "Data uploaded successfully",
  "statistics": {
    "totalRows": 1000,
    "savedCount": 950,
    "errorCount": 50,
    "sourceFile": "filename.xlsx"
  }
}
```

### **Statistics Response**
```json
{
  "success": true,
  "statistics": {
    "totalVoters": 73285,
    "totalVoterFour": 77149,
    "totalCombined": 150434,
    "genderDistribution": {...},
    "constituencyDistribution": {...},
    "ageStatistics": {...},
    "sourceFileDistribution": [...]
  }
}
```

---

## 🎯 **Ready for Production**

The Voter API is now fully functional with:
- ✅ **150,434 total voter records** across two collections
- ✅ **Professional search capabilities** with multiple criteria
- ✅ **Comprehensive statistics** and analytics
- ✅ **Robust error handling** and validation
- ✅ **Scalable architecture** for large datasets
- ✅ **Complete documentation** and examples

The API is ready for production use with professional-grade search functionality and comprehensive data management capabilities!
