const XLSX = require('xlsx');
const path = require('path');

class ExcelWriter {
  constructor() {
    this.workbook = XLSX.utils.book_new();
  }

  // Create Excel file from voter data
  createVotersExcel(voters, filename = 'voters_export') {
    try {
      // Prepare data for Excel export
      const excelData = this.prepareVotersData(voters);
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths for better readability
      const columnWidths = this.getColumnWidths();
      worksheet['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Voters');
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fullFilename = `${filename}_${timestamp}.xlsx`;
      
      return {
        workbook: this.workbook,
        filename: fullFilename,
        data: excelData
      };
    } catch (error) {
      throw new Error(`Error creating Excel file: ${error.message}`);
    }
  }

  // Prepare voter data for Excel export
  prepareVotersData(voters) {
    return voters.map(voter => {
      const voterData = {
        'Voter Type': voter.voterType || 'Unknown',
        'Voter ID': voter._id || '',
        'Voter Name (English)': voter['Voter Name Eng'] || '',
        'Voter Name (Hindi)': voter['Voter Name'] || '',
        'Relative Name (English)': voter['Relative Name Eng'] || voter[' Relative Name Eng'] || '',
        'Relative Name (Hindi)': voter['Relative Name'] || '',
        'Gender': voter.Sex || '',
        'Age': voter.Age || '',
        'Card Number': voter.CardNo || '',
        'Code Number': voter.CodeNo || '',
        'Part Number': voter.pno || '',
        'Assembly Constituency': voter.AC || '',
        'Part': voter.Part || '',
        'Serial Number': voter['Sr No'] || voter['Sr no'] || '',
        'House Number': voter['House No'] || '',
        'Address (Hindi)': voter.Address || '',
        'Address (English)': voter['Address Eng'] || '',
        'Booth Number': voter['Booth no'] || '',
        'Booth Name (Hindi)': voter.Booth || '',
        'Booth Name (English)': voter['Booth Eng'] || '',
        'Status': voter.Status || '',
        'Is Paid': voter.isPaid ? 'Yes' : 'No',
        'Is Visited': voter.isVisited ? 'Yes' : 'No',
        'Is Active': voter.isActive ? 'Yes' : 'No',
        'Created At': voter.createdAt ? new Date(voter.createdAt).toLocaleString() : '',
        'Updated At': voter.updatedAt ? new Date(voter.updatedAt).toLocaleString() : ''
      };

      // Add any additional fields that might exist
      Object.keys(voter).forEach(key => {
        if (!voterData[key] && !['_id', '__v'].includes(key)) {
          voterData[key] = voter[key] || '';
        }
      });

      return voterData;
    });
  }

  // Get optimal column widths for Excel
  getColumnWidths() {
    return [
      { wch: 12 }, // Voter Type
      { wch: 25 }, // Voter ID
      { wch: 30 }, // Voter Name (English)
      { wch: 30 }, // Voter Name (Hindi)
      { wch: 30 }, // Relative Name (English)
      { wch: 30 }, // Relative Name (Hindi)
      { wch: 8 },  // Gender
      { wch: 6 },  // Age
      { wch: 15 }, // Card Number
      { wch: 15 }, // Code Number
      { wch: 12 }, // Part Number
      { wch: 8 },  // Assembly Constituency
      { wch: 8 },  // Part
      { wch: 12 }, // Serial Number
      { wch: 12 }, // House Number
      { wch: 40 }, // Address (Hindi)
      { wch: 40 }, // Address (English)
      { wch: 12 }, // Booth Number
      { wch: 40 }, // Booth Name (Hindi)
      { wch: 40 }, // Booth Name (English)
      { wch: 10 }, // Status
      { wch: 8 },  // Is Paid
      { wch: 10 }, // Is Visited
      { wch: 10 }, // Is Active
      { wch: 20 }, // Created At
      { wch: 20 }  // Updated At
    ];
  }

  // Create Excel file with multiple sheets
  createMultiSheetExcel(data, filename = 'voters_export') {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Add voters sheet
      if (data.voters && data.voters.length > 0) {
        const votersData = this.prepareVotersData(data.voters);
        const votersSheet = XLSX.utils.json_to_sheet(votersData);
        votersSheet['!cols'] = this.getColumnWidths();
        XLSX.utils.book_append_sheet(workbook, votersSheet, 'All Voters');
      }

      // Add voterFour sheet if data exists
      if (data.voterFour && data.voterFour.length > 0) {
        const voterFourData = this.prepareVotersData(data.voterFour);
        const voterFourSheet = XLSX.utils.json_to_sheet(voterFourData);
        voterFourSheet['!cols'] = this.getColumnWidths();
        XLSX.utils.book_append_sheet(workbook, voterFourSheet, 'VoterFour');
      }

      // Add summary sheet
      if (data.summary) {
        const summaryData = this.prepareSummaryData(data.summary);
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fullFilename = `${filename}_${timestamp}.xlsx`;
      
      return {
        workbook,
        filename: fullFilename,
        data
      };
    } catch (error) {
      throw new Error(`Error creating multi-sheet Excel file: ${error.message}`);
    }
  }

  // Prepare summary data for Excel
  prepareSummaryData(summary) {
    return [
      { 'Metric': 'Total Voters', 'Value': summary.totalVoters || 0 },
      { 'Metric': 'Voter Collection', 'Value': summary.voterCount || 0 },
      { 'Metric': 'VoterFour Collection', 'Value': summary.voterFourCount || 0 },
      { 'Metric': 'Male Voters', 'Value': summary.genderDistribution?.male || 0 },
      { 'Metric': 'Female Voters', 'Value': summary.genderDistribution?.female || 0 },
      { 'Metric': 'Other Gender', 'Value': summary.genderDistribution?.other || 0 },
      { 'Metric': 'Paid Voters', 'Value': summary.paymentStatus?.paid || 0 },
      { 'Metric': 'Unpaid Voters', 'Value': summary.paymentStatus?.notPaid || 0 },
      { 'Metric': 'Visited Voters', 'Value': summary.visitStatus?.visited || 0 },
      { 'Metric': 'Not Visited Voters', 'Value': summary.visitStatus?.notVisited || 0 },
      { 'Metric': 'Active Voters', 'Value': summary.activeStatus?.active || 0 },
      { 'Metric': 'Inactive Voters', 'Value': summary.activeStatus?.inactive || 0 },
      { 'Metric': 'Export Date', 'Value': new Date().toLocaleString() }
    ];
  }

  // Write Excel file to buffer (for API response)
  writeToBuffer() {
    try {
      return XLSX.write(this.workbook, { type: 'buffer', bookType: 'xlsx' });
    } catch (error) {
      throw new Error(`Error writing Excel to buffer: ${error.message}`);
    }
  }

  // Write Excel file to file system
  writeToFile(filePath) {
    try {
      XLSX.writeFile(this.workbook, filePath);
      return filePath;
    } catch (error) {
      throw new Error(`Error writing Excel to file: ${error.message}`);
    }
  }

  // Create Excel with filters and formatting
  createFormattedExcel(voters, filename = 'voters_export') {
    try {
      const excelData = this.prepareVotersData(voters);
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      worksheet['!cols'] = this.getColumnWidths();
      
      // Add auto-filter (Excel feature for filtering)
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      worksheet['!autofilter'] = {
        ref: XLSX.utils.encode_range({
          s: { c: 0, r: 0 },
          e: { c: range.e.c, r: range.e.r }
        })
      };
      
      XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Voters');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fullFilename = `${filename}_${timestamp}.xlsx`;
      
      return {
        workbook: this.workbook,
        filename: fullFilename,
        data: excelData
      };
    } catch (error) {
      throw new Error(`Error creating formatted Excel file: ${error.message}`);
    }
  }

  // Get Excel file info
  getExcelInfo() {
    return {
      sheetNames: this.workbook.SheetNames,
      totalSheets: this.workbook.SheetNames.length,
      created: new Date().toISOString()
    };
  }
}

module.exports = ExcelWriter;
