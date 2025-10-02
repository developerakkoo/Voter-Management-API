# Voter API

A professional Node.js API for managing voter data with Excel upload functionality and advanced search capabilities.

## Features

- 📊 **Excel File Upload**: Upload voter data from Excel files (.xlsx, .xls)
- 🔍 **Advanced Search**: Professional search functionality with multiple filters
- 🗄️ **MongoDB Integration**: Efficient data storage and retrieval
- 📈 **Statistics**: Get insights about voter data
- 🚀 **RESTful API**: Clean and well-documented endpoints
- 🔒 **Data Validation**: Comprehensive data validation and error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/voter-api
   PORT=3000
   ```

4. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- **GET** `/health` - Check API status

### Upload Data
- **POST** `/api/upload` - Upload Excel file with voter data
  - Content-Type: `multipart/form-data`
  - Field name: `excelFile`
  - Supported formats: .xlsx, .xls

### Search Voters
- **GET** `/api/search` - Search voters with multiple filters

#### Search Parameters:
- `q` - General text search across all fields
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

### Get Voter Details
- **GET** `/api/voter/:id` - Get specific voter by ID

### Statistics
- **GET** `/api/stats` - Get voter statistics and analytics

### Data Management
- **DELETE** `/api/voters` - Delete all voters (for testing/reset)

## Usage Examples

### 1. Upload Excel Data

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "excelFile=@voter-data.xlsx"
```

### 2. Search Voters

```bash
# General search
curl "http://localhost:3000/api/search?q=john"

# Search by specific fields
curl "http://localhost:3000/api/search?voterNameEng=john&city=mumbai"

# Paginated search
curl "http://localhost:3000/api/search?page=1&limit=10&sortBy=voterNameEng&sortOrder=asc"
```

### 3. Get Statistics

```bash
curl "http://localhost:3000/api/stats"
```

## Excel File Format

The API supports flexible Excel file formats. It automatically maps common column names to the database schema:

### Supported Column Names:
- **Voter Name**: `Voter Name Eng`, `Voter Name English`, `Name (English)`, `Voter Name`, `Name`
- **Father Name**: `Father Name Eng`, `Father Name English`, `Father Name`, `Father's Name`
- **Husband Name**: `Husband Name Eng`, `Husband Name English`, `Husband Name`, `Husband's Name`
- **Address**: `House Number`, `Street`, `Area`, `City`, `State`, `Pincode`
- **Electoral**: `Constituency`, `Assembly Constituency`, `Part Number`, `Voter ID`, `EPIC Number`

## Database Schema

The voter data is stored with the following structure:

```javascript
{
  voterNameEng: String (required, indexed),
  voterNameHindi: String,
  fatherNameEng: String,
  fatherNameHindi: String,
  husbandNameEng: String,
  husbandNameHindi: String,
  age: Number,
  gender: String,
  houseNumber: String,
  street: String,
  area: String,
  city: String,
  state: String,
  pincode: String,
  constituency: String,
  assemblyConstituency: String,
  partNumber: String,
  serialNumber: String,
  voterId: String (unique),
  epicNumber: String,
  boothNumber: String,
  boothName: String,
  isActive: Boolean,
  uploadedAt: Date,
  lastUpdated: Date
}
```

## Search Features

### 1. Text Search
- Full-text search across multiple fields
- Case-insensitive matching
- Partial string matching

### 2. Field-Specific Search
- Search by individual fields
- Combine multiple search criteria
- Exact and partial matching

### 3. Pagination
- Configurable page size
- Page navigation
- Total count information

### 4. Sorting
- Sort by any field
- Ascending/descending order
- Multiple sort criteria support

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid file format, missing required fields
- **404 Not Found**: Voter not found
- **500 Internal Server Error**: Server-side errors

All errors include descriptive messages and relevant details.

## Performance Features

- **Batch Processing**: Large files are processed in batches
- **Indexing**: Optimized database indexes for fast searches
- **Pagination**: Efficient handling of large datasets
- **Text Search**: MongoDB text indexes for full-text search

## Development

### Project Structure
```
├── models/
│   └── Voter.js          # MongoDB schema
├── utils/
│   └── excelReader.js    # Excel processing utility
├── uploads/              # Temporary file storage
├── index.js              # Main server file
├── package.json
└── README.md
```

### Scripts
- `npm start` - Start the server
- `npm test` - Run tests (to be implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For issues and questions, please create an issue in the repository.
# Voter-Management-API
