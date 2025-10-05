# Surveyor Analytics API Documentation

## Overview
The Surveyor Analytics API provides comprehensive insights into surveyor performance, including daily surveys, total surveys, and productivity metrics. This endpoint helps track which surveyors are most active and provides valuable analytics for management.

## Endpoint
```
GET /api/survey/analytics/surveyors
```

## Query Parameters

### Pagination
- `page` (optional) - Page number for pagination (default: 1)
- `limit` (optional) - Number of records per page (default: 20)

### Date Filtering
- `dateFrom` (optional) - Start date for filtering surveys (ISO 8601 format)
- `dateTo` (optional) - End date for filtering surveys (ISO 8601 format)

### Sorting
- `sortBy` (optional) - Field to sort by (default: 'totalSurveys')
  - Available fields: `totalSurveys`, `todaySurveys`, `yesterdaySurveys`, `lastSurveyDate`, `firstSurveyDate`, `averageSurveysPerDay`
- `sortOrder` (optional) - Sort order: `asc` or `desc` (default: 'desc')

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "surveyorId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "surveyorName": "John Doe",
      "surveyorEmail": "john.doe@example.com",
      "totalSurveys": 150,
      "todaySurveys": 8,
      "yesterdaySurveys": 12,
      "lastSurveyDate": "2024-01-15T14:30:00.000Z",
      "firstSurveyDate": "2024-01-01T09:00:00.000Z",
      "averageSurveysPerDay": 9.38
    },
    {
      "surveyorId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "surveyorName": "Jane Smith",
      "surveyorEmail": "jane.smith@example.com",
      "totalSurveys": 98,
      "todaySurveys": 5,
      "yesterdaySurveys": 7,
      "lastSurveyDate": "2024-01-15T16:45:00.000Z",
      "firstSurveyDate": "2024-01-05T08:30:00.000Z",
      "averageSurveysPerDay": 9.8
    }
  ],
  "summary": {
    "totalSurveyors": 15,
    "totalSurveys": 1247,
    "totalTodaySurveys": 45,
    "totalYesterdaySurveys": 52,
    "averageSurveysPerSurveyor": 83.13
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 15,
    "hasNextPage": false,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

### Error Response (500)
```json
{
  "success": false,
  "message": "Error fetching surveyor analytics",
  "error": "Error details"
}
```

## Field Descriptions

### Surveyor Data Fields
- `surveyorId` - Unique identifier for the surveyor
- `surveyorName` - Display name of the surveyor (from User model)
- `surveyorEmail` - Email address of the surveyor
- `totalSurveys` - Total number of surveys completed by this surveyor
- `todaySurveys` - Number of surveys completed today (00:00:00 to 23:59:59)
- `yesterdaySurveys` - Number of surveys completed yesterday
- `lastSurveyDate` - Date and time of the most recent survey
- `firstSurveyDate` - Date and time of the first survey by this surveyor
- `averageSurveysPerDay` - Average surveys per day since first survey (rounded to 2 decimal places)

### Summary Fields
- `totalSurveyors` - Total number of unique surveyors
- `totalSurveys` - Total surveys across all surveyors
- `totalTodaySurveys` - Total surveys completed today by all surveyors
- `totalYesterdaySurveys` - Total surveys completed yesterday by all surveyors
- `averageSurveysPerSurveyor` - Average surveys per surveyor (rounded to 2 decimal places)

## Usage Examples

### 1. Basic Analytics Request
```bash
curl -X GET "https://voter.myserverdevops.com/api/survey/analytics/surveyors" \
  -H "Content-Type: application/json"
```

### 2. Paginated Results
```bash
curl -X GET "https://voter.myserverdevops.com/api/survey/analytics/surveyors?page=2&limit=10" \
  -H "Content-Type: application/json"
```

### 3. Date Range Filtering
```bash
curl -X GET "https://voter.myserverdevops.com/api/survey/analytics/surveyors?dateFrom=2024-01-01&dateTo=2024-01-31" \
  -H "Content-Type: application/json"
```

### 4. Sort by Today's Surveys (Descending)
```bash
curl -X GET "https://voter.myserverdevops.com/api/survey/analytics/surveyors?sortBy=todaySurveys&sortOrder=desc" \
  -H "Content-Type: application/json"
```

### 5. Sort by Average Surveys Per Day (Ascending)
```bash
curl -X GET "https://voter.myserverdevops.com/api/survey/analytics/surveyors?sortBy=averageSurveysPerDay&sortOrder=asc" \
  -H "Content-Type: application/json"
```

### 6. Combined Parameters
```bash
curl -X GET "https://voter.myserverdevops.com/api/survey/analytics/surveyors?page=1&limit=5&dateFrom=2024-01-01&sortBy=totalSurveys&sortOrder=desc" \
  -H "Content-Type: application/json"
```

## Frontend Implementation Examples

### 1. JavaScript/TypeScript Implementation
```javascript
// Fetch surveyor analytics
async function getSurveyorAnalytics(params = {}) {
  const queryParams = new URLSearchParams(params);
  
  try {
    const response = await fetch(`/api/survey/analytics/surveyors?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching surveyor analytics:', error);
    throw error;
  }
}

// Usage examples
const analytics = await getSurveyorAnalytics();
const todayTopPerformers = await getSurveyorAnalytics({
  sortBy: 'todaySurveys',
  sortOrder: 'desc',
  limit: 10
});
```

### 2. React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const SurveyorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('totalSurveys');

  useEffect(() => {
    fetchAnalytics();
  }, [page, sortBy]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/survey/analytics/surveyors?page=${page}&sortBy=${sortBy}&sortOrder=desc`
      );
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="surveyor-analytics">
      <h2>Surveyor Performance Analytics</h2>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Surveyors</h3>
          <p>{analytics.summary.totalSurveyors}</p>
        </div>
        <div className="card">
          <h3>Total Surveys</h3>
          <p>{analytics.summary.totalSurveys}</p>
        </div>
        <div className="card">
          <h3>Today's Surveys</h3>
          <p>{analytics.summary.totalTodaySurveys}</p>
        </div>
        <div className="card">
          <h3>Yesterday's Surveys</h3>
          <p>{analytics.summary.totalYesterdaySurveys}</p>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="controls">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="totalSurveys">Total Surveys</option>
          <option value="todaySurveys">Today's Surveys</option>
          <option value="yesterdaySurveys">Yesterday's Surveys</option>
          <option value="averageSurveysPerDay">Average per Day</option>
          <option value="lastSurveyDate">Last Survey Date</option>
        </select>
      </div>

      {/* Analytics Table */}
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Surveyor Name</th>
            <th>Email</th>
            <th>Total Surveys</th>
            <th>Today</th>
            <th>Yesterday</th>
            <th>Avg/Day</th>
            <th>Last Survey</th>
          </tr>
        </thead>
        <tbody>
          {analytics.data.map((surveyor) => (
            <tr key={surveyor.surveyorId}>
              <td>{surveyor.surveyorName}</td>
              <td>{surveyor.surveyorEmail}</td>
              <td>{surveyor.totalSurveys}</td>
              <td className={surveyor.todaySurveys > 0 ? 'highlight' : ''}>
                {surveyor.todaySurveys}
              </td>
              <td>{surveyor.yesterdaySurveys}</td>
              <td>{surveyor.averageSurveysPerDay}</td>
              <td>{new Date(surveyor.lastSurveyDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button 
          disabled={!analytics.pagination.hasPrevPage}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {analytics.pagination.currentPage} of {analytics.pagination.totalPages}
        </span>
        <button 
          disabled={!analytics.pagination.hasNextPage}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SurveyorAnalytics;
```

### 3. Chart.js Integration Example
```javascript
// Create charts from analytics data
function createSurveyorCharts(analytics) {
  // Top 10 Surveyors by Total Surveys
  const topSurveyors = analytics.data.slice(0, 10);
  
  const totalSurveysChart = new Chart(document.getElementById('totalSurveysChart'), {
    type: 'bar',
    data: {
      labels: topSurveyors.map(s => s.surveyorName),
      datasets: [{
        label: 'Total Surveys',
        data: topSurveyors.map(s => s.totalSurveys),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Today's Performance
  const todayChart = new Chart(document.getElementById('todayChart'), {
    type: 'doughnut',
    data: {
      labels: ['Active Today', 'Inactive Today'],
      datasets: [{
        data: [
          analytics.data.filter(s => s.todaySurveys > 0).length,
          analytics.data.filter(s => s.todaySurveys === 0).length
        ],
        backgroundColor: ['#28a745', '#dc3545']
      }]
    },
    options: {
      responsive: true
    }
  });
}
```

## Key Features

### 1. **Real-time Analytics**
- Shows today's and yesterday's survey counts
- Updates automatically based on current date/time
- Provides immediate insights into surveyor activity

### 2. **Comprehensive Metrics**
- Total surveys per surveyor
- Daily performance tracking
- Average surveys per day calculation
- First and last survey dates

### 3. **Flexible Filtering**
- Date range filtering for historical analysis
- Customizable sorting options
- Pagination for large datasets

### 4. **Performance Optimized**
- Uses MongoDB aggregation pipeline for efficient data processing
- Minimal database queries
- Fast response times even with large datasets

### 5. **Summary Statistics**
- Overall system performance metrics
- Comparative analysis across surveyors
- Management dashboard ready data

## Use Cases

### 1. **Performance Monitoring**
- Track which surveyors are most productive
- Identify top performers for recognition
- Monitor daily activity levels

### 2. **Resource Planning**
- Understand surveyor workload distribution
- Plan survey assignments based on performance
- Identify surveyors who may need additional support

### 3. **Quality Management**
- Monitor survey completion rates
- Track surveyor consistency over time
- Identify patterns in surveyor behavior

### 4. **Reporting and Analytics**
- Generate performance reports for management
- Create dashboards for real-time monitoring
- Export data for external analysis tools

## Error Handling

The API includes comprehensive error handling for various scenarios:

- **Invalid date formats** - Returns appropriate error messages
- **Database connection issues** - Graceful error responses
- **Invalid query parameters** - Validation with helpful error messages
- **Empty results** - Proper handling of no data scenarios

## Performance Considerations

- **Aggregation Pipeline**: Uses MongoDB's efficient aggregation framework
- **Indexing**: Leverages existing indexes on surveyorId and createdAt fields
- **Pagination**: Prevents memory issues with large datasets
- **Caching**: Consider implementing Redis caching for frequently accessed data

## Security

- **No Authentication Required**: This is a public analytics endpoint
- **Data Privacy**: Only shows aggregated data, no sensitive voter information
- **Rate Limiting**: Consider implementing rate limiting for production use

## Future Enhancements

Potential improvements for future versions:

1. **Time-based Analytics**: Hourly, weekly, monthly breakdowns
2. **Geographic Analytics**: Location-based surveyor performance
3. **Comparative Analytics**: Year-over-year comparisons
4. **Export Functionality**: CSV/Excel export capabilities
5. **Real-time Updates**: WebSocket integration for live updates
6. **Advanced Filtering**: Filter by surveyor status, region, etc.
