# Voters with Assignment Status API

## Overview
This API endpoint provides comprehensive voter management with assignment status tracking. It allows you to retrieve all voters or VoterFour records along with their current assignment status, showing which voters are assigned to which sub-administrators.

## Endpoint

### GET /api/assignment/voters
Get all voters with their assignment status, including search, filtering, sorting, and pagination capabilities.

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of items per page |
| `voterType` | string | "Voter" | Type of voter: "Voter" or "VoterFour" |
| `search` | string | - | Search term (searches across multiple fields) |
| `sortBy` | string | "Voter Name Eng" | Field to sort by |
| `sortOrder` | string | "desc" | Sort direction: "asc" or "desc" |
| `assignedOnly` | boolean | false | Filter to show only assigned voters |

## Search Fields
When using the `search` parameter, it searches across these fields:
- `Voter Name Eng` - Voter's name in English
- `Voter Name` - Voter's name in local language
- `Relative Name Eng` - Relative's name in English
- `Relative Name` - Relative's name in local language
- `Address` - Address in local language
- `Address Eng` - Address in English
- `AC` - Assembly Constituency
- `Part` - Part number
- `Booth` - Booth number

## Sortable Fields
You can sort by any field in the voter document, including:
- `Voter Name Eng`
- `Voter Name`
- `Relative Name Eng`
- `Relative Name`
- `Address`
- `Address Eng`
- `AC`
- `Part`
- `Booth`
- `Age`
- `Gender`
- `isPaid`
- `isVisited`
- `isActive`

## Request Examples

### Basic Request
```bash
GET /api/assignment/voters?voterType=Voter&page=1&limit=20
```

### Search Request
```bash
GET /api/assignment/voters?search=John&voterType=Voter&page=1&limit=10
```

### Get Only Assigned Voters
```bash
GET /api/assignment/voters?assignedOnly=true&voterType=Voter&page=1&limit=20
```

### VoterFour Records
```bash
GET /api/assignment/voters?voterType=VoterFour&page=1&limit=10
```

### Advanced Filtering
```bash
GET /api/assignment/voters?voterType=Voter&search=New York&sortBy=fullName&sortOrder=asc&page=1&limit=50
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "fullName": "John Doe",
      "voterId": "VOTER001",
      "phoneNumber": "9876543210",
      "address": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "pincode": "10001",
      "gender": "Male",
      "age": 35,
      "email": "john.doe@email.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "assignmentStatus": {
        "isAssigned": true,
        "subAdmin": {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "fullName": "Jane Smith",
          "userId": "SUBADMIN001",
          "locationName": "Downtown District"
        },
        "assignedAt": "2024-01-15T10:30:00.000Z",
        "assignmentId": "64f8a1b2c3d4e5f6a7b8c9d4",
        "notes": "Assigned for door-to-door campaign"
      }
    },
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "fullName": "Alice Johnson",
      "voterId": "VOTER002",
      "phoneNumber": "9876543211",
      "address": "456 Oak Avenue",
      "city": "Los Angeles",
      "state": "CA",
      "pincode": "90210",
      "gender": "Female",
      "age": 28,
      "email": "alice.johnson@email.com",
      "isActive": true,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-16T10:30:00.000Z",
      "assignmentStatus": {
        "isAssigned": false,
        "subAdmin": null,
        "assignedAt": null,
        "assignmentId": null,
        "notes": null
      }
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
  "assignmentStats": {
    "totalVoters": 20,
    "assignedVoters": 15,
    "unassignedVoters": 5
  }
}
```

## Response Fields

### Voter Object
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique voter ID |
| `fullName` | string | Voter's full name |
| `voterId` | string | Voter's unique identifier |
| `phoneNumber` | string | Phone number |
| `address` | string | Address |
| `city` | string | City |
| `state` | string | State |
| `pincode` | string | Postal code |
| `gender` | string | Gender |
| `age` | number | Age |
| `email` | string | Email address |
| `isActive` | boolean | Active status |
| `createdAt` | string | Creation timestamp |
| `updatedAt` | string | Last update timestamp |
| `assignmentStatus` | object | Assignment information |

### Assignment Status Object
| Field | Type | Description |
|-------|------|-------------|
| `isAssigned` | boolean | Whether the voter is assigned to a sub-admin |
| `subAdmin` | object/null | Sub-admin information if assigned |
| `assignedAt` | string/null | Assignment timestamp |
| `assignmentId` | string/null | Assignment ID |
| `notes` | string/null | Assignment notes |

### Sub-Admin Object (when assigned)
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Sub-admin ID |
| `fullName` | string | Sub-admin's full name |
| `userId` | string | Sub-admin's user ID |
| `locationName` | string | Assigned location |

### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| `currentPage` | number | Current page number |
| `totalPages` | number | Total number of pages |
| `totalCount` | number | Total number of voters |
| `hasNextPage` | boolean | Whether there's a next page |
| `hasPrevPage` | boolean | Whether there's a previous page |
| `limit` | number | Items per page |

### Assignment Statistics
| Field | Type | Description |
|-------|------|-------------|
| `totalVoters` | number | Total voters in current page |
| `assignedVoters` | number | Number of assigned voters |
| `unassignedVoters` | number | Number of unassigned voters |

## Error Responses

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching voters with assignment status",
  "error": "Detailed error message"
}
```

## Frontend Implementation Guide

### 1. Data Table Structure
Create a table with the following columns:
- **Name** (`fullName`)
- **Voter ID** (`voterId`)
- **Phone** (`phoneNumber`)
- **Location** (`city`, `state`)
- **Assignment Status** (`assignmentStatus.isAssigned`)
- **Assigned To** (`assignmentStatus.subAdmin.fullName`)
- **Assignment Date** (`assignmentStatus.assignedAt`)
- **Actions** (View details, Edit, etc.)

### 2. Search Implementation
Implement a search input that triggers API calls with the `search` parameter:
```javascript
const handleSearch = (searchTerm) => {
  const params = new URLSearchParams({
    search: searchTerm,
    voterType: 'Voter',
    page: 1,
    limit: 20
  });
  fetch(`/api/assignment/voters?${params}`);
};
```

### 3. Filtering Options
- **Voter Type Toggle**: Switch between "Voter" and "VoterFour"
- **Assignment Status Filter**: Show "All", "Assigned Only", or "Unassigned Only"
- **Sort Options**: Dropdown with sortable fields
- **Sort Direction**: Ascending/Descending toggle

### 4. Pagination
Implement pagination controls using the pagination object:
```javascript
const PaginationComponent = ({ pagination, onPageChange }) => {
  return (
    <div className="pagination">
      <button 
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(pagination.currentPage - 1)}
      >
        Previous
      </button>
      
      <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
      
      <button 
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};
```

### 5. Assignment Status Display
Create a visual indicator for assignment status:
```javascript
const AssignmentStatus = ({ assignmentStatus }) => {
  if (assignmentStatus.isAssigned) {
    return (
      <div className="assignment-status assigned">
        <span className="status-indicator assigned"></span>
        <span>Assigned to {assignmentStatus.subAdmin.fullName}</span>
        <small>{new Date(assignmentStatus.assignedAt).toLocaleDateString()}</small>
      </div>
    );
  } else {
    return (
      <div className="assignment-status unassigned">
        <span className="status-indicator unassigned"></span>
        <span>Unassigned</span>
      </div>
    );
  }
};
```

### 6. Statistics Dashboard
Display assignment statistics:
```javascript
const AssignmentStats = ({ stats }) => (
  <div className="stats-dashboard">
    <div className="stat-card">
      <h3>Total Voters</h3>
      <p>{stats.totalVoters}</p>
    </div>
    <div className="stat-card">
      <h3>Assigned</h3>
      <p>{stats.assignedVoters}</p>
    </div>
    <div className="stat-card">
      <h3>Unassigned</h3>
      <p>{stats.unassignedVoters}</p>
    </div>
  </div>
);
```

## Sample Frontend Code Structure

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const VotersWithAssignmentStatus = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    voterType: 'Voter',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    assignedOnly: false
  });

  const fetchVoters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/assignment/voters?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setVoters(data.data);
        setPagination(data.pagination);
        setStats(data.assignmentStats);
      }
    } catch (error) {
      console.error('Error fetching voters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="voters-assignment-page">
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search voters..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        
        <select
          value={filters.voterType}
          onChange={(e) => handleFilterChange('voterType', e.target.value)}
        >
          <option value="Voter">Voters</option>
          <option value="VoterFour">VoterFour</option>
        </select>
        
        <select
          value={filters.assignedOnly}
          onChange={(e) => handleFilterChange('assignedOnly', e.target.value === 'true')}
        >
          <option value={false}>All Voters</option>
          <option value={true}>Assigned Only</option>
        </select>
      </div>

      <AssignmentStats stats={stats} />
      
      <div className="voters-table">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Voter ID</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Assignment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {voters.map(voter => (
                <tr key={voter._id}>
                  <td>{voter.fullName}</td>
                  <td>{voter.voterId}</td>
                  <td>{voter.phoneNumber}</td>
                  <td>{voter.city}, {voter.state}</td>
                  <td>
                    <AssignmentStatus assignmentStatus={voter.assignmentStatus} />
                  </td>
                  <td>
                    <button onClick={() => handleViewDetails(voter)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PaginationComponent 
        pagination={pagination} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
};

export default VotersWithAssignmentStatus;
```

## CSS Styling Suggestions

```css
.assignment-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.assigned {
  background-color: #10b981;
}

.status-indicator.unassigned {
  background-color: #ef4444;
}

.stats-dashboard {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.filters-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.voters-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.voters-table table {
  width: 100%;
  border-collapse: collapse;
}

.voters-table th,
.voters-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.voters-table th {
  background-color: #f3f4f6;
  font-weight: 600;
}
```

This documentation provides everything needed to create a comprehensive frontend for managing voters with assignment status, including search, filtering, pagination, and visual indicators for assignment status.
