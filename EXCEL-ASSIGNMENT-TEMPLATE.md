# Excel Template for Voter Assignment

This document explains how to prepare Excel files for bulk voter assignment.

## Quick Start

1. Create an Excel file (.xlsx or .xls)
2. Add a column named `CardNo` (for Voter) or `CodeNo` (for VoterFour)
3. List one identifier per row
4. Upload to `/api/assignment/assign-from-excel`

---

## Template Formats

### Option 1: CardNo Only (For Voter Type)

**File:** `voters-cardno-assignment.xlsx`

```
| CardNo      |
|-------------|
| TBZ5096904  |
| TBZ8997157  |
| ABC1234567  |
| ABC1234568  |
| ABC1234569  |
```

### Option 2: CodeNo Only (For VoterFour Type)

**File:** `voters-codeno-assignment.xlsx`

```
| CodeNo      |
|-------------|
| TBZ9089863  |
| XYZ1234567  |
| ABC9876543  |
| DEF1122334  |
```

### Option 3: With Additional Columns (Optional)

You can include additional columns for reference, but only CardNo/CodeNo will be used:

```
| CardNo      | Voter Name Eng      | AC  | Part | Notes          |
|-------------|---------------------|-----|------|----------------|
| TBZ5096904  | Arati Jagtap        | 208 | 12   | Priority voter |
| TBZ8997157  | Bhagyyavati Kawar   | 208 | 20   | Follow up      |
| ABC1234567  | Ramesh Kumar        | 208 | 5    |                |
```

**Note:** Additional columns are ignored during processing - only CardNo/CodeNo is used for matching.

---

## Column Name Variations Supported

The system recognizes these column names:

### For Voter Type:
- `CardNo`
- `Card No`
- `Cardno`
- `cardno`

### For VoterFour Type:
- `CodeNo`
- `Code No`
- `Codeno`
- `codeno`

**Recommendation:** Use `CardNo` for Voter and `CodeNo` for VoterFour to avoid confusion.

---

## Step-by-Step Guide

### Creating the Excel File

1. **Open Excel/Google Sheets**

2. **Add Header Row:**
   - Cell A1: Type `CardNo` (for Voter) or `CodeNo` (for VoterFour)

3. **Add Identifiers:**
   - Cell A2: First identifier (e.g., `TBZ5096904`)
   - Cell A3: Second identifier (e.g., `TBZ8997157`)
   - Continue for all voters...

4. **Save File:**
   - Save as `.xlsx` format
   - Name it descriptively (e.g., `kharadi-zone-assignment.xlsx`)

5. **Upload:**
   ```bash
   curl -X POST http://localhost:3000/api/assignment/assign-from-excel \
     -F "file=@kharadi-zone-assignment.xlsx" \
     -F "subAdminId=YOUR_SUBADMIN_ID" \
     -F "voterType=Voter"
   ```

---

## Data Validation

### What Gets Validated:
- ✅ File format (.xlsx, .xls, .csv only)
- ✅ File size (max 10MB)
- ✅ CardNo/CodeNo column exists
- ✅ At least one identifier present
- ✅ Sub admin exists
- ✅ Voter type is valid

### What Happens During Processing:
1. **Excel is read** and CardNo/CodeNo extracted
2. **Duplicates are removed** automatically
3. **Database search** finds matching voters
4. **Already assigned voters** are skipped
5. **New assignments** are created
6. **Report generated** with success/failure stats

---

## Example Scenarios

### Scenario 1: Assign 50 Voters from Excel

**Excel File (50-voters.xlsx):**
```
CardNo
TBZ5096904
TBZ8997157
ABC1234567
... (47 more)
```

**Upload:**
```bash
curl -X POST http://localhost:3000/api/assignment/assign-from-excel \
  -F "file=@50-voters.xlsx" \
  -F "subAdminId=68e456789abcdef123456789" \
  -F "voterType=Voter"
```

**Result:**
```json
{
  "excelStats": {
    "totalIdentifiersInExcel": 50,
    "votersFoundInDatabase": 48,
    "votersNotFound": 2,
    "alreadyAssigned": 3,
    "newlyAssigned": 45
  }
}
```

### Scenario 2: Assign 1000 VoterFour from Excel

**Excel File (1000-voterfour.xlsx):**
```
CodeNo
TBZ9089863
XYZ1234567
... (998 more)
```

**Upload:**
```bash
curl -X POST http://localhost:3000/api/assignment/assign-from-excel \
  -F "file=@1000-voterfour.xlsx" \
  -F "subAdminId=68e456789abcdef123456789" \
  -F "voterType=VoterFour"
```

---

## Troubleshooting

### Issue: "No CardNo or CodeNo found"
**Solution:** Ensure your Excel has a column named exactly `CardNo` or `CodeNo`

### Issue: "No voters found matching..."
**Solution:** 
- Verify identifiers exist in database
- Check you're using correct voterType (Voter uses CardNo, VoterFour uses CodeNo)
- Ensure identifiers match exactly (case-sensitive)

### Issue: "All voters already assigned"
**Solution:** 
- Check the `alreadyAssigned` count in response
- Use assignment-page endpoint to see which voters are unassigned
- Consider unassigning before reassigning

---

## Download Sample Templates

### Voter Type Template (CardNo)
Create a file with this content:
```csv
CardNo
TBZ5096904
TBZ8997157
ABC1234567
```

### VoterFour Type Template (CodeNo)
Create a file with this content:
```csv
CodeNo
TBZ9089863
XYZ1234567
ABC9876543
```

---

## Integration with Frontend

### HTML Form Example
```html
<form id="excelUploadForm">
  <label>Sub Admin:</label>
  <select id="subAdminId">
    <option value="68e456...">Vijay Patil</option>
    <option value="68e789...">Rahul Sharma</option>
  </select>

  <label>Voter Type:</label>
  <select id="voterType">
    <option value="Voter">Voter (CardNo)</option>
    <option value="VoterFour">VoterFour (CodeNo)</option>
  </select>

  <label>Excel File:</label>
  <input type="file" id="excelFile" accept=".xlsx,.xls,.csv">

  <label>Notes:</label>
  <textarea id="notes"></textarea>

  <button type="submit">Upload and Assign</button>
</form>

<script>
document.getElementById('excelUploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('file', document.getElementById('excelFile').files[0]);
  formData.append('subAdminId', document.getElementById('subAdminId').value);
  formData.append('voterType', document.getElementById('voterType').value);
  formData.append('notes', document.getElementById('notes').value);

  try {
    const response = await fetch('/api/assignment/assign-from-excel', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`Success! Assigned ${result.data.excelStats.newlyAssigned} voters`);
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    alert('Upload failed');
  }
});
</script>
```

