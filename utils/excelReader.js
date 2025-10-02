const XLSX = require('xlsx');
const path = require('path');

class ExcelReader {
  constructor(filePath) {
    this.filePath = filePath;
    this.workbook = null;
    this.worksheet = null;
  }

  // Read Excel file and get the first worksheet
  readExcel() {
    try {
      this.workbook = XLSX.readFile(this.filePath);
      const sheetName = this.workbook.SheetNames[0];
      this.worksheet = this.workbook.Sheets[sheetName];
      return this.worksheet;
    } catch (error) {
      throw new Error(`Error reading Excel file: ${error.message}`);
    }
  }

  // Convert Excel data to JSON
  excelToJson(fileName = '') {
    try {
      if (!this.worksheet) {
        this.readExcel();
      }
      
      const jsonData = XLSX.utils.sheet_to_json(this.worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });

      if (jsonData.length === 0) {
        throw new Error('Excel file is empty or has no data');
      }

      // Get headers from first row
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);

      // Map data to objects
      const mappedData = dataRows.map((row, index) => {
        const voterData = {};
        
        headers.forEach((header, colIndex) => {
          if (header && header.trim()) {
            const cleanHeader = header.toString().trim();
            let value = row[colIndex] ? row[colIndex].toString().trim() : '';
            
            // Map common column names to our schema
            const fieldMapping = this.getFieldMapping(cleanHeader, fileName);
            if (fieldMapping) {
              // Special handling for gender field
              if (fieldMapping === 'Sex' || fieldMapping === 'gender') {
                value = this.normalizeGender(value);
              }
              voterData[fieldMapping] = value;
            } else {
              // Store unknown fields with original header name
              voterData[cleanHeader] = value;
            }
          }
        });

        return {
          ...voterData,
          rowNumber: index + 2 // Excel row number (accounting for header)
        };
      });

      return {
        headers,
        data: mappedData,
        totalRows: mappedData.length
      };
    } catch (error) {
      throw new Error(`Error converting Excel to JSON: ${error.message}`);
    }
  }

  // Map Excel column headers to our database schema
  getFieldMapping(header, fileName = '') {
    // For 208-Voterlist Excel file, use exact column names without modification
    const exactMapping208 = {
      'AC': 'AC',
      'Part': 'Part',
      'Sr No': 'Sr No',
      'House No': 'House No',
      'Voter Name': 'Voter Name',
      'Voter Name Eng': 'Voter Name Eng',
      'Relative Name': 'Relative Name',
      'Relative Name Eng': 'Relative Name Eng',
      'Sex': 'Sex',
      'Age': 'Age',
      'CardNo': 'CardNo',
      'Address': 'Address',
      'Address Eng': 'Address Eng',
      'Booth': 'Booth',
      'Booth Eng': 'Booth Eng',
      'Status': 'Status',
      'pno': 'pno'
    };

    // For 1st.xlsx, 2nd.xlsx, 3rd.xlsx files, use exact column names
    const exactMappingThree = {
      'AC': 'AC',
      'Booth no': 'Booth no',
      'Sr No': 'Sr No',
      'Sr no': 'Sr no',
      'Voter Name': 'Voter Name',
      'Voter Name Eng': 'Voter Name Eng',
      'Relative Name': 'Relative Name',
      'Relative Name Eng': 'Relative Name Eng',
      ' Relative Name Eng': ' Relative Name Eng',
      'Sex': 'Sex',
      'Age': 'Age',
      'CardNo': 'CardNo',
      'CodeNo': 'CodeNo',
      'Address': 'Address',
      'Booth': 'Booth',
      'Booth Eng': 'Booth Eng',
      'pno': 'pno'
    };

    // For other Excel files, use the original mapping
    const mapping = {
      // Voter Name variations
      'Voter Name Eng': 'voterNameEng',
      'Voter Name English': 'voterNameEng',
      'Name (English)': 'voterNameEng',
      'Voter Name': 'voterNameEng',
      'Name': 'voterNameEng',
      
      // Hindi Name variations
      'Voter Name Hindi': 'voterNameHindi',
      'Voter Name (Hindi)': 'voterNameHindi',
      'Name (Hindi)': 'voterNameHindi',
      'नाम (हिंदी)': 'voterNameHindi',
      
      // Father Name variations
      'Father Name Eng': 'fatherNameEng',
      'Father Name English': 'fatherNameEng',
      'Father Name': 'fatherNameEng',
      'Father\'s Name': 'fatherNameEng',
      'Relative Name Eng': 'fatherNameEng',
      'Relative Name': 'fatherNameEng',
      
      // Father Name Hindi
      'Father Name Hindi': 'fatherNameHindi',
      'Father Name (Hindi)': 'fatherNameHindi',
      'पिता का नाम': 'fatherNameHindi',
      
      // Husband Name variations
      'Husband Name Eng': 'husbandNameEng',
      'Husband Name English': 'husbandNameEng',
      'Husband Name': 'husbandNameEng',
      'Husband\'s Name': 'husbandNameEng',
      
      // Husband Name Hindi
      'Husband Name Hindi': 'husbandNameHindi',
      'Husband Name (Hindi)': 'husbandNameHindi',
      'पति का नाम': 'husbandNameHindi',
      
      // Personal details
      'Age': 'age',
      'Gender': 'gender',
      'Sex': 'gender',
      
      // Address fields
      'House Number': 'houseNumber',
      'House No': 'houseNumber',
      'Street': 'street',
      'Area': 'area',
      'City': 'city',
      'State': 'state',
      'Pincode': 'pincode',
      'Pin Code': 'pincode',
      'PIN': 'pincode',
      'Address': 'address',
      'Address Eng': 'addressEng',
      
      // Electoral information
      'Constituency': 'constituency',
      'Assembly Constituency': 'assemblyConstituency',
      'AC': 'assemblyConstituency',
      'Part Number': 'partNumber',
      'Part No': 'partNumber',
      'Part': 'partNumber',
      'Serial Number': 'serialNumber',
      'Serial No': 'serialNumber',
      'Sr No': 'serialNumber',
      'Voter ID': 'voterId',
      'Voter Id': 'voterId',
      'CardNo': 'voterId',
      'EPIC Number': 'epicNumber',
      'EPIC': 'epicNumber',
      'Booth Number': 'boothNumber',
      'Booth No': 'boothNumber',
      'Booth Name': 'boothName',
      'Booth': 'boothName',
      'Booth Eng': 'boothNameEng',
      'Booth no': 'boothNumber',
      'Booth No': 'boothNumber',
      'Status': 'status',
      'CodeNo': 'codeNo',
      'Code No': 'codeNo'
    };

    // Use exact mapping for 208-Voterlist file
    if (fileName.includes('208-Voterlist') && exactMapping208[header]) {
      return exactMapping208[header];
    }

    // Use exact mapping for 1st.xlsx, 2nd.xlsx, 3rd.xlsx files
    if ((fileName.includes('1st.xlsx') || fileName.includes('2nd.xlsx') || fileName.includes('3rd.xlsx')) && exactMappingThree[header]) {
      return exactMappingThree[header];
    }

    // For other files, use general mapping
    const normalizedHeader = header.toLowerCase().trim();
    for (const [key, value] of Object.entries(mapping)) {
      if (key.toLowerCase() === normalizedHeader) {
        return value;
      }
    }

    return null;
  }

  // Normalize gender values
  normalizeGender(gender) {
    if (!gender) return '';
    
    const normalized = gender.toString().trim().toUpperCase();
    
    switch (normalized) {
      case 'M':
      case 'MALE':
        return 'Male';
      case 'F':
      case 'FEMALE':
        return 'Female';
      case 'O':
      case 'OTHER':
        return 'Other';
      default:
        return gender; // Return original if not recognized
    }
  }

  // Validate required fields
  validateData(data, fileName = '') {
    const errors = [];
    const requiredFields = ['Voter Name Eng'];

    data.forEach((voter, index) => {
      const rowErrors = [];
      
      requiredFields.forEach(field => {
        if (!voter[field] || voter[field].trim() === '') {
          rowErrors.push(`Missing required field: ${field}`);
        }
      });

      if (rowErrors.length > 0) {
        errors.push({
          row: voter.rowNumber,
          errors: rowErrors
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get worksheet information
  getWorksheetInfo() {
    if (!this.workbook) {
      this.readExcel();
    }

    return {
      sheetNames: this.workbook.SheetNames,
      currentSheet: this.workbook.SheetNames[0],
      totalSheets: this.workbook.SheetNames.length
    };
  }
}

module.exports = ExcelReader;
