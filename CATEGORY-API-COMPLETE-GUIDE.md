# Category API - Complete Guide

Complete documentation for managing categories and their data entries with search, filtering, and CRUD operations.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Category Management](#category-management)
3. [Data Entry Management](#data-entry-management)
4. [Search & Filter](#search--filter)
5. [Statistics](#statistics)
6. [Frontend Integration](#frontend-integration)
7. [Complete Examples](#complete-examples)

---

## Overview

### What is a Category?

A **Category** is a collection container that holds multiple **Data Entries**. Each data entry has:
- `title` - Entry title (max 200 chars)
- `description` - Entry description (max 1000 chars)
- `info` - Additional information (max 2000 chars)
- `isActive` - Active status

### Category Structure
```json
{
  "_id": "68e123...",
  "name": "Important Information",
  "description": "Category for important announcements",
  "isActive": true,
  "dataEntries": [
    {
      "_id": "68e456...",
      "title": "Voting Day Schedule",
      "description": "Details about voting day timings",
      "info": "Additional information...",
      "isActive": true,
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2025-10-01T00:00:00.000Z",
  "updatedAt": "2025-10-01T00:00:00.000Z"
}
```

---

## Category Management

### 1. Get All Categories with Search

**Endpoint:**
```
GET /api/category
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Results per page |
| `search` | string | - | Search term (name, description, data entries) |
| `isActive` | boolean | - | Filter by active status |
| `sortBy` | string | 'name' | Field to sort by |
| `sortOrder` | string | 'asc' | 'asc' or 'desc' |
| `includeDataEntries` | boolean | false | Include data entries in response |

#### Examples

**Get all categories (without data entries):**
```bash
curl "http://localhost:3000/api/category"
```

**Get all categories with data entries:**
```bash
curl "http://localhost:3000/api/category?includeDataEntries=true"
```

**Search categories by name:**
```bash
curl "http://localhost:3000/api/category?search=Important"
```

**Search in category and data entries:**
```bash
curl "http://localhost:3000/api/category?search=voting&includeDataEntries=true"
```

**Get active categories only:**
```bash
curl "http://localhost:3000/api/category?isActive=true"
```

**Paginate with 50 per page:**
```bash
curl "http://localhost:3000/api/category?page=1&limit=50"
```

**Sort by name descending:**
```bash
curl "http://localhost:3000/api/category?sortBy=name&sortOrder=desc"
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e123...",
      "name": "Important Information",
      "description": "Category for important announcements",
      "isActive": true,
      "createdAt": "2025-10-01T00:00:00.000Z",
      "updatedAt": "2025-10-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 45,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

---

### 2. Get Category by ID

**Endpoint:**
```
GET /api/category/:id
```

**Example:**
```bash
curl "http://localhost:3000/api/category/68e123456789abcdef123456"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "68e123...",
    "name": "Important Information",
    "description": "Category for announcements",
    "isActive": true,
    "dataEntries": [
      {
        "_id": "68e456...",
        "title": "Voting Day Schedule",
        "description": "Voting happens from 7 AM to 6 PM",
        "info": "Additional details...",
        "isActive": true,
        "createdAt": "2025-10-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2025-10-01T00:00:00.000Z",
    "updatedAt": "2025-10-01T00:00:00.000Z"
  }
}
```

---

### 3. Create Category

**Endpoint:**
```
POST /api/category
```

**Request Body:**
```json
{
  "name": "Important Information",
  "description": "Category for important announcements and updates"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/category" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Important Information",
    "description": "Category for important announcements"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "68e123...",
    "name": "Important Information",
    "description": "Category for important announcements",
    "isActive": true,
    "dataEntries": [],
    "createdAt": "2025-10-09T12:00:00.000Z",
    "updatedAt": "2025-10-09T12:00:00.000Z"
  }
}
```

---

### 4. Update Category

**Endpoint:**
```
PUT /api/category/:id
```

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "description": "Updated description",
  "isActive": true
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/category/68e123456789abcdef123456" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Important Information",
    "description": "Updated category description"
  }'
```

---

### 5. Delete Category

**Endpoint:**
```
DELETE /api/category/:id
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/category/68e123456789abcdef123456"
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Data Entry Management

### 1. Get Data Entries for a Category

**Endpoint:**
```
GET /api/category/:id/data
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `activeOnly` | boolean | true | Show only active entries |
| `search` | string | - | Search in title, description, info |
| `sortBy` | string | 'title' | Field to sort by |
| `sortOrder` | string | 'asc' | 'asc' or 'desc' |

#### Examples

**Get all active data entries:**
```bash
curl "http://localhost:3000/api/category/68e123456789abcdef123456/data"
```

**Get all data entries (including inactive):**
```bash
curl "http://localhost:3000/api/category/68e123456789abcdef123456/data?activeOnly=false"
```

**Search within data entries:**
```bash
curl "http://localhost:3000/api/category/68e123456789abcdef123456/data?search=voting"
```

**Sort by creation date (newest first):**
```bash
curl "http://localhost:3000/api/category/68e123456789abcdef123456/data?sortBy=createdAt&sortOrder=desc"
```

#### Response
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "68e123...",
      "name": "Important Information",
      "description": "Category for announcements"
    },
    "dataEntries": [
      {
        "_id": "68e456...",
        "title": "Voting Day Schedule",
        "description": "Voting happens from 7 AM to 6 PM",
        "info": "All booths will be open. Bring your voter ID card.",
        "isActive": true,
        "createdAt": "2025-10-01T00:00:00.000Z",
        "updatedAt": "2025-10-01T00:00:00.000Z"
      },
      {
        "_id": "68e789...",
        "title": "Important Documents",
        "description": "List of required documents for voting",
        "info": "Voter ID card, Aadhaar card, or any photo ID",
        "isActive": true,
        "createdAt": "2025-10-02T00:00:00.000Z",
        "updatedAt": "2025-10-02T00:00:00.000Z"
      }
    ],
    "totalEntries": 2,
    "activeEntries": 2
  }
}
```

---

### 2. Add Data Entry to Category

**Endpoint:**
```
POST /api/category/:id/data
```

**Request Body:**
```json
{
  "title": "Voting Day Schedule",
  "description": "Details about voting day timings and procedures",
  "info": "All booths will be open from 7 AM to 6 PM. Please bring your voter ID card."
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/category/68e123456789abcdef123456/data" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Voting Day Schedule",
    "description": "Voting happens from 7 AM to 6 PM",
    "info": "All booths will be open. Bring your voter ID card."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Data entry added successfully",
  "data": {
    "_id": "68e123...",
    "name": "Important Information",
    "description": "Category for announcements",
    "dataEntries": [
      {
        "_id": "68e456...",
        "title": "Voting Day Schedule",
        "description": "Voting happens from 7 AM to 6 PM",
        "info": "All booths will be open. Bring your voter ID card.",
        "isActive": true,
        "createdAt": "2025-10-09T12:00:00.000Z",
        "updatedAt": "2025-10-09T12:00:00.000Z"
      }
    ]
  }
}
```

---

### 3. Update Data Entry

**Endpoint:**
```
PUT /api/category/:id/data/:entryId
```

**Request Body:**
```json
{
  "title": "Updated Voting Day Schedule",
  "description": "Updated voting timings: 7 AM to 7 PM",
  "info": "Extended hours for better voter turnout",
  "isActive": true
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/category/68e123.../data/68e456..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Voting Day Schedule",
    "description": "Updated voting timings: 7 AM to 7 PM"
  }'
```

---

### 4. Delete Data Entry

**Endpoint:**
```
DELETE /api/category/:id/data/:entryId
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/category/68e123.../data/68e456..."
```

**Response:**
```json
{
  "success": true,
  "message": "Data entry deleted successfully",
  "data": {
    "categoryId": "68e123...",
    "remainingEntries": 3
  }
}
```

---

### 5. Reorder Data Entries

Change the order of data entries within a category.

**Endpoint:**
```
PATCH /api/category/:id/data/reorder
```

**Request Body:**
```json
{
  "entryIds": [
    "68e789...",
    "68e456...",
    "68eabc..."
  ]
}
```

**Example:**
```bash
curl -X PATCH "http://localhost:3000/api/category/68e123.../data/reorder" \
  -H "Content-Type: application/json" \
  -d '{
    "entryIds": ["68e789...", "68e456...", "68eabc..."]
  }'
```

---

## Search & Filter

### 1. Search Categories and Data Entries

**Endpoint:**
```
GET /api/category/search
```

**Query Parameters:**
- `q` - Search term (required)

**Example:**
```bash
curl "http://localhost:3000/api/category/search?q=voting"
```

**Searches in:**
- Category name
- Category description
- Data entry title
- Data entry description
- Data entry info

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e123...",
      "name": "Important Information",
      "description": "Contains voting related info",
      "dataEntries": [
        {
          "_id": "68e456...",
          "title": "Voting Day Schedule",
          "description": "Voting happens from 7 AM to 6 PM"
        }
      ]
    }
  ],
  "searchTerm": "voting"
}
```

---

### 2. Get Active Categories Only

**Endpoint:**
```
GET /api/category/active
```

**Example:**
```bash
curl "http://localhost:3000/api/category/active"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e123...",
      "name": "Important Information",
      "description": "Active category with data",
      "dataEntries": [/* all data entries */],
      "isActive": true
    }
  ]
}
```

---

### 3. Search Data Entries Within a Category

**Endpoint:**
```
GET /api/category/:id/data?search=...
```

**Example:**
```bash
curl "http://localhost:3000/api/category/68e123.../data?search=schedule"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "68e123...",
      "name": "Important Information",
      "description": "Category description"
    },
    "dataEntries": [
      {
        "_id": "68e456...",
        "title": "Voting Day Schedule",
        "description": "Contains 'schedule' in title"
      }
    ],
    "totalEntries": 1,
    "activeEntries": 1
  }
}
```

---

## Statistics

### Get Category Statistics

**Endpoint:**
```
GET /api/category/stats
```

**Example:**
```bash
curl "http://localhost:3000/api/category/stats"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCategories": 15,
    "activeCategories": 12,
    "totalDataEntries": 245,
    "activeDataEntries": 198
  }
}
```

---

## Frontend Integration

### React Component - Category Viewer

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CategoryViewer() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dataEntries, setDataEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataSearchTerm, setDataSearchTerm] = useState('');

  // Load all categories with search
  const loadCategories = async () => {
    try {
      const params = new URLSearchParams({
        includeDataEntries: false,
        isActive: true
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await axios.get(`/api/category?${params.toString()}`);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Load data entries for selected category
  const loadDataEntries = async (categoryId) => {
    try {
      const params = new URLSearchParams({
        activeOnly: true,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (dataSearchTerm) {
        params.append('search', dataSearchTerm);
      }
      
      const response = await axios.get(
        `/api/category/${categoryId}/data?${params.toString()}`
      );
      
      setDataEntries(response.data.data.dataEntries);
    } catch (error) {
      console.error('Error loading data entries:', error);
    }
  };

  // Select category and load its data
  const selectCategory = (category) => {
    setSelectedCategory(category);
    setDataSearchTerm('');
    loadDataEntries(category._id);
  };

  useEffect(() => {
    loadCategories();
  }, [searchTerm]);

  useEffect(() => {
    if (selectedCategory) {
      loadDataEntries(selectedCategory._id);
    }
  }, [dataSearchTerm]);

  return (
    <div className="category-viewer">
      <div className="categories-panel">
        <h2>Categories</h2>
        
        {/* Category Search */}
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Category List */}
        <ul className="category-list">
          {categories.map(category => (
            <li 
              key={category._id}
              onClick={() => selectCategory(category)}
              className={selectedCategory?._id === category._id ? 'active' : ''}
            >
              <strong>{category.name}</strong>
              <p>{category.description}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Data Entries Panel */}
      {selectedCategory && (
        <div className="data-entries-panel">
          <h2>{selectedCategory.name}</h2>
          <p>{selectedCategory.description}</p>

          {/* Data Entry Search */}
          <input
            type="text"
            placeholder="Search within category..."
            value={dataSearchTerm}
            onChange={(e) => setDataSearchTerm(e.target.value)}
          />

          {/* Data Entries List */}
          <div className="data-entries">
            {dataEntries.map(entry => (
              <div key={entry._id} className="data-entry-card">
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
                {entry.info && (
                  <div className="additional-info">
                    <small>{entry.info}</small>
                  </div>
                )}
                <div className="meta">
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {dataEntries.length === 0 && (
            <p className="no-results">No data entries found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryViewer;
```

---

### React Component - Category Admin Panel

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function CategoryAdminPanel() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newDataEntry, setNewDataEntry] = useState({
    categoryId: '',
    title: '',
    description: '',
    info: ''
  });

  // Create category
  const createCategory = async () => {
    try {
      const response = await axios.post('/api/category', newCategory);
      alert('Category created successfully!');
      setNewCategory({ name: '', description: '' });
      loadCategories();
    } catch (error) {
      alert('Error: ' + error.response.data.message);
    }
  };

  // Add data entry
  const addDataEntry = async () => {
    try {
      const response = await axios.post(
        `/api/category/${newDataEntry.categoryId}/data`,
        {
          title: newDataEntry.title,
          description: newDataEntry.description,
          info: newDataEntry.info
        }
      );
      alert('Data entry added successfully!');
      setNewDataEntry({ categoryId: '', title: '', description: '', info: '' });
    } catch (error) {
      alert('Error: ' + error.response.data.message);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await axios.delete(`/api/category/${categoryId}`);
      alert('Category deleted successfully!');
      loadCategories();
    } catch (error) {
      alert('Error: ' + error.response.data.message);
    }
  };

  // Delete data entry
  const deleteDataEntry = async (categoryId, entryId) => {
    if (!confirm('Are you sure you want to delete this data entry?')) return;
    
    try {
      await axios.delete(`/api/category/${categoryId}/data/${entryId}`);
      alert('Data entry deleted successfully!');
      loadCategories();
    } catch (error) {
      alert('Error: ' + error.response.data.message);
    }
  };

  return (
    <div className="category-admin">
      <h1>Category Management</h1>

      {/* Create Category Form */}
      <div className="create-category">
        <h2>Create New Category</h2>
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
        />
        <textarea
          placeholder="Category Description"
          value={newCategory.description}
          onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
        />
        <button onClick={createCategory}>Create Category</button>
      </div>

      {/* Add Data Entry Form */}
      <div className="add-data-entry">
        <h2>Add Data Entry</h2>
        <select
          value={newDataEntry.categoryId}
          onChange={(e) => setNewDataEntry({...newDataEntry, categoryId: e.target.value})}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Entry Title"
          value={newDataEntry.title}
          onChange={(e) => setNewDataEntry({...newDataEntry, title: e.target.value})}
        />
        <textarea
          placeholder="Entry Description"
          value={newDataEntry.description}
          onChange={(e) => setNewDataEntry({...newDataEntry, description: e.target.value})}
        />
        <textarea
          placeholder="Additional Info (optional)"
          value={newDataEntry.info}
          onChange={(e) => setNewDataEntry({...newDataEntry, info: e.target.value})}
        />
        <button onClick={addDataEntry}>Add Data Entry</button>
      </div>

      {/* Categories List */}
      <div className="categories-list">
        <h2>All Categories</h2>
        {categories.map(category => (
          <div key={category._id} className="category-item">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <button onClick={() => deleteCategory(category._id)}>Delete Category</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryAdminPanel;
```

---

## Complete Examples

### Example 1: Create Category and Add Data Entries

```bash
# Step 1: Create category
curl -X POST "http://localhost:3000/api/category" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Voting Guidelines",
    "description": "Important guidelines for voters"
  }' > category.json

# Extract category ID
CATEGORY_ID=$(cat category.json | jq -r '.data._id')

# Step 2: Add first data entry
curl -X POST "http://localhost:3000/api/category/$CATEGORY_ID/data" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What to Bring",
    "description": "List of documents required for voting",
    "info": "Voter ID card, Aadhaar card, or any photo ID"
  }'

# Step 3: Add second data entry
curl -X POST "http://localhost:3000/api/category/$CATEGORY_ID/data" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Voting Hours",
    "description": "Polling booth timings",
    "info": "All booths open from 7 AM to 6 PM"
  }'

# Step 4: Get all data entries
curl "http://localhost:3000/api/category/$CATEGORY_ID/data"
```

---

### Example 2: Search and Filter Workflow

```bash
# Search categories
curl "http://localhost:3000/api/category?search=voting&includeDataEntries=true"

# Search specific category's data entries
curl "http://localhost:3000/api/category/68e123.../data?search=schedule&sortBy=createdAt&sortOrder=desc"
```

---

### Example 3: Category Management Workflow

```javascript
const axios = require('axios');

// 1. Create category
const createCat = await axios.post('/api/category', {
  name: 'Important Announcements',
  description: 'Critical announcements for voters'
});

const categoryId = createCat.data.data._id;

// 2. Add multiple data entries
const entries = [
  {
    title: 'Election Date',
    description: 'General elections on November 15, 2025',
    info: 'Mark your calendars!'
  },
  {
    title: 'Voter Registration Deadline',
    description: 'Last date to register: October 30, 2025',
    info: 'Visit nearest booth for registration'
  },
  {
    title: 'Polling Booth Locations',
    description: 'Find your polling booth',
    info: 'Check on official website or mobile app'
  }
];

for (const entry of entries) {
  await axios.post(`/api/category/${categoryId}/data`, entry);
}

// 3. Get all data entries
const dataResponse = await axios.get(`/api/category/${categoryId}/data`);
console.log(`Category has ${dataResponse.data.data.totalEntries} entries`);

// 4. Search within category
const searchResponse = await axios.get(
  `/api/category/${categoryId}/data?search=election`
);
console.log('Search results:', searchResponse.data.data.dataEntries);
```

---

## API Quick Reference

### Category CRUD
```bash
# Get all categories
GET /api/category
  ?page=1&limit=20&search=...&isActive=true&includeDataEntries=false

# Get category by ID
GET /api/category/:id

# Create category
POST /api/category
Body: { name, description }

# Update category
PUT /api/category/:id
Body: { name, description, isActive }

# Delete category
DELETE /api/category/:id
```

### Data Entry CRUD
```bash
# Get data entries
GET /api/category/:id/data
  ?activeOnly=true&search=...&sortBy=title&sortOrder=asc

# Add data entry
POST /api/category/:id/data
Body: { title, description, info }

# Update data entry
PUT /api/category/:id/data/:entryId
Body: { title, description, info, isActive }

# Delete data entry
DELETE /api/category/:id/data/:entryId

# Reorder data entries
PATCH /api/category/:id/data/reorder
Body: { entryIds: [...] }
```

### Search & Stats
```bash
# Search categories
GET /api/category/search?q=...

# Get active categories
GET /api/category/active

# Get statistics
GET /api/category/stats
```

---

## Use Cases

### Use Case 1: Information Portal

**Create categories for different types of information:**

```javascript
// Create categories
const categories = [
  { name: 'Voting Guidelines', description: 'How to vote' },
  { name: 'Important Dates', description: 'Key dates to remember' },
  { name: 'FAQ', description: 'Frequently asked questions' },
  { name: 'Contact Information', description: 'Helpline numbers' }
];

for (const cat of categories) {
  await axios.post('/api/category', cat);
}
```

### Use Case 2: Dynamic Help System

**Search-based help system:**

```javascript
// User searches "how to vote"
const results = await axios.get('/api/category/search?q=how to vote');

// Display matching categories and entries
results.data.data.forEach(category => {
  console.log(`Category: ${category.name}`);
  category.dataEntries.forEach(entry => {
    console.log(`  - ${entry.title}: ${entry.description}`);
  });
});
```

### Use Case 3: Mobile App Content

**Fetch categories for mobile app:**

```javascript
// Get all active categories with data
const response = await axios.get('/api/category?isActive=true&includeDataEntries=true');

// Transform for mobile display
const mobileContent = response.data.data.map(category => ({
  id: category._id,
  title: category.name,
  subtitle: category.description,
  items: category.dataEntries.filter(e => e.isActive).map(entry => ({
    id: entry._id,
    title: entry.title,
    description: entry.description,
    details: entry.info
  }))
}));

// Send to mobile app
```

---

## Error Handling

### Common Errors

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Title is required", "Description is required"]
}
```

**400 - Duplicate Category:**
```json
{
  "success": false,
  "message": "Category name already exists"
}
```

**404 - Category Not Found:**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**404 - Data Entry Not Found:**
```json
{
  "success": false,
  "message": "Data entry not found"
}
```

---

## Best Practices

1. **Use descriptive category names** - Clear, concise names
2. **Keep data entries focused** - One topic per entry
3. **Use search effectively** - Search categories before creating duplicates
4. **Mark inactive instead of deleting** - Preserve data history
5. **Use pagination** - Don't load all categories at once
6. **Cache category list** - Categories don't change frequently
7. **Sort data entries logically** - By date or by manual order

---

## Performance Tips

| Operation | Expected Time |
|-----------|---------------|
| Get categories (20) | < 50ms |
| Get categories with data | < 150ms |
| Search categories | < 100ms |
| Get data entries | < 80ms |
| Search data entries | < 120ms |
| Create category | < 100ms |
| Add data entry | < 150ms |

---

## Complete Workflow Example

### Scenario: Create Voter Information Portal

```bash
# Step 1: Get statistics
curl "http://localhost:3000/api/category/stats"

# Step 2: Create "Voting Information" category
curl -X POST "http://localhost:3000/api/category" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Voting Information",
    "description": "Everything voters need to know"
  }' > voting-cat.json

CAT_ID=$(cat voting-cat.json | jq -r '.data._id')

# Step 3: Add data entries
curl -X POST "http://localhost:3000/api/category/$CAT_ID/data" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to Vote",
    "description": "Step-by-step voting process",
    "info": "1. Find your name on voter list\n2. Show ID\n3. Get ballot\n4. Mark your choice\n5. Drop in box"
  }'

curl -X POST "http://localhost:3000/api/category/$CAT_ID/data" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What to Bring",
    "description": "Required documents",
    "info": "Voter ID card, Aadhaar, Driving License, or Passport"
  }'

curl -X POST "http://localhost:3000/api/category/$CAT_ID/data" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Booth Timings",
    "description": "Polling booth hours",
    "info": "Open from 7:00 AM to 6:00 PM"
  }'

# Step 4: Get all data entries
curl "http://localhost:3000/api/category/$CAT_ID/data"

# Step 5: Search within category
curl "http://localhost:3000/api/category/$CAT_ID/data?search=bring"

# Step 6: Update data entry
ENTRY_ID="68e456..."
curl -X PUT "http://localhost:3000/api/category/$CAT_ID/data/$ENTRY_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: What to Bring",
    "description": "Updated list of required documents"
  }'
```

---

## API Routes Summary

```
GET    /api/category                        - Get all categories (with search)
GET    /api/category/active                 - Get active categories
GET    /api/category/search                 - Search categories
GET    /api/category/stats                  - Get statistics
GET    /api/category/:id                    - Get category by ID
POST   /api/category                        - Create category
PUT    /api/category/:id                    - Update category
DELETE /api/category/:id                    - Delete category

GET    /api/category/:id/data               - Get data entries (with search)
POST   /api/category/:id/data               - Add data entry
PUT    /api/category/:id/data/:entryId      - Update data entry
DELETE /api/category/:id/data/:entryId      - Delete data entry
PATCH  /api/category/:id/data/reorder       - Reorder data entries
```

---

## JavaScript/Axios Examples

```javascript
const axios = require('axios');

// Get all categories with search
async function getCategories(search = '') {
  const params = { includeDataEntries: false };
  if (search) params.search = search;
  
  const response = await axios.get('/api/category', { params });
  return response.data.data;
}

// Get data entries for a category
async function getDataEntries(categoryId, search = '') {
  const params = { activeOnly: true };
  if (search) params.search = search;
  
  const response = await axios.get(`/api/category/${categoryId}/data`, { params });
  return response.data.data.dataEntries;
}

// Create category
async function createCategory(name, description) {
  const response = await axios.post('/api/category', { name, description });
  return response.data.data;
}

// Add data entry
async function addDataEntry(categoryId, title, description, info) {
  const response = await axios.post(`/api/category/${categoryId}/data`, {
    title,
    description,
    info
  });
  return response.data.data;
}

// Search categories
async function searchCategories(searchTerm) {
  const response = await axios.get(`/api/category/search?q=${searchTerm}`);
  return response.data.data;
}

// Usage
(async () => {
  // Get all categories
  const categories = await getCategories();
  console.log('Categories:', categories);
  
  // Search categories
  const searchResults = await searchCategories('voting');
  console.log('Search results:', searchResults);
  
  // Get data entries for first category
  if (categories.length > 0) {
    const entries = await getDataEntries(categories[0]._id);
    console.log('Data entries:', entries);
    
    // Search within category
    const searchedEntries = await getDataEntries(categories[0]._id, 'schedule');
    console.log('Searched entries:', searchedEntries);
  }
})();
```

---

## Mobile App Integration Example

```javascript
// Fetch all content for offline use
async function downloadCategoryContent() {
  try {
    // Get all active categories with data
    const response = await fetch('/api/category?isActive=true&includeDataEntries=true&limit=100');
    const result = await response.json();
    
    // Store in local storage for offline access
    localStorage.setItem('categories', JSON.stringify(result.data));
    
    console.log(`Downloaded ${result.data.length} categories`);
    
    // Count total data entries
    const totalEntries = result.data.reduce((sum, cat) => 
      sum + cat.dataEntries.filter(e => e.isActive).length, 0
    );
    console.log(`Total data entries: ${totalEntries}`);
    
    return result.data;
  } catch (error) {
    console.error('Error downloading content:', error);
  }
}

// Search in downloaded content (offline)
function searchOfflineCategories(searchTerm) {
  const categories = JSON.parse(localStorage.getItem('categories') || '[]');
  const regex = new RegExp(searchTerm, 'i');
  
  return categories.filter(cat => 
    regex.test(cat.name) || 
    regex.test(cat.description) ||
    cat.dataEntries.some(entry => 
      regex.test(entry.title) || 
      regex.test(entry.description) || 
      regex.test(entry.info)
    )
  );
}
```

---

## Testing Commands

```bash
# Test 1: Get all categories
curl "http://localhost:3000/api/category"

# Test 2: Search categories
curl "http://localhost:3000/api/category?search=important"

# Test 3: Get category with data
curl "http://localhost:3000/api/category/CATEGORY_ID"

# Test 4: Get data entries
curl "http://localhost:3000/api/category/CATEGORY_ID/data"

# Test 5: Search within data entries
curl "http://localhost:3000/api/category/CATEGORY_ID/data?search=voting"

# Test 6: Create category
curl -X POST "http://localhost:3000/api/category" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Category", "description": "Test description"}'

# Test 7: Add data entry
curl -X POST "http://localhost:3000/api/category/CATEGORY_ID/data" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Entry",
    "description": "Test description",
    "info": "Additional info"
  }'

# Test 8: Get statistics
curl "http://localhost:3000/api/category/stats"
```

---

## Data Model Reference

### Category Schema
```javascript
{
  name: String (required, unique, max 100 chars),
  description: String (max 500 chars),
  isActive: Boolean (default: true),
  dataEntries: [DataEntry],
  createdAt: Date,
  updatedAt: Date
}
```

### Data Entry Schema
```javascript
{
  _id: ObjectId (auto-generated),
  title: String (required, max 200 chars),
  description: String (required, max 1000 chars),
  info: String (max 2000 chars),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

**Version:** 1.0.0  
**Last Updated:** October 9, 2025  
**Status:** ✅ Production Ready  

The Category API provides a flexible content management system for organizing and displaying information to voters and sub-admins! 🎉

