# Category API with Nested Data Management

## Overview
The Category API provides a comprehensive system for creating categories and managing multiple data entries within each category. This allows for organized data management with hierarchical structure.

## Category Model Features

### Core Category Fields
- `name` - Category name (required, unique, max 100 chars)
- `description` - Category description (max 500 chars)
- `isActive` - Category active status (default: true)
- `order` - Display order (default: 0)
- `tags` - Array of tags for categorization
- `metadata` - Additional metadata object

### Data Entry Fields (Nested within Category)
- `title` - Data entry title (required, max 200 chars)
- `description` - Data entry description (required, max 1000 chars)
- `info` - Additional information (max 2000 chars)
- `isActive` - Data entry active status (default: true)
- `order` - Display order within category (default: 0)
- `metadata` - Additional metadata object

### Audit Fields
- `createdBy` - Creator reference
- `lastUpdatedBy` - Last updater reference
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## API Endpoints

### 1. Public Endpoints (No Authentication Required)

#### Get Active Categories
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
      "name": "Homes",
      "description": "Real estate listings",
      "dataEntries": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "title": "Beautiful Villa",
          "description": "3 bedroom villa with garden",
          "info": "Located in prime area with all amenities",
          "isActive": true,
          "order": 0
        }
      ],
      "isActive": true,
      "order": 0
    }
  ]
}
```

#### Search Categories
```bash
GET /api/category/search?q=search_term
```

**Query Parameters:**
- `q` - Search term (required)

#### Get Category Statistics
```bash
GET /api/category/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCategories": 10,
    "activeCategories": 8,
    "totalDataEntries": 150,
    "activeDataEntries": 120
  }
}
```

### 2. Admin/SubAdmin Endpoints (Authentication Required)

#### Get All Categories
```bash
GET /api/category
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `isActive` - Filter by active status
- `search` - Search in name, description, tags
- `sortBy` - Sort field (default: 'name')
- `sortOrder` - Sort order (asc/desc, default: asc)
- `includeDataEntries` - Include data entries in response (true/false)

#### Get Category by ID
```bash
GET /api/category/:id
```

#### Create Category
```bash
POST /api/category
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "Homes",
  "description": "Real estate listings and property information",
  "order": 1,
  "tags": ["real-estate", "property", "homes"],
  "metadata": {
    "type": "real-estate",
    "department": "sales"
  }
}
```

#### Update Category
```bash
PUT /api/category/:id
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Homes",
  "description": "Updated real estate listings",
  "isActive": true,
  "order": 2
}
```

#### Delete Category
```bash
DELETE /api/category/:id
Authorization: Bearer JWT_TOKEN
```

#### Delete All Categories (Admin Only)
```bash
DELETE /api/category
Authorization: Bearer ADMIN_JWT_TOKEN
```

### 3. Data Entry Management

#### Get Data Entries for Category
```bash
GET /api/category/:id/data
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `activeOnly` - Show only active entries (default: true)
- `search` - Search in title, description, info
- `sortBy` - Sort field (default: 'order')
- `sortOrder` - Sort order (asc/desc, default: asc)

#### Add Data Entry to Category
```bash
POST /api/category/:id/data
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "Beautiful Villa",
  "description": "3 bedroom villa with garden",
  "info": "Located in prime area with all amenities. Features include swimming pool, garden, and modern kitchen.",
  "order": 0,
  "metadata": {
    "price": "500000",
    "location": "Downtown",
    "bedrooms": 3,
    "bathrooms": 2
  }
}
```

#### Update Data Entry
```bash
PUT /api/category/:id/data/:entryId
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Villa Title",
  "description": "Updated description",
  "info": "Updated information",
  "isActive": true,
  "order": 1
}
```

#### Delete Data Entry
```bash
DELETE /api/category/:id/data/:entryId
Authorization: Bearer JWT_TOKEN
```

#### Reorder Data Entries
```bash
PATCH /api/category/:id/data/reorder
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "entryIds": ["entryId1", "entryId2", "entryId3"]
}
```

## Example Usage Scenarios

### 1. Create Category with Multiple Data Entries

```bash
# Step 1: Create category
POST /api/category
{
  "name": "Homes",
  "description": "Real estate listings",
  "tags": ["real-estate", "property"]
}

# Step 2: Add first data entry
POST /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data
{
  "title": "Modern Apartment",
  "description": "2 bedroom apartment in city center",
  "info": "Fully furnished with modern amenities",
  "metadata": {
    "price": "300000",
    "bedrooms": 2,
    "location": "City Center"
  }
}

# Step 3: Add second data entry
POST /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data
{
  "title": "Luxury Villa",
  "description": "5 bedroom luxury villa with pool",
  "info": "Premium location with all luxury amenities",
  "metadata": {
    "price": "1000000",
    "bedrooms": 5,
    "location": "Uptown"
  }
}
```

### 2. Search and Filter Data

```bash
# Search categories
GET /api/category/search?q=villa

# Get data entries for specific category
GET /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data?search=apartment&activeOnly=true

# Get all categories with data entries
GET /api/category?includeDataEntries=true&isActive=true
```

### 3. Reorder Data Entries

```bash
# Reorder entries within a category
PATCH /api/category/64f8a1b2c3d4e5f6a7b8c9d0/data/reorder
{
  "entryIds": [
    "64f8a1b2c3d4e5f6a7b8c9d2",  // Move to position 0
    "64f8a1b2c3d4e5f6a7b8c9d1",  // Move to position 1
    "64f8a1b2c3d4e5f6a7b8c9d3"   // Move to position 2
  ]
}
```

## Response Formats

### Category Object
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Homes",
  "description": "Real estate listings and property information",
  "dataEntries": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "title": "Beautiful Villa",
      "description": "3 bedroom villa with garden",
      "info": "Located in prime area with all amenities",
      "isActive": true,
      "order": 0,
      "metadata": {
        "price": "500000",
        "location": "Downtown",
        "bedrooms": 3,
        "bathrooms": 2
      },
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d2",
      "lastUpdatedBy": "64f8a1b2c3d4e5f6a7b8c9d2",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "isActive": true,
  "order": 1,
  "tags": ["real-estate", "property", "homes"],
  "metadata": {
    "type": "real-estate",
    "department": "sales"
  },
  "createdBy": "64f8a1b2c3d4e5f6a7b8c9d2",
  "lastUpdatedBy": "64f8a1b2c3d4e5f6a7b8c9d2",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Data Entries Response
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Homes",
      "description": "Real estate listings"
    },
    "dataEntries": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "Beautiful Villa",
        "description": "3 bedroom villa with garden",
        "info": "Located in prime area with all amenities",
        "isActive": true,
        "order": 0
      }
    ],
    "totalEntries": 1,
    "activeEntries": 1
  }
}
```

## Advanced Features

### 1. Hierarchical Data Management
- **Categories**: Top-level organization units
- **Data Entries**: Nested data within categories
- **Flexible Structure**: Unlimited categories and data entries
- **Ordering**: Custom ordering for both categories and data entries

### 2. Search and Filtering
- **Text Search**: Search across category names, descriptions, and data entry content
- **Active Filtering**: Filter by active/inactive status
- **Sorting**: Sort by any field with asc/desc order
- **Pagination**: Efficient handling of large datasets

### 3. Data Entry Management
- **CRUD Operations**: Full create, read, update, delete for data entries
- **Bulk Operations**: Reorder multiple entries at once
- **Search Within Category**: Search data entries within specific categories
- **Metadata Support**: Flexible metadata for additional information

### 4. Category Management
- **Unique Names**: Category names must be unique
- **Ordering**: Custom display order for categories
- **Tagging**: Flexible tagging system
- **Status Management**: Active/inactive status control

### 5. Statistics and Analytics
- **Category Stats**: Total categories, active categories
- **Data Entry Stats**: Total entries, active entries
- **Usage Tracking**: Track creation and update activities

## Use Cases

### 1. Real Estate Management
- **Categories**: Homes, Commercial, Land, Rentals
- **Data Entries**: Individual property listings with details
- **Metadata**: Price, location, bedrooms, amenities

### 2. Product Catalog
- **Categories**: Electronics, Clothing, Books, Home & Garden
- **Data Entries**: Individual products with specifications
- **Metadata**: SKU, price, availability, specifications

### 3. Content Management
- **Categories**: News, Articles, Events, Announcements
- **Data Entries**: Individual content pieces
- **Metadata**: Author, publish date, tags, status

### 4. Educational Content
- **Categories**: Courses, Subjects, Topics
- **Data Entries**: Individual lessons or materials
- **Metadata**: Duration, difficulty, prerequisites

### 5. Event Management
- **Categories**: Conferences, Workshops, Meetings, Social Events
- **Data Entries**: Individual events
- **Metadata**: Date, location, capacity, registration info

## Security Features

### 1. Authentication
- **JWT Tokens**: Secure authentication for protected endpoints
- **Role-based Access**: Different access levels for admin/subadmin
- **Public Endpoints**: Some endpoints accessible without authentication

### 2. Data Validation
- **Input Validation**: Validate all input data
- **Schema Validation**: MongoDB schema validation
- **Unique Constraints**: Prevent duplicate category names
- **Size Limits**: Enforce character limits on text fields

### 3. Error Handling
- **400 Bad Request**: Invalid data or validation errors
- **401 Unauthorized**: Invalid or expired token
- **404 Not Found**: Category or data entry not found
- **409 Conflict**: Duplicate category name
- **500 Internal Server Error**: Database or server errors

## Performance Features

### 1. Indexing
- **Database Indexes**: Optimized queries for better performance
- **Search Indexes**: Full-text search capabilities
- **Sorting Indexes**: Efficient sorting operations

### 2. Pagination
- **Efficient Pagination**: Handle large datasets efficiently
- **Configurable Limits**: Customizable page sizes
- **Metadata**: Pagination information in responses

### 3. Caching
- **Query Optimization**: Efficient database queries
- **Response Caching**: Cache frequently accessed data
- **Lazy Loading**: Load data entries only when needed

## Error Handling

- **400 Bad Request**: Invalid data or validation errors
- **401 Unauthorized**: Invalid or expired token
- **404 Not Found**: Category or data entry not found
- **409 Conflict**: Duplicate category name
- **500 Internal Server Error**: Database or server errors

## Best Practices

### 1. Category Design
- Use descriptive category names
- Keep categories focused and specific
- Use consistent naming conventions
- Leverage tags for additional categorization

### 2. Data Entry Management
- Use clear, descriptive titles
- Provide comprehensive descriptions
- Include relevant metadata
- Maintain consistent ordering

### 3. Search Optimization
- Use relevant keywords in titles and descriptions
- Leverage tags for better searchability
- Keep content updated and relevant
- Use consistent formatting

### 4. Performance
- Use pagination for large datasets
- Implement proper indexing
- Cache frequently accessed data
- Optimize queries for better performance
