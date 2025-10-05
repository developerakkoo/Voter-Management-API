# Alert API with Image Upload and Link Management

## Overview
The Alert API provides a comprehensive system for creating, managing, and publishing alerts with multiple image uploads, links, and advanced filtering capabilities.

## Alert Model Features

### Core Fields
- `title` - Alert title (required, max 200 chars)
- `description` - Alert description (max 1000 chars)
- `images` - Array of uploaded images with metadata
- `link` - Object with URL and display text
- `priority` - Alert priority (low, medium, high, urgent)
- `category` - Alert category (default: general)
- `targetAudience` - Target audience (all, admins, subadmins, voters)
- `tags` - Array of tags for categorization
- `metadata` - Additional metadata object

### Status Fields
- `isActive` - Alert active status
- `isPublished` - Alert published status
- `publishedAt` - Publication timestamp
- `expiresAt` - Expiration timestamp
- `viewCount` - View count tracking

### Audit Fields
- `createdBy` - Creator reference
- `lastUpdatedBy` - Last updater reference
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## API Endpoints

### 1. Public Endpoints (No Authentication Required)

#### Get Published Alerts
```bash
GET /api/alert/published
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `targetAudience` - Filter by target audience
- `priority` - Filter by priority
- `category` - Filter by category
- `search` - Search in title, description, tags
- `sortBy` - Sort field (default: 'publishedAt')
- `sortOrder` - Sort order (asc/desc, default: desc)

**Example:**
```bash
GET /api/alert/published?targetAudience=voters&priority=high&search=urgent&page=1&limit=10
```

#### Get Alert Statistics
```bash
GET /api/alert/stats
```

### 2. SubAdmin Endpoints (SubAdmin Authentication Required)

**Important**: All protected alert endpoints now require **SubAdmin authentication only**. Admin tokens are no longer accepted for alert operations.

#### Get All Alerts
```bash
GET /api/alert
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)
- `isActive` - Filter by active status
- `isPublished` - Filter by published status
- `priority` - Filter by priority
- `category` - Filter by category
- `targetAudience` - Filter by target audience
- `search` - Search in title, description, tags
- `sortBy` - Sort field (default: 'createdAt')
- `sortOrder` - Sort order (asc/desc, default: desc)

#### Get Alert by ID
```bash
GET /api/alert/:id
```

#### Create Alert
```bash
POST /api/alert
Authorization: Bearer SUBADMIN_JWT_TOKEN
Content-Type: application/json

{
  "title": "Important Announcement",
  "description": "This is an important announcement for all users",
  "link": {
    "url": "https://example.com/details",
    "text": "View Details"
  },
  "priority": "high",
  "category": "announcement",
  "targetAudience": "all",
  "tags": ["urgent", "announcement"],
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "metadata": {
    "source": "admin",
    "department": "communications"
  }
}
```

#### Update Alert
```bash
PUT /api/alert/:id
Authorization: Bearer SUBADMIN_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Alert Title",
  "description": "Updated description",
  "priority": "urgent",
  "isActive": true
}
```

#### Delete Alert
```bash
DELETE /api/alert/:id
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

#### Delete All Alerts (Admin Only)
```bash
DELETE /api/alert
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

### 3. Image Management

#### Upload Images to Alert
```bash
POST /api/alert/:id/images
Authorization: Bearer SUBADMIN_JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- images: [file1, file2, file3] (multiple image files)
```

**Supported Image Types:**
- JPEG, JPG, PNG, GIF, WebP
- Maximum 5MB per image
- Maximum 10 images per alert

#### Delete Specific Image
```bash
DELETE /api/alert/:id/images/:imageId
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

#### Image Upload Response Example
```json
{
  "success": true,
  "message": "Successfully uploaded 3 images",
  "data": {
    "alertId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "images": [
      {
        "filename": "alert-1759650040123-456789.jpg",
        "originalName": "election-photo1.jpg",
        "path": "./uploads/alerts/alert-1759650040123-456789.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
        "uploadedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "filename": "alert-1759650040124-456790.png",
        "originalName": "candidate-info.png",
        "path": "./uploads/alerts/alert-1759650040124-456790.png",
        "size": 2048000,
        "mimetype": "image/png",
        "uploadedAt": "2024-01-15T10:30:01.000Z"
      }
    ],
    "totalImages": 3
  }
}
```

#### Image Delete Response Example
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "alertId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "remainingImages": 2
  }
}
```

### 4. Publishing Management

#### Publish Alert
```bash
PATCH /api/alert/:id/publish
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

#### Unpublish Alert
```bash
PATCH /api/alert/:id/unpublish
Authorization: Bearer SUBADMIN_JWT_TOKEN
```

## Example Usage Scenarios

### 1. Create Alert with Images
```bash
# Step 1: Create alert
POST /api/alert
{
  "title": "Election Update",
  "description": "Important election information",
  "priority": "high",
  "targetAudience": "voters",
  "tags": ["election", "update"]
}

# Step 2: Upload images
POST /api/alert/64f8a1b2c3d4e5f6a7b8c9d0/images
# Upload multiple image files

# Step 3: Publish alert
PATCH /api/alert/64f8a1b2c3d4e5f6a7b8c9d0/publish
```

### 2. Search Published Alerts
```bash
# Search for urgent alerts for voters
GET /api/alert/published?targetAudience=voters&priority=urgent&search=election
```

### 3. Get Alert Statistics
```bash
GET /api/alert/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAlerts": 50,
    "publishedAlerts": 35,
    "activeAlerts": 45,
    "priorityStats": [
      { "_id": "high", "count": 20 },
      { "_id": "medium", "count": 15 },
      { "_id": "low", "count": 10 }
    ],
    "categoryStats": [
      { "_id": "announcement", "count": 25 },
      { "_id": "update", "count": 15 },
      { "_id": "urgent", "count": 10 }
    ],
    "recentAlerts": [...]
  }
}
```

## Response Formats

### Alert Object
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "title": "Important Announcement",
  "description": "This is an important announcement",
  "images": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "filename": "alert-1234567890-123456789.jpg",
      "originalName": "announcement.jpg",
      "path": "./uploads/alerts/alert-1234567890-123456789.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "link": {
    "url": "https://example.com/details",
    "text": "View Details"
  },
  "priority": "high",
  "category": "announcement",
  "targetAudience": "all",
  "isActive": true,
  "isPublished": true,
  "publishedAt": "2024-01-15T10:30:00.000Z",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "viewCount": 150,
  "tags": ["urgent", "announcement"],
  "createdBy": "64f8a1b2c3d4e5f6a7b8c9d2",
  "lastUpdatedBy": "64f8a1b2c3d4e5f6a7b8c9d2",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
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

## Advanced Features

### 1. Comprehensive Image Management

#### **Multiple Image Upload**
- Upload up to **10 images per alert** in a single request
- Support for **multiple file types** in one upload session
- **Batch processing** for efficient handling of multiple files

#### **Image File Support**
- **Supported Formats**: JPEG, JPG, PNG, GIF, WebP
- **File Size Limit**: Maximum 5MB per image
- **Total Images**: Maximum 10 images per alert
- **File Validation**: Automatic validation of file type and size

#### **Image Metadata Tracking**
- **Unique Filename**: Auto-generated unique filenames with timestamps
- **Original Name**: Preserves original filename for reference
- **File Path**: Complete file system path for serving images
- **File Size**: Tracks file size in bytes
- **MIME Type**: Records file MIME type
- **Upload Timestamp**: Records when image was uploaded

#### **File Storage**
- **Storage Location**: `./uploads/alerts/` directory
- **File Naming**: `alert-{timestamp}-{random}.{extension}` format
- **Directory Creation**: Automatic directory creation if not exists
- **File Organization**: Organized by alert creation date

#### **Image Operations**
- **Upload Images**: `POST /api/alert/:id/images`
- **Delete Specific Image**: `DELETE /api/alert/:id/images/:imageId`
- **View All Images**: Included in alert GET responses
- **Image Count**: Virtual field `imageCount` for easy access

#### **Error Handling**
- **File Type Validation**: Rejects non-image files
- **Size Validation**: Rejects files exceeding 5MB
- **Upload Limits**: Prevents exceeding 10 images per alert
- **File System Errors**: Handles disk space and permission issues

#### **Automatic Cleanup**
- **Alert Deletion**: All images automatically deleted when alert is deleted
- **Image Deletion**: Physical files removed from disk when image is deleted
- **Orphaned File Prevention**: No orphaned files left on server

### 2. Link Management
- **URL Validation**: Validates HTTP/HTTPS URLs
- **Display Text**: Customizable link text
- **Optional Links**: Links are optional

### 3. Publishing System
- **Draft/Published**: Alerts can be drafts or published
- **Publication Date**: Track when alert was published
- **Expiration**: Set expiration dates for alerts
- **View Tracking**: Track how many times alert was viewed

### 4. Targeting System
- **Audience Targeting**: Target specific user groups
- **Priority Levels**: low, medium, high, urgent
- **Categories**: Organize alerts by category
- **Tags**: Flexible tagging system

### 5. Search and Filtering
- **Text Search**: Search across title, description, tags
- **Multi-criteria Filtering**: Filter by multiple criteria
- **Sorting**: Sort by any field with asc/desc order
- **Pagination**: Efficient handling of large datasets

## Security Features

### 1. Authentication
- **JWT Tokens**: Secure authentication for protected endpoints
- **Role-based Access**: Different access levels for admin/subadmin
- **Public Endpoints**: Some endpoints accessible without authentication

### 2. File Security
- **File Type Validation**: Only image files allowed
- **Size Limits**: Prevent large file uploads
- **Path Security**: Secure file storage paths
- **Automatic Cleanup**: Remove files when alerts are deleted

### 3. Data Validation
- **Input Validation**: Validate all input data
- **URL Validation**: Validate link URLs
- **File Validation**: Validate uploaded files
- **Schema Validation**: MongoDB schema validation

## Error Handling

- **400 Bad Request**: Invalid data or validation errors
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Access denied
- **404 Not Found**: Alert or image not found
- **413 Payload Too Large**: File too large
- **500 Internal Server Error**: Database or server errors

## Image Upload Usage Examples

### 1. Frontend Implementation (JavaScript/TypeScript)

#### **Upload Images with Progress**
```javascript
// Upload multiple images to an alert
async function uploadAlertImages(alertId, imageFiles) {
  const formData = new FormData();
  
  // Add multiple image files
  imageFiles.forEach((file, index) => {
    formData.append('images', file);
  });
  
  try {
    const response = await fetch(`/api/alert/${alertId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${subAdminToken}`
        // Don't set Content-Type for FormData - browser sets it automatically
      },
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`Uploaded ${result.data.images.length} images`);
      console.log('Total images in alert:', result.data.totalImages);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Usage example
const imageFiles = document.getElementById('imageInput').files;
uploadAlertImages('64f8a1b2c3d4e5f6a7b8c9d0', imageFiles);
```

#### **Delete Specific Image**
```javascript
async function deleteAlertImage(alertId, imageId) {
  try {
    const response = await fetch(`/api/alert/${alertId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${subAdminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Image deleted successfully');
      console.log('Remaining images:', result.data.remainingImages);
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}
```

### 2. cURL Examples

#### **Upload Images**
```bash
# Upload multiple images to an alert
curl -X POST https://voter.myserverdevops.com/api/alert/64f8a1b2c3d4e5f6a7b8c9d0/images \
  -H "Authorization: Bearer SUBADMIN_JWT_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png" \
  -F "images=@/path/to/image3.gif"
```

#### **Delete Image**
```bash
# Delete specific image from alert
curl -X DELETE https://voter.myserverdevops.com/api/alert/64f8a1b2c3d4e5f6a7b8c9d0/images/64f8a1b2c3d4e5f6a7b8c9d1 \
  -H "Authorization: Bearer SUBADMIN_JWT_TOKEN"
```

### 3. React/Next.js Implementation

#### **Image Upload Component**
```jsx
import React, { useState } from 'react';

const ImageUpload = ({ alertId, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    if (files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) alert(`${file.name} is not a valid image type`);
      if (!isValidSize) alert(`${file.name} is too large (max 5MB)`);
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/alert/${alertId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('subAdminToken')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setProgress(100);
        onUpload(result.data);
        alert(`Successfully uploaded ${result.data.images.length} images`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      
      {uploading && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
          <span>Uploading... {progress}%</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
```

### 4. Error Handling Examples

#### **Handle Upload Errors**
```javascript
const handleImageUpload = async (alertId, files) => {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await fetch(`/api/alert/${alertId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(`Upload error: ${error.message}`);
        case 401:
          throw new Error('Authentication required - please login again');
        case 413:
          throw new Error('File too large - maximum 5MB per image');
        case 404:
          throw new Error('Alert not found');
        default:
          throw new Error(`Upload failed: ${error.message}`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};
```

## Use Cases

### 1. Election Announcements
- Create alerts for election updates
- Upload images of candidates or voting information
- Target specific voter groups
- Set expiration dates for time-sensitive information

### 2. Campaign Updates
- Share campaign progress with images
- Notify about upcoming events
- Provide links to detailed information
- Track engagement through view counts

### 3. Administrative Notices
- Send important notices to sub admins
- Share policy updates with images
- Provide links to detailed documents
- Organize by priority and category

### 4. Public Information
- Share public announcements
- Provide voter education materials
- Share election results with images
- Maintain public information archive
