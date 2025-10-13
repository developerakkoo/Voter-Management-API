# Enhanced Survey Search API Guide

## Overview
This guide covers the enhanced survey search functionality that allows advanced filtering and searching across all survey fields, plus comprehensive member statistics.

## 📍 Enhanced Search Endpoint

### Endpoint
```
GET /api/survey
```

### Basic Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 20 | Number of records per page |
| `sortBy` | string | 'createdAt' | Field to sort by |
| `sortOrder` | string | 'desc' | Sort order: 'asc' or 'desc' |

### Basic Filters
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Survey status: 'draft', 'completed', 'submitted', 'verified', 'rejected' |
| `surveyorId` | string | Surveyor ObjectId |
| `voterType` | string | 'Voter' or 'VoterFour' |
| `voterId` | string | Voter ObjectId |
| `voterPhoneNumber` | string | Voter phone number (partial match) |
| `dateFrom` | string | Start date (ISO format) |
| `dateTo` | string | End date (ISO format) |

### Advanced Search Parameters

#### General Search
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Searches across multiple fields: voter phone, location, notes, member names/phones, survey data |

#### Voter Information
| Parameter | Type | Description |
|-----------|------|-------------|
| `voterName` | string | Voter name (partial match) |
| `voterNameEng` | string | Voter name in English (partial match) |
| `relativeName` | string | Relative name (partial match) |
| `relativeNameEng` | string | Relative name in English (partial match) |
| `cardNo` | string | Voter card number (partial match) |
| `pno` | string | Part number (partial match) |
| `codeNo` | string | Code number (partial match) |
| `ac` | string | Assembly Constituency (partial match) |
| `part` | string | Part number (partial match) |
| `booth` | string | Booth name (partial match) |
| `boothNo` | string | Booth number (partial match) |
| `address` | string | Address (partial match) |
| `addressEng` | string | Address in English (partial match) |
| `age` | number | Exact age match |
| `sex` | string | Gender: 'Male', 'Female', 'Other' |

#### Member Information
| Parameter | Type | Description |
|-----------|------|-------------|
| `memberName` | string | Member name (partial match) |
| `memberPhoneNumber` | string | Member phone number (partial match) |
| `memberRelationship` | string | Member relationship (partial match) |
| `memberAge` | number | Member exact age |
| `memberIsVoter` | boolean | Filter by member voter status |

#### Surveyor & Quality
| Parameter | Type | Description |
|-----------|------|-------------|
| `surveyorName` | string | Surveyor name (partial match) |
| `locationAccuracy` | number | Maximum location accuracy (meters) |
| `qualityScore` | number | Minimum quality score |

---

## 📊 Enhanced Stats Endpoint

### Endpoint
```
GET /api/survey/stats
```

### New Member Statistics
The stats endpoint now includes comprehensive member statistics:

#### Member Statistics Object
```json
{
  "memberStatistics": {
    "totalMembers": 5000,
    "voterMembers": 3200,
    "nonVoterMembers": 1800,
    "voterPercentage": 64,
    "nonVoterPercentage": 36
  }
}
```

#### Member Age Groups
```json
{
  "memberAgeGroups": [
    {
      "_id": {"$numberInt": "0"},
      "count": 150,
      "voters": 0,
      "nonVoters": 150
    },
    {
      "_id": {"$numberInt": "18"},
      "count": 800,
      "voters": 600,
      "nonVoters": 200
    },
    {
      "_id": {"$numberInt": "30"},
      "count": 2000,
      "voters": 1800,
      "nonVoters": 200
    }
  ]
}
```

#### Member Relationships
```json
{
  "memberRelationships": [
    {
      "_id": "Family Member",
      "count": 3000,
      "voters": 2000,
      "nonVoters": 1000
    },
    {
      "_id": "Spouse",
      "count": 1500,
      "voters": 1000,
      "nonVoters": 500
    }
  ]
}
```

---

## 🔍 Usage Examples

### 1. Basic Search
```bash
# Search for surveys containing "ha" in any field
GET /api/survey?search=ha&page=1&limit=20

# Filter by status and voter type
GET /api/survey?status=completed&voterType=VoterFour
```

### 2. Advanced Voter Search
```bash
# Search by voter name
GET /api/survey?voterNameEng=John&voterType=Voter

# Search by AC and booth
GET /api/survey?ac=208&booth=Kharadi

# Search by address
GET /api/survey?address=Thitevasti&addressEng=Thite
```

### 3. Member-Based Search
```bash
# Find surveys with members who are voters
GET /api/survey?memberIsVoter=true

# Search by member name
GET /api/survey?memberName=Kumar&memberRelationship=Family

# Filter by member age
GET /api/survey?memberAge=25
```

### 4. Surveyor and Quality Search
```bash
# Search by surveyor name
GET /api/survey?surveyorName=teamc1

# Filter by location accuracy (high precision only)
GET /api/survey?locationAccuracy=20

# Filter by quality score
GET /api/survey?qualityScore=80
```

### 5. Complex Combined Search
```bash
# Complex search combining multiple criteria
GET /api/survey?search=thite&voterType=VoterFour&status=completed&memberIsVoter=false&locationAccuracy=50
```

### 6. Date Range with Advanced Filters
```bash
# Search within date range with specific criteria
GET /api/survey?dateFrom=2025-10-01&dateTo=2025-10-31&ac=208&memberAge=30&sortBy=createdAt&sortOrder=desc
```

---

## 📱 Frontend Implementation Examples

### React Search Component
```javascript
import React, { useState } from 'react';

const SurveySearchForm = () => {
  const [searchParams, setSearchParams] = useState({
    search: '',
    status: '',
    voterType: '',
    voterNameEng: '',
    ac: '',
    memberIsVoter: '',
    surveyorName: '',
    locationAccuracy: '',
    qualityScore: '',
    page: 1,
    limit: 20
  });

  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    
    // Add non-empty parameters
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    try {
      const response = await fetch(`/api/survey?${params}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="search-form">
      <div className="search-row">
        <input
          type="text"
          placeholder="General search..."
          value={searchParams.search}
          onChange={(e) => setSearchParams({...searchParams, search: e.target.value})}
        />
        
        <select
          value={searchParams.status}
          onChange={(e) => setSearchParams({...searchParams, status: e.target.value})}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
        </select>

        <select
          value={searchParams.voterType}
          onChange={(e) => setSearchParams({...searchParams, voterType: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="Voter">Voter</option>
          <option value="VoterFour">VoterFour</option>
        </select>
      </div>

      <div className="advanced-filters">
        <input
          type="text"
          placeholder="Voter Name (English)"
          value={searchParams.voterNameEng}
          onChange={(e) => setSearchParams({...searchParams, voterNameEng: e.target.value})}
        />
        
        <input
          type="text"
          placeholder="AC Number"
          value={searchParams.ac}
          onChange={(e) => setSearchParams({...searchParams, ac: e.target.value})}
        />

        <select
          value={searchParams.memberIsVoter}
          onChange={(e) => setSearchParams({...searchParams, memberIsVoter: e.target.value})}
        >
          <option value="">All Members</option>
          <option value="true">Voter Members</option>
          <option value="false">Non-Voter Members</option>
        </select>

        <input
          type="text"
          placeholder="Surveyor Name"
          value={searchParams.surveyorName}
          onChange={(e) => setSearchParams({...searchParams, surveyorName: e.target.value})}
        />

        <input
          type="number"
          placeholder="Max Location Accuracy (m)"
          value={searchParams.locationAccuracy}
          onChange={(e) => setSearchParams({...searchParams, locationAccuracy: e.target.value})}
        />

        <input
          type="number"
          placeholder="Min Quality Score"
          value={searchParams.qualityScore}
          onChange={(e) => setSearchParams({...searchParams, qualityScore: e.target.value})}
        />
      </div>

      <button onClick={handleSearch}>Search Surveys</button>

      {results && (
        <div className="results">
          <h3>Search Results ({results.pagination.totalCount} found)</h3>
          <div className="surveys-list">
            {results.data.map(survey => (
              <div key={survey._id} className="survey-card">
                <h4>{survey.surveyData?.voterDetails?.voter_name_eng || 'Unknown'}</h4>
                <p>Status: {survey.status}</p>
                <p>Voter Type: {survey.voterType}</p>
                <p>Members: {survey.members?.length || 0}</p>
                <p>Surveyor: {survey.surveyorId?.fullName || 'Unknown'}</p>
              </div>
            ))}
          </div>
          
          <div className="pagination">
            <button 
              disabled={!results.pagination.hasPrevPage}
              onClick={() => setSearchParams({...searchParams, page: searchParams.page - 1})}
            >
              Previous
            </button>
            <span>Page {results.pagination.currentPage} of {results.pagination.totalPages}</span>
            <button 
              disabled={!results.pagination.hasNextPage}
              onClick={() => setSearchParams({...searchParams, page: searchParams.page + 1})}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Statistics Dashboard Component
```javascript
import React, { useState, useEffect } from 'react';

const SurveyStatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/survey/stats');
      const data = await response.json();
      setStats(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading statistics...</div>;
  if (!stats) return <div>Error loading statistics</div>;

  return (
    <div className="stats-dashboard">
      <h2>Survey Statistics</h2>
      
      {/* Overview Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total Surveys</h3>
          <p>{stats.overview.totalSurveys}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p>{stats.overview.completedSurveys}</p>
        </div>
        <div className="stat-card">
          <h3>Verified</h3>
          <p>{stats.overview.verifiedSurveys}</p>
        </div>
      </div>

      {/* Member Statistics */}
      <div className="member-stats">
        <h3>Member Statistics</h3>
        <div className="member-overview">
          <div className="stat-card">
            <h4>Total Members</h4>
            <p>{stats.memberStatistics.totalMembers}</p>
          </div>
          <div className="stat-card voter-members">
            <h4>Voter Members</h4>
            <p>{stats.memberStatistics.voterMembers}</p>
            <small>({stats.memberStatistics.voterPercentage}%)</small>
          </div>
          <div className="stat-card non-voter-members">
            <h4>Non-Voter Members</h4>
            <p>{stats.memberStatistics.nonVoterMembers}</p>
            <small>({stats.memberStatistics.nonVoterPercentage}%)</small>
          </div>
        </div>

        {/* Age Group Breakdown */}
        <div className="age-groups">
          <h4>Members by Age Groups</h4>
          <div className="age-chart">
            {stats.memberAgeGroups.map((group, index) => (
              <div key={index} className="age-group">
                <span className="age-range">
                  {group._id === 0 ? '0-17' :
                   group._id === 18 ? '18-29' :
                   group._id === 30 ? '30-49' :
                   group._id === 50 ? '50-64' :
                   group._id === 65 ? '65+' : 'Unknown'}
                </span>
                <div className="progress-bar">
                  <div 
                    className="progress-voters" 
                    style={{width: `${(group.voters / group.count) * 100}%`}}
                  ></div>
                  <div 
                    className="progress-non-voters" 
                    style={{width: `${(group.nonVoters / group.count) * 100}%`}}
                  ></div>
                </div>
                <span className="count">{group.count} total</span>
              </div>
            ))}
          </div>
        </div>

        {/* Relationship Breakdown */}
        <div className="relationships">
          <h4>Members by Relationship</h4>
          <div className="relationship-list">
            {stats.memberRelationships.map((rel, index) => (
              <div key={index} className="relationship-item">
                <span className="relationship-name">{rel._id || 'Unknown'}</span>
                <span className="relationship-stats">
                  {rel.voters} voters, {rel.nonVoters} non-voters ({rel.count} total)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎯 Best Practices

### 1. Performance Optimization
- Use specific field searches instead of general `search` when possible
- Limit results with appropriate `limit` values
- Use pagination for large result sets
- Index frequently searched fields in MongoDB

### 2. Search Strategy
- Start with basic filters (status, voterType) to narrow down results
- Use specific field searches for precise matching
- Combine multiple criteria for complex queries
- Use date ranges to limit search scope

### 3. User Experience
- Provide search suggestions and autocomplete
- Show search result counts and pagination
- Allow users to save frequently used search combinations
- Display clear error messages for invalid searches

### 4. Data Analysis
- Use member statistics for demographic analysis
- Monitor search patterns to identify popular filters
- Track member voter registration rates
- Analyze age group and relationship patterns

---

## 🔧 Technical Notes

### Search Logic
- All text searches use case-insensitive regex matching
- Multiple search conditions are combined with `$or` operator
- Numeric searches use exact matching
- Boolean searches support string and boolean values

### Performance Considerations
- MongoDB indexes should be created for frequently searched fields
- Complex queries may take longer for large datasets
- Consider implementing search result caching for common queries
- Monitor query performance and optimize as needed

### Error Handling
- Invalid parameters are ignored (graceful degradation)
- Date parsing errors return appropriate error messages
- Large result sets are automatically paginated
- Search timeouts are handled gracefully

This enhanced search functionality provides comprehensive filtering capabilities while maintaining good performance and user experience.
