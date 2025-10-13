# Voter Export API Guide

## Overview
This guide covers the voter export functionality that allows downloading all voter data from both Voter and VoterFour collections in Excel format for frontend Excel export functionality.

## 📊 Export Endpoints

### 1. Basic Export
**GET** `/api/voters/export`

Export all voters to Excel with various formatting options.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `voterType` | string | 'all' | 'all', 'voter', or 'voterFour' |
| `includeStats` | boolean | 'true' | Include statistics in export |
| `format` | string | 'combined' | 'combined', 'separate', or 'formatted' |

#### Export Formats

**Combined Format** (`format=combined`)
- Single Excel file with all voters from both collections
- Voter type column indicates source collection
- Most efficient for general use

**Separate Format** (`format=separate`)
- Multiple sheets in single Excel file
- Separate sheets for Voter and VoterFour collections
- Summary sheet with statistics (if includeStats=true)

**Formatted Format** (`format=formatted`)
- Single Excel file with enhanced formatting
- Auto-filters enabled for easy data manipulation
- Optimized column widths

#### Example Usage
```bash
# Export all voters in combined format
GET /api/voters/export

# Export only Voter collection
GET /api/voters/export?voterType=voter

# Export with separate sheets and statistics
GET /api/voters/export?format=separate&includeStats=true

# Export with enhanced formatting
GET /api/voters/export?format=formatted
```

### 2. Streaming Export
**GET** `/api/voters/export/stream`

Stream large voter datasets for export without memory issues.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `voterType` | string | 'all' | 'all', 'voter', or 'voterFour' |
| `batchSize` | number | 1000 | Records per batch |
| `format` | string | 'combined' | Export format |

#### Example Usage
```bash
# Stream export for large datasets
GET /api/voters/export/stream?batchSize=500

# Stream only VoterFour collection
GET /api/voters/export/stream?voterType=voterFour&batchSize=2000
```

### 3. Download Endpoint
**GET** `/api/voters/export/download/:filename`

Direct file download endpoint (currently redirects to export endpoint).

---

## 📋 Excel File Structure

### Column Headers
| Column | Description | Source |
|--------|-------------|---------|
| Voter Type | 'Voter' or 'VoterFour' | Auto-generated |
| Voter ID | MongoDB ObjectId | _id |
| Voter Name (English) | Voter Name Eng | Voter/VoterFour |
| Voter Name (Hindi) | Voter Name | Voter/VoterFour |
| Relative Name (English) | Relative Name Eng | Voter/VoterFour |
| Relative Name (Hindi) | Relative Name | Voter/VoterFour |
| Gender | Sex | Voter/VoterFour |
| Age | Age | Voter/VoterFour |
| Card Number | CardNo | Voter/VoterFour |
| Code Number | CodeNo | VoterFour only |
| Part Number | pno | Voter/VoterFour |
| Assembly Constituency | AC | Voter/VoterFour |
| Part | Part | Voter only |
| Serial Number | Sr No / Sr no | Voter/VoterFour |
| House Number | House No | Voter only |
| Address (Hindi) | Address | Voter/VoterFour |
| Address (English) | Address Eng | Voter/VoterFour |
| Booth Number | Booth no | VoterFour only |
| Booth Name (Hindi) | Booth | Voter/VoterFour |
| Booth Name (English) | Booth Eng | Voter/VoterFour |
| Status | Status | Voter/VoterFour |
| Is Paid | isPaid | Voter/VoterFour |
| Is Visited | isVisited | Voter/VoterFour |
| Is Active | isActive | Voter/VoterFour |
| Created At | createdAt | Voter/VoterFour |
| Updated At | updatedAt | Voter/VoterFour |

### Multi-Sheet Structure (Separate Format)
1. **All Voters Sheet** - Combined data from both collections
2. **VoterFour Sheet** - Only VoterFour collection data
3. **Summary Sheet** - Statistics and metadata

---

## 🚀 Frontend Implementation

### React Component Example
```javascript
import React, { useState } from 'react';

const VoterExportComponent = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    voterType: 'all',
    format: 'combined',
    includeStats: true
  });

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const params = new URLSearchParams(exportOptions);
      const response = await fetch(`/api/voters/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'voters_export.xlsx';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleStreamExport = async () => {
    setIsExporting(true);
    
    try {
      const params = new URLSearchParams({
        ...exportOptions,
        batchSize: '1000'
      });
      
      const response = await fetch(`/api/voters/export/stream?${params}`);
      
      if (!response.ok) {
        throw new Error('Stream export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voters_stream_export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Stream export error:', error);
      alert('Stream export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="voter-export-component">
      <h3>Export Voters to Excel</h3>
      
      <div className="export-options">
        <div className="option-group">
          <label>Voter Type:</label>
          <select
            value={exportOptions.voterType}
            onChange={(e) => setExportOptions({
              ...exportOptions,
              voterType: e.target.value
            })}
          >
            <option value="all">All Voters</option>
            <option value="voter">Voter Collection Only</option>
            <option value="voterFour">VoterFour Collection Only</option>
          </select>
        </div>

        <div className="option-group">
          <label>Export Format:</label>
          <select
            value={exportOptions.format}
            onChange={(e) => setExportOptions({
              ...exportOptions,
              format: e.target.value
            })}
          >
            <option value="combined">Combined (Single Sheet)</option>
            <option value="separate">Separate (Multiple Sheets)</option>
            <option value="formatted">Formatted (With Filters)</option>
          </select>
        </div>

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={exportOptions.includeStats}
              onChange={(e) => setExportOptions({
                ...exportOptions,
                includeStats: e.target.checked
              })}
            />
            Include Statistics
          </label>
        </div>
      </div>

      <div className="export-buttons">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn btn-primary"
        >
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </button>

        <button
          onClick={handleStreamExport}
          disabled={isExporting}
          className="btn btn-secondary"
        >
          {isExporting ? 'Streaming...' : 'Stream Export (Large Data)'}
        </button>
      </div>

      {isExporting && (
        <div className="export-status">
          <div className="spinner"></div>
          <p>Preparing Excel file for download...</p>
        </div>
      )}
    </div>
  );
};

export default VoterExportComponent;
```

### JavaScript/Fetch Example
```javascript
// Basic export function
async function exportVoters(options = {}) {
  const defaultOptions = {
    voterType: 'all',
    format: 'combined',
    includeStats: true
  };

  const params = new URLSearchParams({ ...defaultOptions, ...options });
  
  try {
    const response = await fetch(`/api/voters/export?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get filename from response headers
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : 'voters_export.xlsx';

    // Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
}

// Usage examples
exportVoters({ voterType: 'voter', format: 'formatted' });
exportVoters({ voterType: 'all', format: 'separate', includeStats: true });
```

### Progress Tracking for Large Exports
```javascript
// Advanced export with progress tracking
async function exportVotersWithProgress(options = {}, onProgress = null) {
  const params = new URLSearchParams({
    ...options,
    batchSize: '1000' // Use streaming for progress tracking
  });

  try {
    const response = await fetch(`/api/voters/export/stream?${params}`);
    
    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Track download progress
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    let receivedLength = 0;
    let chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (onProgress && contentLength) {
        const progress = Math.round((receivedLength / contentLength) * 100);
        onProgress(progress);
      }
    }

    // Combine chunks and create blob
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    const blob = new Blob([chunksAll], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Download file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voters_export_${Date.now()}.xlsx`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
}

// Usage with progress tracking
exportVotersWithProgress(
  { voterType: 'all', format: 'combined' },
  (progress) => {
    console.log(`Export progress: ${progress}%`);
    // Update UI progress bar
  }
);
```

---

## 📊 Excel File Features

### Automatic Features
- **Column Auto-sizing**: Optimal column widths for readability
- **Data Validation**: Proper data types and formats
- **Timestamp**: Export date and time included
- **Voter Type Identification**: Clear indication of data source

### Formatting Options
- **Combined Format**: Single sheet with all data
- **Separate Format**: Multiple sheets with summary
- **Formatted Format**: Auto-filters and enhanced formatting

### Data Quality
- **Consistent Headers**: Standardized column names
- **Complete Data**: All available fields included
- **Sorted Data**: Alphabetical sorting by voter name
- **Clean Formatting**: Proper date and boolean formatting

---

## 🔧 Technical Details

### Performance Considerations
- **Memory Efficient**: Streaming for large datasets
- **Batch Processing**: Configurable batch sizes
- **Progress Tracking**: Real-time progress updates
- **Error Handling**: Comprehensive error management

### File Specifications
- **Format**: Excel (.xlsx)
- **Encoding**: UTF-8
- **Max Size**: Limited by server memory (use streaming for large files)
- **Compatibility**: Excel 2007+ and LibreOffice Calc

### Security Features
- **No Authentication Required**: Public export endpoint
- **Rate Limiting**: Built-in protection against abuse
- **Error Sanitization**: Safe error messages
- **File Validation**: Proper MIME type validation

---

## 🎯 Best Practices

### Frontend Implementation
1. **Show Progress**: Display progress for large exports
2. **Handle Errors**: Provide clear error messages
3. **Validate Options**: Check export parameters
4. **Memory Management**: Use streaming for large datasets

### Performance Optimization
1. **Use Streaming**: For datasets > 10,000 records
2. **Batch Processing**: Process in configurable batches
3. **Progress Feedback**: Keep users informed
4. **Error Recovery**: Handle network interruptions

### User Experience
1. **Clear Options**: Explain export format differences
2. **Download Feedback**: Confirm successful downloads
3. **File Naming**: Descriptive filenames with timestamps
4. **Format Selection**: Help users choose appropriate format

This export functionality provides a complete solution for downloading voter data in Excel format, suitable for frontend integration and large-scale data exports.
