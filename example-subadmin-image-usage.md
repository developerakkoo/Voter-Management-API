# SubAdmin API with Location Image Upload

## Overview
The SubAdmin API has been enhanced to support location image uploads using multer. The API now handles image uploads, stores image metadata, and provides hosted image URLs for easy access.

## Updated Features

### 1. Image Upload Support
- **File Upload**: Upload location images via multipart/form-data
- **Image Validation**: Only image files (JPEG, JPG, PNG, GIF, WebP) allowed
- **Size Limits**: Maximum 5MB per image
- **Automatic Storage**: Images stored in `./uploads/subadmin/location-images/`
- **URL Generation**: Automatic hosted image URL generation

### 2. Enhanced Location Image Structure
The `locationImage` field now stores comprehensive image metadata:

```json
{
  "locationImage": {
    "filename": "subadmin-location-1234567890-123456789.jpg",
    "originalName": "office-location.jpg",
    "path": "./uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg",
    "url": "http://localhost:3000/uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg",
    "size": 1024000,
    "mimetype": "image/jpeg",
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## API Endpoints

### 1. Create SubAdmin with Image Upload

```bash
POST /api/subadmin
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- fullName: "John Doe"
- userId: "johndoe"
- password: "password123"
- locationName: "Downtown Office"
- locationImage: [image file]
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/subadmin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "fullName=John Doe" \
  -F "userId=johndoe" \
  -F "password=password123" \
  -F "locationName=Downtown Office" \
  -F "locationImage=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Sub admin created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fullName": "John Doe",
    "userId": "johndoe",
    "locationName": "Downtown Office",
    "locationImage": {
      "filename": "subadmin-location-1234567890-123456789.jpg",
      "originalName": "office-location.jpg",
      "path": "./uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg",
      "url": "http://localhost:3000/uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Update SubAdmin with Image Upload

```bash
PUT /api/subadmin/:id
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data

Form Data:
- fullName: "John Doe Updated"
- locationName: "New Downtown Office"
- locationImage: [new image file]
```

**Example using curl:**
```bash
curl -X PUT http://localhost:3000/api/subadmin/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "fullName=John Doe Updated" \
  -F "locationName=New Downtown Office" \
  -F "locationImage=@/path/to/new-image.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Sub admin updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fullName": "John Doe Updated",
    "userId": "johndoe",
    "locationName": "New Downtown Office",
    "locationImage": {
      "filename": "subadmin-location-1234567891-123456790.jpg",
      "originalName": "new-office-location.jpg",
      "path": "./uploads/subadmin/location-images/subadmin-location-1234567891-123456790.jpg",
      "url": "http://localhost:3000/uploads/subadmin/location-images/subadmin-location-1234567891-123456790.jpg",
      "size": 2048000,
      "mimetype": "image/jpeg",
      "uploadedAt": "2024-01-15T11:30:00.000Z"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

### 3. Get SubAdmin with Image URL

```bash
GET /api/subadmin/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fullName": "John Doe",
    "userId": "johndoe",
    "locationName": "Downtown Office",
    "locationImage": {
      "filename": "subadmin-location-1234567890-123456789.jpg",
      "originalName": "office-location.jpg",
      "path": "./uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg",
      "url": "http://localhost:3000/uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "uploadedAt": "2024-01-15T10:30:00.000Z"
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Image Access

### 1. Direct Image URL Access
Images are automatically served via the static file middleware:

```
http://localhost:3000/uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg
```

### 2. Environment Configuration
Set the `BASE_URL` environment variable for production:

```bash
# .env file
BASE_URL=https://yourdomain.com
```

This will generate URLs like:
```
https://yourdomain.com/uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg
```

## File Management

### 1. Automatic File Cleanup
- **Update Operations**: Old images are automatically deleted when new images are uploaded
- **Delete Operations**: Images are deleted when sub admins are deleted
- **Bulk Delete**: All images are cleaned up when deleting all sub admins

### 2. File Storage Structure
```
uploads/
└── subadmin/
    └── location-images/
        ├── subadmin-location-1234567890-123456789.jpg
        ├── subadmin-location-1234567891-123456790.jpg
        └── subadmin-location-1234567892-123456791.jpg
```

### 3. File Naming Convention
- **Prefix**: `subadmin-location-`
- **Timestamp**: Current timestamp
- **Random**: Random number for uniqueness
- **Extension**: Original file extension

## Error Handling

### 1. Image Upload Errors
```json
{
  "success": false,
  "message": "Image upload error",
  "error": "Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!"
}
```

### 2. File Size Errors
```json
{
  "success": false,
  "message": "Image upload error",
  "error": "File too large"
}
```

### 3. Validation Errors
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Full name, user ID, password, and location name are required"
  ]
}
```

## Security Features

### 1. File Type Validation
- **Allowed Types**: JPEG, JPG, PNG, GIF, WebP
- **MIME Type Check**: Validates both file extension and MIME type
- **Rejection**: Non-image files are automatically rejected

### 2. File Size Limits
- **Maximum Size**: 5MB per image
- **Automatic Rejection**: Files exceeding size limit are rejected
- **Error Response**: Clear error messages for size violations

### 3. File Storage Security
- **Secure Paths**: Images stored in dedicated subdirectories
- **Unique Names**: Generated unique filenames prevent conflicts
- **Access Control**: Images accessible only via proper URLs

## Use Cases

### 1. Office Location Management
- Upload office building photos
- Store location images for identification
- Share location images with team members

### 2. Field Office Setup
- Upload field office photos
- Document office locations
- Track office setup progress

### 3. Location Verification
- Verify sub admin locations
- Document office conditions
- Maintain location records

## Best Practices

### 1. Image Optimization
- **Compress Images**: Optimize images before upload
- **Appropriate Sizes**: Use reasonable image dimensions
- **Format Selection**: Use appropriate image formats

### 2. File Management
- **Regular Cleanup**: Monitor storage usage
- **Backup Strategy**: Implement image backup procedures
- **Access Control**: Secure image access

### 3. Performance
- **CDN Integration**: Consider CDN for production
- **Caching**: Implement proper caching strategies
- **Load Balancing**: Distribute image serving load

## Production Considerations

### 1. Environment Variables
```bash
# .env file
BASE_URL=https://yourdomain.com
NODE_ENV=production
```

### 2. CDN Integration
For production, consider integrating with CDN services:
- AWS CloudFront
- Google Cloud CDN
- Azure CDN

### 3. Database Optimization
- **Indexing**: Ensure proper database indexing
- **Cleanup**: Regular cleanup of orphaned images
- **Monitoring**: Monitor storage usage

## Example Frontend Integration

### 1. HTML Form
```html
<form action="/api/subadmin" method="POST" enctype="multipart/form-data">
  <input type="text" name="fullName" placeholder="Full Name" required>
  <input type="text" name="userId" placeholder="User ID" required>
  <input type="password" name="password" placeholder="Password" required>
  <input type="text" name="locationName" placeholder="Location Name" required>
  <input type="file" name="locationImage" accept="image/*" required>
  <button type="submit">Create Sub Admin</button>
</form>
```

### 2. JavaScript Upload
```javascript
const formData = new FormData();
formData.append('fullName', 'John Doe');
formData.append('userId', 'johndoe');
formData.append('password', 'password123');
formData.append('locationName', 'Downtown Office');
formData.append('locationImage', fileInput.files[0]);

fetch('/api/subadmin', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### 3. Image Display
```html
<img src="http://localhost:3000/uploads/subadmin/location-images/subadmin-location-1234567890-123456789.jpg" 
     alt="Sub Admin Location" 
     style="max-width: 300px; height: auto;">
```

The SubAdmin API now provides comprehensive image upload functionality with automatic file management, URL generation, and secure access to uploaded images! 🎉
