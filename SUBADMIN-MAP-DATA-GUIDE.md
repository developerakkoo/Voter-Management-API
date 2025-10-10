# Sub-Admin Map Data API - Complete Guide

Guide for sub-admins to fetch their assigned voters' completed surveys with location data for map plotting and grouping.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Endpoint Details](#endpoint-details)
3. [Response Format](#response-format)
4. [Query Parameters](#query-parameters)
5. [Map Integration Examples](#map-integration-examples)
6. [Grouping Strategies](#grouping-strategies)
7. [Frontend Implementation](#frontend-implementation)

---

## Overview

### What is This Endpoint For?

This endpoint allows sub-admins to:
- ✅ Get all **assigned voters** who have **completed surveys**
- ✅ Fetch **location coordinates** for map plotting
- ✅ Include **family members** from surveys
- ✅ Group surveys by location for **cluster visualization**
- ✅ View **surveyor information** for each survey
- ✅ Filter by voter type and survey status

### Key Features

- 🗺️ **Map-Ready Data** - Lat/Lng coordinates for each survey
- 👥 **Family Members** - Include household members
- 📍 **Location Accuracy** - GPS accuracy information
- 🏷️ **Voter Details** - Name, AC, Part, Booth, Phone
- 👤 **Surveyor Info** - Who conducted the survey
- 🔄 **Flexible Filtering** - By voter type, status, limit

---

## Endpoint Details

### Endpoint
```
GET /api/subadmin/voters/map-data
```

### Authentication
**Required:** Sub-admin JWT token in Authorization header

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `voterType` | string | 'all' | 'all', 'Voter', or 'VoterFour' |
| `status` | string | 'completed' | Survey status filter |
| `includeMembers` | boolean | 'true' | Include family members in response |
| `limit` | number | 1000 | Maximum surveys to return |

---

## Response Format

### Complete Response Structure

```json
{
  "success": true,
  "data": [
    {
      "surveyId": "68df79494f84cb7c158050d9",
      "voterId": "68dd9a8c90752b2d27b79da9",
      "voterType": "Voter",
      "voterName": "Arati Jagtap",
      "voterNameHindi": "आरती जगताप",
      "ac": "208",
      "part": "12",
      "booth": "श्री एकनाथराव खेसे स्कुल...",
      "phoneNumber": "8888888888",
      "location": {
        "lat": 18.6232198,
        "lng": 73.7119472,
        "accuracy": 34.214
      },
      "surveyor": {
        "id": "68deeff4c2cbbe75f28d17f2",
        "name": "Vijay Patil",
        "userId": "vijaypatil",
        "pno": "4"
      },
      "status": "completed",
      "completedAt": "2025-10-03T07:20:41.801Z",
      "createdAt": "2025-10-03T07:20:41.801Z",
      "members": [
        {
          "name": "Aarti Suresh Khandave",
          "age": 38,
          "phoneNumber": "5555555555",
          "relationship": "Family Member",
          "isVoter": true,
          "voterId": "68dd9a8090752b2d27b779d1",
          "voterType": "Voter"
        }
      ],
      "membersCount": 1
    }
  ],
  "meta": {
    "totalVoters": 150,
    "totalSurveys": 142,
    "surveysWithLocation": 142,
    "filters": {
      "voterType": "all",
      "status": "completed",
      "includeMembers": true,
      "limit": 1000
    }
  }
}
```

### Field Descriptions

| Field | Description |
|-------|-------------|
| `surveyId` | MongoDB ID of the survey |
| `voterId` | MongoDB ID of the voter |
| `voterType` | 'Voter' or 'VoterFour' |
| `voterName` | Voter's name in English |
| `voterNameHindi` | Voter's name in Hindi |
| `ac` | Assembly Constituency |
| `part` | Part number |
| `booth` | Booth name/location |
| `phoneNumber` | Voter's phone number |
| `location.lat` | Latitude coordinate |
| `location.lng` | Longitude coordinate |
| `location.accuracy` | GPS accuracy in meters |
| `surveyor.name` | Name of surveyor who conducted survey |
| `members` | Array of family members |
| `membersCount` | Count of family members |

---

## Query Parameters

### Examples

#### Get All Completed Surveys (Default)
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Get Only Voter Collection Surveys
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?voterType=Voter" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Get Only VoterFour Collection Surveys
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?voterType=VoterFour" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Exclude Family Members (Smaller Response)
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?includeMembers=false" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Limit to First 500 Surveys
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?limit=500" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

#### Get All Statuses (Not Just Completed)
```bash
# Get submitted surveys
curl "http://localhost:3000/api/subadmin/voters/map-data?status=submitted" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"

# Get verified surveys
curl "http://localhost:3000/api/subadmin/voters/map-data?status=verified" \
  -H "Authorization: Bearer SUB_ADMIN_JWT_TOKEN"
```

---

## Map Integration Examples

### Google Maps Integration

```javascript
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import axios from 'axios';

function SubAdminSurveyMap() {
  const [mapData, setMapData] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);

  // Load map data
  const loadMapData = async () => {
    try {
      const token = localStorage.getItem('subAdminToken');
      const response = await axios.get('/api/subadmin/voters/map-data', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          voterType: 'all',
          status: 'completed',
          includeMembers: true,
          limit: 1000
        }
      });
      
      setMapData(response.data.data);
      console.log(`Loaded ${response.data.data.length} surveys for map`);
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  // Calculate map center from all points
  const getMapCenter = () => {
    if (mapData.length === 0) return { lat: 18.5204, lng: 73.8567 }; // Default: Pune
    
    const avgLat = mapData.reduce((sum, point) => sum + point.location.lat, 0) / mapData.length;
    const avgLng = mapData.reduce((sum, point) => sum + point.location.lng, 0) / mapData.length;
    
    return { lat: avgLat, lng: avgLng };
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={getMapCenter()}
        zoom={12}
        onLoad={setMap}
      >
        {/* Use MarkerClusterer for grouping nearby markers */}
        <MarkerClusterer>
          {(clusterer) =>
            mapData.map((point) => (
              <Marker
                key={point.surveyId}
                position={{ lat: point.location.lat, lng: point.location.lng }}
                onClick={() => setSelectedMarker(point)}
                clusterer={clusterer}
                label={{
                  text: point.membersCount > 0 ? `${point.membersCount + 1}` : '',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            ))
          }
        </MarkerClusterer>

        {/* Info Window for selected marker */}
        {selectedMarker && (
          <InfoWindow
            position={{ 
              lat: selectedMarker.location.lat, 
              lng: selectedMarker.location.lng 
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ maxWidth: '300px' }}>
              <h3>{selectedMarker.voterName}</h3>
              <p><strong>Phone:</strong> {selectedMarker.phoneNumber}</p>
              <p><strong>AC:</strong> {selectedMarker.ac} | <strong>Part:</strong> {selectedMarker.part}</p>
              <p><strong>Booth:</strong> {selectedMarker.booth}</p>
              <p><strong>Surveyor:</strong> {selectedMarker.surveyor.name}</p>
              <p><strong>Completed:</strong> {new Date(selectedMarker.completedAt).toLocaleDateString()}</p>
              
              {selectedMarker.members && selectedMarker.members.length > 0 && (
                <>
                  <h4>Family Members ({selectedMarker.membersCount}):</h4>
                  <ul>
                    {selectedMarker.members.map((member, idx) => (
                      <li key={idx}>
                        {member.name} ({member.age} years) - {member.relationship}
                        {member.isVoter && ' ✅ Voter'}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Stats Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      }}>
        <h3>Survey Stats</h3>
        <p><strong>Total Surveys:</strong> {mapData.length}</p>
        <p><strong>Total People:</strong> {
          mapData.reduce((sum, p) => sum + p.membersCount + 1, 0)
        }</p>
      </div>
    </div>
  );
}

export default SubAdminSurveyMap;
```

---

### Leaflet Integration

```javascript
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import axios from 'axios';
import L from 'leaflet';

function SubAdminLeafletMap() {
  const [mapData, setMapData] = useState([]);

  const loadMapData = async () => {
    const token = localStorage.getItem('subAdminToken');
    const response = await axios.get('/api/subadmin/voters/map-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMapData(response.data.data);
  };

  useEffect(() => {
    loadMapData();
  }, []);

  // Custom icon with member count
  const createCustomIcon = (membersCount) => {
    const color = membersCount > 3 ? 'red' : membersCount > 0 ? 'orange' : 'blue';
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white;">
        ${membersCount > 0 ? membersCount + 1 : '1'}
      </div>`,
      iconSize: [30, 30]
    });
  };

  return (
    <MapContainer 
      center={[18.5204, 73.8567]} 
      zoom={12} 
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      <MarkerClusterGroup>
        {mapData.map((point) => (
          <Marker
            key={point.surveyId}
            position={[point.location.lat, point.location.lng]}
            icon={createCustomIcon(point.membersCount)}
          >
            <Popup maxWidth={300}>
              <div>
                <h3>{point.voterName}</h3>
                <p><strong>📞 Phone:</strong> {point.phoneNumber}</p>
                <p><strong>🏛️ AC:</strong> {point.ac} | <strong>Part:</strong> {point.part}</p>
                <p><strong>📍 Booth:</strong> {point.booth}</p>
                <p><strong>👤 Surveyor:</strong> {point.surveyor.name}</p>
                <p><strong>📅 Completed:</strong> {new Date(point.completedAt).toLocaleDateString()}</p>
                
                {point.members && point.members.length > 0 && (
                  <>
                    <hr />
                    <h4>👨‍👩‍👧‍👦 Family ({point.membersCount}):</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {point.members.map((member, idx) => (
                        <li key={idx}>
                          <strong>{member.name}</strong> ({member.age})
                          {member.isVoter && ' ✅'}
                          <br />
                          <small>{member.relationship} | {member.phoneNumber}</small>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

export default SubAdminLeafletMap;
```

---

## Grouping Strategies

### Group by Location Proximity

```javascript
// Group surveys that are close to each other (within 50 meters)
function groupByProximity(mapData, radiusMeters = 50) {
  const groups = [];
  const processed = new Set();

  mapData.forEach((point, index) => {
    if (processed.has(index)) return;

    const group = {
      center: point.location,
      surveys: [point],
      totalPeople: 1 + point.membersCount
    };

    // Find nearby surveys
    mapData.forEach((otherPoint, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex)) return;

      const distance = calculateDistance(
        point.location.lat, point.location.lng,
        otherPoint.location.lat, otherPoint.location.lng
      );

      if (distance <= radiusMeters) {
        group.surveys.push(otherPoint);
        group.totalPeople += 1 + otherPoint.membersCount;
        processed.add(otherIndex);
      }
    });

    processed.add(index);
    groups.push(group);
  });

  return groups;
}

// Haversine formula to calculate distance between coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Usage
const groups = groupByProximity(mapData, 50);
console.log(`Grouped ${mapData.length} surveys into ${groups.length} clusters`);
```

### Group by AC and Part

```javascript
function groupByACAndPart(mapData) {
  const groups = {};

  mapData.forEach(point => {
    const key = `AC${point.ac}-Part${point.part}`;
    
    if (!groups[key]) {
      groups[key] = {
        ac: point.ac,
        part: point.part,
        surveys: [],
        totalPeople: 0
      };
    }

    groups[key].surveys.push(point);
    groups[key].totalPeople += 1 + point.membersCount;
  });

  return Object.values(groups);
}

// Usage
const acPartGroups = groupByACAndPart(mapData);
console.log('Groups by AC/Part:', acPartGroups);
```

### Group by Booth

```javascript
function groupByBooth(mapData) {
  const groups = {};

  mapData.forEach(point => {
    const booth = point.booth || 'Unknown Booth';
    
    if (!groups[booth]) {
      groups[booth] = {
        booth: booth,
        ac: point.ac,
        surveys: [],
        totalPeople: 0,
        avgLocation: { lat: 0, lng: 0 }
      };
    }

    groups[booth].surveys.push(point);
    groups[booth].totalPeople += 1 + point.membersCount;
  });

  // Calculate average location for each booth
  Object.keys(groups).forEach(booth => {
    const group = groups[booth];
    group.avgLocation.lat = group.surveys.reduce((sum, s) => sum + s.location.lat, 0) / group.surveys.length;
    group.avgLocation.lng = group.surveys.reduce((sum, s) => sum + s.location.lng, 0) / group.surveys.length;
  });

  return Object.values(groups);
}

// Usage
const boothGroups = groupByBooth(mapData);
console.log('Groups by Booth:', boothGroups);
```

---

## Frontend Implementation

### Complete Map Component with Grouping

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

function SubAdminGroupedMap() {
  const [mapData, setMapData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupingMethod, setGroupingMethod] = useState('proximity'); // proximity, ac, booth
  const [stats, setStats] = useState({});

  const loadData = async () => {
    const token = localStorage.getItem('subAdminToken');
    const response = await axios.get('/api/subadmin/voters/map-data', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setMapData(response.data.data);
    setStats(response.data.meta);
    
    // Default grouping
    applyGrouping(response.data.data, 'proximity');
  };

  const applyGrouping = (data, method) => {
    let grouped = [];
    
    switch(method) {
      case 'proximity':
        grouped = groupByProximity(data, 50);
        break;
      case 'ac':
        grouped = groupByACAndPart(data);
        break;
      case 'booth':
        grouped = groupByBooth(data);
        break;
      default:
        grouped = data.map(d => ({ surveys: [d], totalPeople: 1 + d.membersCount }));
    }
    
    setGroups(grouped);
    setGroupingMethod(method);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Color based on group size
  const getGroupColor = (totalPeople) => {
    if (totalPeople > 10) return 'red';
    if (totalPeople > 5) return 'orange';
    if (totalPeople > 2) return 'yellow';
    return 'green';
  };

  // Radius based on group size
  const getGroupRadius = (totalPeople) => {
    return Math.min(5 + totalPeople * 2, 30);
  };

  return (
    <div>
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <h3>Survey Map - Grouping</h3>
        
        <div>
          <strong>Grouping Method:</strong>
          <select 
            value={groupingMethod} 
            onChange={(e) => applyGrouping(mapData, e.target.value)}
          >
            <option value="proximity">By Location (50m)</option>
            <option value="ac">By AC & Part</option>
            <option value="booth">By Booth</option>
            <option value="none">No Grouping</option>
          </select>
        </div>

        <div style={{ marginTop: '10px' }}>
          <strong>Stats:</strong>
          <p>Total Surveys: {stats.totalSurveys}</p>
          <p>Groups: {groups.length}</p>
          <p>Avg per Group: {stats.totalSurveys > 0 ? (stats.totalSurveys / groups.length).toFixed(1) : 0}</p>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={12}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {groups.map((group, idx) => {
          const center = group.center || group.avgLocation || group.surveys[0].location;
          
          return (
            <CircleMarker
              key={idx}
              center={[center.lat, center.lng]}
              radius={getGroupRadius(group.totalPeople)}
              fillColor={getGroupColor(group.totalPeople)}
              color="white"
              weight={2}
              fillOpacity={0.7}
            >
              <Popup maxWidth={400}>
                <div>
                  <h3>Group of {group.surveys.length} Surveys</h3>
                  <p><strong>Total People:</strong> {group.totalPeople}</p>
                  
                  {group.ac && <p><strong>AC:</strong> {group.ac}</p>}
                  {group.part && <p><strong>Part:</strong> {group.part}</p>}
                  {group.booth && <p><strong>Booth:</strong> {group.booth}</p>}
                  
                  <h4>Surveys in Group:</h4>
                  <ul style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {group.surveys.map(survey => (
                      <li key={survey.surveyId}>
                        <strong>{survey.voterName}</strong>
                        {survey.membersCount > 0 && ` (+${survey.membersCount} members)`}
                        <br />
                        <small>{survey.phoneNumber}</small>
                      </li>
                    ))}
                  </ul>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default SubAdminGroupedMap;
```

---

## Request Examples

### Basic Request
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Filter by Voter Type
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?voterType=VoterFour&includeMembers=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Limit Results
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?limit=500" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Without Members (Lighter Response)
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?includeMembers=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## JavaScript/Axios Examples

```javascript
const axios = require('axios');

// Get map data for sub-admin
async function getSubAdminMapData(token, options = {}) {
  const {
    voterType = 'all',
    status = 'completed',
    includeMembers = true,
    limit = 1000
  } = options;

  try {
    const response = await axios.get('/api/subadmin/voters/map-data', {
      headers: { Authorization: `Bearer ${token}` },
      params: { voterType, status, includeMembers, limit }
    });

    console.log(`Loaded ${response.data.data.length} surveys`);
    console.log(`Total people: ${calculateTotalPeople(response.data.data)}`);
    
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data);
    throw error;
  }
}

// Calculate total people (voters + members)
function calculateTotalPeople(mapData) {
  return mapData.reduce((sum, point) => sum + 1 + point.membersCount, 0);
}

// Group by household size
function groupByHouseholdSize(mapData) {
  const groups = {
    single: [],      // 1 person
    small: [],       // 2-3 people
    medium: [],      // 4-6 people
    large: []        // 7+ people
  };

  mapData.forEach(point => {
    const householdSize = 1 + point.membersCount;
    
    if (householdSize === 1) groups.single.push(point);
    else if (householdSize <= 3) groups.small.push(point);
    else if (householdSize <= 6) groups.medium.push(point);
    else groups.large.push(point);
  });

  return groups;
}

// Usage
const token = 'YOUR_SUB_ADMIN_TOKEN';
const mapData = await getSubAdminMapData(token, {
  voterType: 'all',
  includeMembers: true,
  limit: 1000
});

const householdGroups = groupByHouseholdSize(mapData);
console.log('Single-person households:', householdGroups.single.length);
console.log('Large families (7+):', householdGroups.large.length);
```

---

## Statistics & Analysis

### Calculate Coverage Statistics

```javascript
async function getSubAdminCoverageStats(token) {
  // Get total assigned voters
  const assignedResponse = await axios.get('/api/subadmin/voters/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Get completed surveys with location
  const mapResponse = await axios.get('/api/subadmin/voters/map-data', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const stats = {
    totalAssignedVoters: assignedResponse.data.data.totalVoters,
    completedSurveys: mapResponse.data.meta.totalSurveys,
    surveysWithLocation: mapResponse.data.meta.surveysWithLocation,
    coveragePercentage: (
      (mapResponse.data.meta.totalSurveys / assignedResponse.data.data.totalVoters) * 100
    ).toFixed(2),
    totalPeople: calculateTotalPeople(mapResponse.data.data),
    avgHouseholdSize: (
      calculateTotalPeople(mapResponse.data.data) / mapResponse.data.data.length
    ).toFixed(2)
  };

  console.log('Coverage Stats:', stats);
  return stats;
}
```

---

## Use Cases

### Use Case 1: Daily Coverage Map

**Show today's completed surveys on map:**

```javascript
// Get map data
const mapData = await axios.get('/api/subadmin/voters/map-data', {
  headers: { Authorization: `Bearer ${token}` },
  params: { status: 'completed', includeMembers: true }
});

// Filter for today's surveys
const today = new Date().toDateString();
const todaysSurveys = mapData.data.data.filter(point => 
  new Date(point.completedAt).toDateString() === today
);

console.log(`Today's completed surveys: ${todaysSurveys.length}`);
```

### Use Case 2: Family Cluster Analysis

**Find areas with large families:**

```javascript
const mapData = await getSubAdminMapData(token, { includeMembers: true });

// Find large families
const largeFamilies = mapData.filter(point => point.membersCount >= 5);

// Group by location
const groups = groupByProximity(largeFamilies, 100);

console.log(`Found ${largeFamilies.length} large families in ${groups.length} areas`);
```

### Use Case 3: Coverage Heatmap

**Generate heatmap data for coverage visualization:**

```javascript
const mapData = await getSubAdminMapData(token);

// Create heatmap points
const heatmapData = mapData.map(point => ({
  location: new google.maps.LatLng(point.location.lat, point.location.lng),
  weight: 1 + point.membersCount // Weight by household size
}));

// Use with Google Maps Heatmap Layer
const heatmap = new google.maps.visualization.HeatmapLayer({
  data: heatmapData,
  radius: 30
});
```

---

## Response Examples

### Example 1: Small Response (No Members)
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?includeMembers=false&limit=2" \
  -H "Authorization: Bearer TOKEN"
```

```json
{
  "success": true,
  "data": [
    {
      "surveyId": "68df79494f84cb7c158050d9",
      "voterId": "68dd9a8c90752b2d27b79da9",
      "voterType": "Voter",
      "voterName": "Arati Jagtap",
      "phoneNumber": "8888888888",
      "location": {
        "lat": 18.6232198,
        "lng": 73.7119472,
        "accuracy": 34.214
      },
      "members": [],
      "membersCount": 0
    }
  ],
  "meta": {
    "totalVoters": 150,
    "totalSurveys": 2,
    "surveysWithLocation": 2
  }
}
```

### Example 2: With Members
```bash
curl "http://localhost:3000/api/subadmin/voters/map-data?includeMembers=true&limit=1" \
  -H "Authorization: Bearer TOKEN"
```

```json
{
  "success": true,
  "data": [
    {
      "surveyId": "68df79494f84cb7c158050d9",
      "voterName": "Arati Jagtap",
      "phoneNumber": "8888888888",
      "location": {
        "lat": 18.6232198,
        "lng": 73.7119472
      },
      "members": [
        {
          "name": "Aarti Suresh Khandave",
          "age": 38,
          "phoneNumber": "5555555555",
          "relationship": "Family Member",
          "isVoter": true,
          "voterId": "68dd9a8090752b2d27b779d1",
          "voterType": "Voter"
        }
      ],
      "membersCount": 1
    }
  ]
}
```

---

## Error Handling

### Common Errors

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "No token provided" 
}
```

**403 - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Error fetching assigned voters map data",
  "error": "Error details..."
}
```

---

## Performance Tips

1. **Use `includeMembers=false`** for faster loading if members not needed
2. **Set appropriate `limit`** - Don't load all surveys at once
3. **Filter by `voterType`** if you only need one collection
4. **Group on frontend** - Reduce server load by grouping client-side
5. **Cache results** - Map data doesn't change frequently

---

## Testing Commands

```bash
# Test 1: Basic map data
curl "http://localhost:3000/api/subadmin/voters/map-data" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test 2: Without members
curl "http://localhost:3000/api/subadmin/voters/map-data?includeMembers=false" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test 3: Voter type filter
curl "http://localhost:3000/api/subadmin/voters/map-data?voterType=Voter" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test 4: Limited results
curl "http://localhost:3000/api/subadmin/voters/map-data?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Quick Reference

### Endpoint
```
GET /api/subadmin/voters/map-data
```

### Parameters
- `voterType` - 'all', 'Voter', 'VoterFour' (default: 'all')
- `status` - Survey status (default: 'completed')
- `includeMembers` - Include family members (default: 'true')
- `limit` - Max surveys (default: 1000)

### Response Fields
- `surveyId` - Survey ID
- `voterId` - Voter ID
- `voterName` - Voter name (English)
- `phoneNumber` - Phone number
- `location` - { lat, lng, accuracy }
- `members` - Array of family members
- `membersCount` - Count of members
- `surveyor` - Surveyor info
- `ac`, `part`, `booth` - Location details

---

**Version:** 1.0.0  
**Last Updated:** October 9, 2025  
**Status:** ✅ Production Ready  

Sub-admins can now view their assigned voters' completed surveys on a map with full household details for better field planning! 🗺️🎉

