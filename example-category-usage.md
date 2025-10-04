# Category Management API

## Overview
The Category Management API allows you to create, manage, and organize categories with their associated data entries. Each category can contain multiple data entries, and you can perform full CRUD operations on both categories and their data entries. All endpoints are publicly accessible without authentication as they are managed by admin only.


## Data Model

### Category Schema
```javascript
{
  _id: ObjectId,
  name: String (required, unique, max: 100),
  description: String (max: 500),
  dataEntries: [DataEntrySchema],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Data Entry Schema
```javascript
{
  _id: ObjectId,
  title: String (required, max: 200),
  description: String (required, max: 1000),
  info: String (max: 2000),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Endpoints

### 1. Get All Categories
Retrieve all categories with pagination, filtering, and search capabilities.

```bash
GET /api/category?page=1&limit=20&isActive=true&search=term&sortBy=name&sortOrder=asc&includeDataEntries=false

```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `isActive` (optional): Filter by active status (true/false)
- `search` (optional): Search term (searches in name, description, and data entry fields)
- `sortBy` (optional): Sort field (default: "name")
- `sortOrder` (optional): Sort direction "asc" or "desc" (default: "asc")
- `includeDataEntries` (optional): Include data entries in response (default: false)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Technology",
      "description": "Technology related information",
      "isActive": true,
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
    "limit": 20
  }
}
```

### 2. Get Category by ID
Retrieve a specific category with all its data entries.

```bash
GET /api/category/64f8a1b2c3d4e5f6a7b8c9d0

```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Technology",
    "description": "Technology related information",
    "dataEntries": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "title": "JavaScript",
        "description": "Programming language for web development",
        "info": "JavaScript is a versatile programming language...",
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Create Category
Create a new category.

```bash
POST /api/category
Content-Type: application/json


{
  "name": "Technology",
  "description": "Technology related information"
}
```

**Request Body:**
- `name` (required): Category name (unique, max 100 characters)
- `description` (optional): Category description (max 500 characters)

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Technology",
    "description": "Technology related information",
    "dataEntries": [],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update Category
Update an existing category.

```bash
PUT /api/category/64f8a1b2c3d4e5f6a7b8c9d0
Content-Type: application/json


{
  "name": "Advanced Technology",
  "description": "Advanced technology concepts and information",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Advanced Technology",
    "description": "Advanced technology concepts and information",
    "isActive": true,
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### 5. Delete Category
Delete a category and all its data entries.

```bash
DELETE /api/category/64f8a1b2c3d4e5f6a7b8c9d0

```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

### 6. Add Data Entry to Category
Add a new data entry to a specific category.

```bash
POST /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data
Content-Type: application/json


{
  "title": "React.js",
  "description": "JavaScript library for building user interfaces",
  "info": "React is a declarative, efficient, and flexible JavaScript library for building user interfaces."
}
```

**Request Body:**
- `title` (required): Entry title (max 200 characters)
- `description` (required): Entry description (max 1000 characters)
- `info` (optional): Additional information (max 2000 characters)

**Response (201):**
```json
{
  "success": true,
  "message": "Data entry added successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Technology",
    "description": "Technology related information",
    "dataEntries": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "title": "React.js",
        "description": "JavaScript library for building user interfaces",
        "info": "React is a declarative, efficient, and flexible JavaScript library...",
        "isActive": true,
        "createdAt": "2024-01-15T12:30:00.000Z",
        "updatedAt": "2024-01-15T12:30:00.000Z"
      }
    ]
  }
}
```

### 7. Update Data Entry
Update an existing data entry within a category.

```bash
PUT /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data/64f8a1b2c3d4e5f6a7b8c9d3
Content-Type: application/json


{
  "title": "React.js Framework",
  "description": "Modern JavaScript library for building user interfaces",
  "info": "React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data entry updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Technology",
    "dataEntries": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "title": "React.js Framework",
        "description": "Modern JavaScript library for building user interfaces",
        "info": "React is a declarative, efficient, and flexible JavaScript library...",
        "isActive": true,
        "updatedAt": "2024-01-15T13:30:00.000Z"
      }
    ]
  }
}
```

### 8. Delete Data Entry
Remove a specific data entry from a category.

```bash
DELETE /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data/64f8a1b2c3d4e5f6a7b8c9d3

```

**Response:**
```json
{
  "success": true,
  "message": "Data entry deleted successfully",
  "data": {
    "categoryId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "remainingEntries": 2
  }
}
```

### 9. Get Category Data Entries
Retrieve all data entries for a specific category with filtering and sorting.

```bash
GET /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data?activeOnly=true&search=react&sortBy=title&sortOrder=asc

```

**Query Parameters:**
- `activeOnly` (optional): Show only active entries (default: true)
- `search` (optional): Search in title, description, and info fields
- `sortBy` (optional): Sort field (default: "title")
- `sortOrder` (optional): Sort direction (default: "asc")

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Technology",
      "description": "Technology related information"
    },
    "dataEntries": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "title": "React.js Framework",
        "description": "Modern JavaScript library for building user interfaces",
        "info": "React is a declarative, efficient, and flexible JavaScript library...",
        "isActive": true,
        "createdAt": "2024-01-15T12:30:00.000Z"
      }
    ],
    "totalEntries": 1,
    "activeEntries": 1
  }
}
```

### 10. Reorder Data Entries
Reorder data entries within a category.

```bash
PATCH /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data/reorder
Content-Type: application/json


{
  "entryIds": [
    "64f8a1b2c3d4e5f6a7b8c9d3",
    "64f8a1b2c3d4e5f6a7b8c9d2",
    "64f8a1b2c3d4e5f6a7b8c9d4"
  ]
}
```

**Request Body:**
- `entryIds` (required): Array of data entry IDs in the desired order

**Response:**
```json
{
  "success": true,
  "message": "Data entries reordered successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Technology",
    "dataEntries": [
      // Entries in new order
    ]
  }
}
```

### 11. Get Active Categories
Get all active categories with data entries.

```bash
GET /api/category/active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Technology",
      "description": "Technology related information",
      "dataEntries": [
        // Active data entries only
      ]
    }
  ]
}
```

### 12. Search Categories
Search categories and data entries.

```bash
GET /api/category/search?q=javascript
```

**Query Parameters:**
- `q` (required): Search term

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Technology",
      "description": "Technology related information",
      "dataEntries": [
        // Matching data entries
      ]
    }
  ],
  "searchTerm": "javascript"
}
```

### 13. Get Category Statistics
Get comprehensive statistics about categories and data entries.

```bash
GET /api/category/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCategories": 15,
    "activeCategories": 12,
    "totalDataEntries": 150,
    "activeDataEntries": 135
  }
}
```

### 14. Delete All Categories
Delete all categories and their data entries (for testing/reset purposes).

```bash
DELETE /api/category

```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 15 categories"
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Category name is required"
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Name is required", "Description is too long"]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**409 Duplicate Key:**
```json
{
  "success": false,
  "message": "Category name already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error creating category",
  "error": "Detailed error message"
}
```

## Usage Examples

### Example 1: Create Category with Initial Data
```bash
# Step 1: Create category
curl -X POST http://localhost:3000/api/category \
  -H "Content-Type: application/json" \

  -d '{
    "name": "Programming Languages",
    "description": "Information about various programming languages"
  }'

# Step 2: Add data entries
curl -X POST http://localhost:3000/api/category/{category_id}/data \
  -H "Content-Type: application/json" \

  -d '{
    "title": "Python",
    "description": "High-level programming language",
    "info": "Python is known for its simple syntax and versatility."
  }'
```

### Example 2: Search and Filter Categories
```bash
# Get active categories with data entries
curl -X GET "http://localhost:3000/api/category?isActive=true&includeDataEntries=true&search=tech" \


# Get categories sorted by creation date
curl -X GET "http://localhost:3000/api/category?sortBy=createdAt&sortOrder=desc" \
 
```

### Example 3: Manage Data Entries
```bash
# Get all data entries for a category
curl -X GET http://localhost:3000/api/category/{category_id}/data \


# Update a data entry
curl -X PUT http://localhost:3000/api/category/{category_id}/data/{entry_id} \
  -H "Content-Type: application/json" \

  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "isActive": true
  }'

# Delete a data entry
curl -X DELETE http://localhost:3000/api/category/{category_id}/data/{entry_id} \

```

### Example 4: Public Endpoints
```bash
# Get active categories
curl -X GET http://localhost:3000/api/category/active

# Search categories
curl -X GET "http://localhost:3000/api/category/search?q=javascript"

# Get statistics
curl -X GET http://localhost:3000/api/category/stats
```

## Features Summary

### ✅ **Category Management**
1. **Create Category** - Add new categories with name and description
2. **Get All Categories** - List with pagination, search, sort, and filtering
3. **Get Category by ID** - Retrieve specific category with all data entries
4. **Update Category** - Modify category name, description, and status
5. **Delete Category** - Remove category and all associated data entries

### ✅ **Data Entry Management**
1. **Add Data Entry** - Add new entries to existing categories
2. **Update Data Entry** - Modify existing data entries
3. **Delete Data Entry** - Remove specific data entries
4. **Get Data Entries** - List entries with filtering and sorting
5. **Reorder Data Entries** - Change the order of entries within a category

### ✅ **Advanced Features**
1. **Search Functionality** - Search across categories and data entries
2. **Filtering** - Filter by active status, category, etc.
3. **Sorting** - Sort by various fields in ascending/descending order
4. **Pagination** - Handle large datasets efficiently
5. **Statistics** - Get overview of categories and data entries
6. **Public Access** - All endpoints available without authentication

### ✅ **Data Integrity**
1. **Automatic Cleanup** - Deleting a category removes all its data entries
2. **Validation** - Proper validation for all input fields
3. **Unique Constraints** - Category names must be unique
4. **Soft Delete** - Data entries can be deactivated instead of deleted

## Best Practices

1. **Use Pagination** - Always use pagination for large datasets
2. **Search Efficiently** - Use specific search terms for better performance
3. **Validate Input** - Ensure required fields are provided
4. **Handle Errors** - Implement proper error handling in frontend
5. **Cache Public Data** - Cache active categories and statistics
6. **Monitor Usage** - Track API usage and performance
7. **Backup Data** - Regular backups of category and data entry information

## Related APIs

- **Admin API**: `/api/admin/*` - Admin authentication and management
- **SubAdmin API**: `/api/subadmin/*` - Sub-admin management
- **Alert API**: `/api/alert/*` - System alerts and notifications