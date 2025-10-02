const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Voter = require('./models/Voter');
const VoterFour = require('./models/VoterFour');
const ExcelReader = require('./utils/excelReader');

// Import admin routes
const adminRoutes = require('./routes/adminRoutes');
const voterRoutes = require('./routes/voterRoutes');
const voterFourRoutes = require('./routes/voterFourRoutes');
const subAdminRoutes = require('./routes/subAdminRoutes');
const voterAssignmentRoutes = require('./routes/voterAssignmentRoutes');
const subAdminVoterRoutes = require('./routes/subAdminVoterRoutes');
const alertRoutes = require('./routes/alertRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voter-data-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voter-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes

// Admin routes
app.use('/api/admin', adminRoutes);

// Voter routes
app.use('/api/voter', voterRoutes);

// VoterFour routes
app.use('/api/voterfour', voterFourRoutes);

// Sub Admin routes
app.use('/api/subadmin', subAdminRoutes);

// Voter Assignment routes (Admin only)
app.use('/api/assignment', voterAssignmentRoutes);

// Sub Admin Voter routes (Sub Admin only)
app.use('/api/subadmin/voters', subAdminVoterRoutes);

// Alert routes
app.use('/api/alert', alertRoutes);

// Category routes
app.use('/api/category', categoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Voter API is running',
    timestamp: new Date().toISOString()
  });
});

// Upload Excel file and save to MongoDB
app.post('/api/upload', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    console.log(`Processing file: ${filePath}`);

    // Read Excel file
    const excelReader = new ExcelReader(filePath);
    const { headers, data, totalRows } = excelReader.excelToJson(fileName);

    // Validate data
    const validation = excelReader.validateData(data, fileName);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Data validation failed',
        errors: validation.errors
      });
    }

    // Save to MongoDB in batches
    const batchSize = 1000;
    let savedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        await Voter.insertMany(batch, { ordered: false });
        savedCount += batch.length;
      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate key errors
          const duplicateErrors = error.writeErrors || [];
          errorCount += duplicateErrors.length;
          errors.push(...duplicateErrors.map(err => ({
            row: err.index + i + 1,
            message: 'Duplicate entry',
            details: err.errmsg
          })));
        } else {
          errorCount += batch.length;
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            message: error.message
          });
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Data uploaded successfully',
      statistics: {
        totalRows: totalRows,
        savedCount: savedCount,
        errorCount: errorCount,
        headers: headers
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing file',
      error: error.message
    });
  }
});

// Upload additional Excel files (1st.xlsx, 2nd.xlsx, 3rd.xlsx) to VoterFour collection
app.post('/api/upload-four', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    console.log(`Processing additional file: ${fileName}`);

    // Read Excel file
    const excelReader = new ExcelReader(filePath);
    const { headers, data, totalRows } = excelReader.excelToJson(fileName);

    // Validate data
    const validation = excelReader.validateData(data, fileName);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Data validation failed',
        errors: validation.errors
      });
    }

    // Add source file information to each record
    const dataWithSource = data.map(record => ({
      ...record,
      sourceFile: fileName
    }));

    // Save to MongoDB in batches
    const batchSize = 1000;
    let savedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < dataWithSource.length; i += batchSize) {
      const batch = dataWithSource.slice(i, i + batchSize);
      
      try {
        await VoterFour.insertMany(batch, { ordered: false });
        savedCount += batch.length;
      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate key errors
          const duplicateErrors = error.writeErrors || [];
          errorCount += duplicateErrors.length;
          errors.push(...duplicateErrors.map(err => ({
            row: err.index + i + 1,
            message: 'Duplicate entry',
            details: err.errmsg
          })));
        } else {
          errorCount += batch.length;
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            message: error.message
          });
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Additional data uploaded successfully',
      statistics: {
        totalRows: totalRows,
        savedCount: savedCount,
        errorCount: errorCount,
        sourceFile: fileName,
        headers: headers
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing file',
      error: error.message
    });
  }
});

// Professional search for voters
app.get('/api/search', async (req, res) => {
  try {
    const {
      q, // search query
      'Voter Name Eng': voterNameEng,
      'Relative Name Eng': relativeNameEng,
      'Voter Name': voterName,
      'Relative Name': relativeName,
      AC,
      Part,
      CardNo,
      Address,
      'Address Eng': addressEng,
      Booth,
      'Booth Eng': boothEng,
      Sex,
      Age,
      isPaid,
      isVisited,
      page = 1,
      limit = 20,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc'
    } = req.query;

    // Build search criteria
    const searchCriteria = {};

    // Text search across multiple fields
    if (q) {
      searchCriteria.$text = { $search: q };
    }

    // Specific field searches using exact column names
    if (voterNameEng) {
      searchCriteria['Voter Name Eng'] = { $regex: voterNameEng, $options: 'i' };
    }
    if (relativeNameEng) {
      searchCriteria['Relative Name Eng'] = { $regex: relativeNameEng, $options: 'i' };
    }
    if (voterName) {
      searchCriteria['Voter Name'] = { $regex: voterName, $options: 'i' };
    }
    if (relativeName) {
      searchCriteria['Relative Name'] = { $regex: relativeName, $options: 'i' };
    }
    if (AC) {
      searchCriteria.AC = { $regex: AC, $options: 'i' };
    }
    if (Part) {
      searchCriteria.Part = { $regex: Part, $options: 'i' };
    }
    if (CardNo) {
      searchCriteria.CardNo = { $regex: CardNo, $options: 'i' };
    }
    if (Address) {
      searchCriteria.Address = { $regex: Address, $options: 'i' };
    }
    if (addressEng) {
      searchCriteria['Address Eng'] = { $regex: addressEng, $options: 'i' };
    }
    if (Booth) {
      searchCriteria.Booth = { $regex: Booth, $options: 'i' };
    }
    if (boothEng) {
      searchCriteria['Booth Eng'] = { $regex: boothEng, $options: 'i' };
    }
    if (Sex) {
      searchCriteria.Sex = { $regex: Sex, $options: 'i' };
    }
    if (Age) {
      searchCriteria.Age = parseInt(Age);
    }
    if (isPaid !== undefined) {
      searchCriteria.isPaid = isPaid === 'true';
    }
    if (isVisited !== undefined) {
      searchCriteria.isVisited = isVisited === 'true';
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute search
    const [voters, totalCount] = await Promise.all([
      Voter.find(searchCriteria)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Voter.countDocuments(searchCriteria)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: voters,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      },
      searchCriteria: Object.keys(searchCriteria).length > 0 ? searchCriteria : 'No specific criteria'
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// Search VoterFour collection
app.get('/api/search-four', async (req, res) => {
  try {
    const {
      q, // search query
      'Voter Name Eng': voterNameEng,
      'Relative Name Eng': relativeNameEng,
      'Voter Name': voterName,
      'Relative Name': relativeName,
      AC,
      'Booth no': boothNo,
      CardNo,
      CodeNo,
      Address,
      Booth,
      'Booth Eng': boothEng,
      Sex,
      Age,
      sourceFile,
      isPaid,
      isVisited,
      page = 1,
      limit = 20,
      sortBy = 'Voter Name Eng',
      sortOrder = 'asc'
    } = req.query;

    // Build search criteria
    const searchCriteria = {};

    // Text search across multiple fields
    if (q) {
      searchCriteria.$text = { $search: q };
    }

    // Specific field searches using exact column names
    if (voterNameEng) {
      searchCriteria['Voter Name Eng'] = { $regex: voterNameEng, $options: 'i' };
    }
    if (relativeNameEng) {
      searchCriteria['Relative Name Eng'] = { $regex: relativeNameEng, $options: 'i' };
    }
    if (voterName) {
      searchCriteria['Voter Name'] = { $regex: voterName, $options: 'i' };
    }
    if (relativeName) {
      searchCriteria['Relative Name'] = { $regex: relativeName, $options: 'i' };
    }
    if (AC) {
      searchCriteria.AC = { $regex: AC, $options: 'i' };
    }
    if (boothNo) {
      searchCriteria['Booth no'] = { $regex: boothNo, $options: 'i' };
    }
    if (CardNo) {
      searchCriteria.CardNo = { $regex: CardNo, $options: 'i' };
    }
    if (CodeNo) {
      searchCriteria.CodeNo = { $regex: CodeNo, $options: 'i' };
    }
    if (Address) {
      searchCriteria.Address = { $regex: Address, $options: 'i' };
    }
    if (Booth) {
      searchCriteria.Booth = { $regex: Booth, $options: 'i' };
    }
    if (boothEng) {
      searchCriteria['Booth Eng'] = { $regex: boothEng, $options: 'i' };
    }
    if (Sex) {
      searchCriteria.Sex = { $regex: Sex, $options: 'i' };
    }
    if (Age) {
      searchCriteria.Age = parseInt(Age);
    }
    if (sourceFile) {
      searchCriteria.sourceFile = { $regex: sourceFile, $options: 'i' };
    }
    if (isPaid !== undefined) {
      searchCriteria.isPaid = isPaid === 'true';
    }
    if (isVisited !== undefined) {
      searchCriteria.isVisited = isVisited === 'true';
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute search
    const [voters, totalCount] = await Promise.all([
      VoterFour.find(searchCriteria)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      VoterFour.countDocuments(searchCriteria)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: voters,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      },
      searchCriteria: Object.keys(searchCriteria).length > 0 ? searchCriteria : 'No specific criteria'
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// Get voter by ID
app.get('/api/voter/:id', async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    
    if (!voter) {
      return res.status(404).json({
        success: false,
        message: 'Voter not found'
      });
    }

    res.json({
      success: true,
      data: voter
    });
  } catch (error) {
    console.error('Get voter error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voter',
      error: error.message
    });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [
      totalVoters,
      totalVoterFour,
      genderStats,
      genderStatsFour,
      constituencyStats,
      constituencyStatsFour,
      ageStats,
      ageStatsFour,
      sourceFileStats
    ] = await Promise.all([
      Voter.countDocuments(),
      VoterFour.countDocuments(),
      Voter.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]),
      VoterFour.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]),
      Voter.aggregate([
        { $group: { _id: '$constituency', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      VoterFour.aggregate([
        { $group: { _id: '$assemblyConstituency', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Voter.aggregate([
        { $match: { age: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            avgAge: { $avg: '$age' },
            minAge: { $min: '$age' },
            maxAge: { $max: '$age' }
          }
        }
      ]),
      VoterFour.aggregate([
        { $match: { age: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            avgAge: { $avg: '$age' },
            minAge: { $min: '$age' },
            maxAge: { $max: '$age' }
          }
        }
      ]),
      VoterFour.aggregate([
        { $group: { _id: '$sourceFile', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      statistics: {
        totalVoters: totalVoters,
        totalVoterFour: totalVoterFour,
        totalCombined: totalVoters + totalVoterFour,
        genderDistribution: {
          main: genderStats,
          four: genderStatsFour
        },
        constituencyDistribution: {
          main: constituencyStats,
          four: constituencyStatsFour
        },
        ageStatistics: {
          main: ageStats[0] || null,
          four: ageStatsFour[0] || null
        },
        sourceFileDistribution: sourceFileStats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Delete all voters (for testing/reset)
app.delete('/api/voters', async (req, res) => {
  try {
    const result = await Voter.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} voters`
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting voters',
      error: error.message
    });
  }
});

// Delete all VoterFour records (for testing/reset)
app.delete('/api/voters-four', async (req, res) => {
  try {
    const result = await VoterFour.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} VoterFour records`
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting VoterFour records',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Voter API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Upload endpoint: POST http://localhost:${PORT}/api/upload`);
  console.log(`Upload Four endpoint: POST http://localhost:${PORT}/api/upload-four`);
  console.log(`Search endpoint: GET http://localhost:${PORT}/api/search`);
  console.log(`Search Four endpoint: GET http://localhost:${PORT}/api/search-four`);
  console.log(`Statistics endpoint: GET http://localhost:${PORT}/api/stats`);
  console.log(`Admin endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/admin/login - Admin login`);
  console.log(`  GET http://localhost:${PORT}/api/admin - Get all admins`);
  console.log(`  POST http://localhost:${PORT}/api/admin - Create admin`);
  console.log(`  GET http://localhost:${PORT}/api/admin/:id - Get admin by ID`);
  console.log(`  PUT http://localhost:${PORT}/api/admin/:id - Update admin`);
  console.log(`  DELETE http://localhost:${PORT}/api/admin/:id - Delete admin`);
  console.log(`Voter endpoints:`);
  console.log(`  GET http://localhost:${PORT}/api/voter - Get all voters`);
  console.log(`  GET http://localhost:${PORT}/api/voter/:id - Get voter by ID`);
  console.log(`  PUT http://localhost:${PORT}/api/voter/:id - Update voter`);
  console.log(`  DELETE http://localhost:${PORT}/api/voter/:id - Delete voter`);
  console.log(`  DELETE http://localhost:${PORT}/api/voter - Delete all voters`);
  console.log(`  PATCH http://localhost:${PORT}/api/voter/:id/paid - Update isPaid status`);
  console.log(`  PATCH http://localhost:${PORT}/api/voter/:id/visited - Update isVisited status`);
  console.log(`  PATCH http://localhost:${PORT}/api/voter/:id/status - Update both statuses`);
  console.log(`  GET http://localhost:${PORT}/api/voter/stats - Get voter statistics`);
  console.log(`VoterFour endpoints:`);
  console.log(`  GET http://localhost:${PORT}/api/voterfour - Get all VoterFour records`);
  console.log(`  GET http://localhost:${PORT}/api/voterfour/:id - Get VoterFour by ID`);
  console.log(`  PUT http://localhost:${PORT}/api/voterfour/:id - Update VoterFour`);
  console.log(`  DELETE http://localhost:${PORT}/api/voterfour/:id - Delete VoterFour`);
  console.log(`  DELETE http://localhost:${PORT}/api/voterfour - Delete all VoterFour records`);
  console.log(`  PATCH http://localhost:${PORT}/api/voterfour/:id/paid - Update isPaid status`);
  console.log(`  PATCH http://localhost:${PORT}/api/voterfour/:id/visited - Update isVisited status`);
  console.log(`  PATCH http://localhost:${PORT}/api/voterfour/:id/status - Update both statuses`);
  console.log(`  GET http://localhost:${PORT}/api/voterfour/stats - Get VoterFour statistics`);
  console.log(`Sub Admin endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/subadmin/login - Sub admin login`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin - Get all sub admins`);
  console.log(`  POST http://localhost:${PORT}/api/subadmin - Create sub admin`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin/:id - Get sub admin by ID`);
  console.log(`  PUT http://localhost:${PORT}/api/subadmin/:id - Update sub admin`);
  console.log(`  DELETE http://localhost:${PORT}/api/subadmin/:id - Delete sub admin`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin/:id/assigned-voters - Get assigned voters`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin/:id/stats - Get sub admin statistics`);
  console.log(`Voter Assignment endpoints (Admin only):`);
  console.log(`  POST http://localhost:${PORT}/api/assignment/assign - Assign voters to sub admin`);
  console.log(`  DELETE http://localhost:${PORT}/api/assignment/unassign - Unassign voters from sub admin`);
  console.log(`  GET http://localhost:${PORT}/api/assignment/subadmin/:id - Get sub admin assignments`);
  console.log(`  GET http://localhost:${PORT}/api/assignment/voter/:voterId/:voterType - Get voter assignments`);
  console.log(`  GET http://localhost:${PORT}/api/assignment/stats - Get assignment statistics`);
  console.log(`Sub Admin Voter endpoints (Sub Admin only):`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin/voters - Get assigned voters`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin/voters/search - Search assigned voters`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin/voters/filter - Filter assigned voters`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin/voters/:voterId/:voterType - Get specific assigned voter`);
  console.log(`  PUT http://localhost:${PORT}/api/subadmin/voters/:voterId/:voterType - Update assigned voter`);
  console.log(`  PATCH http://localhost:${PORT}/api/subadmin/voters/:voterId/:voterType/paid - Update payment status`);
  console.log(`  PATCH http://localhost:${PORT}/api/subadmin/voters/:voterId/:voterType/visited - Update visit status`);
  console.log(`  PATCH http://localhost:${PORT}/api/subadmin/voters/:voterId/:voterType/status - Update both statuses`);
  console.log(`  GET http://localhost:${PORT}/api/subadmin/voters/stats - Get assigned voters statistics`);
  console.log(`Alert endpoints:`);
  console.log(`  GET http://localhost:${PORT}/api/alert/published - Get published alerts (public)`);
  console.log(`  GET http://localhost:${PORT}/api/alert/stats - Get alert statistics (public)`);
  console.log(`  GET http://localhost:${PORT}/api/alert - Get all alerts (Admin/SubAdmin)`);
  console.log(`  GET http://localhost:${PORT}/api/alert/:id - Get alert by ID`);
  console.log(`  POST http://localhost:${PORT}/api/alert - Create alert (Admin/SubAdmin)`);
  console.log(`  PUT http://localhost:${PORT}/api/alert/:id - Update alert (Admin/SubAdmin)`);
  console.log(`  DELETE http://localhost:${PORT}/api/alert/:id - Delete alert (Admin/SubAdmin)`);
  console.log(`  DELETE http://localhost:${PORT}/api/alert - Delete all alerts (Admin only)`);
  console.log(`  POST http://localhost:${PORT}/api/alert/:id/images - Upload images to alert (Admin/SubAdmin)`);
  console.log(`  DELETE http://localhost:${PORT}/api/alert/:id/images/:imageId - Delete specific image (Admin/SubAdmin)`);
  console.log(`  PATCH http://localhost:${PORT}/api/alert/:id/publish - Publish alert (Admin/SubAdmin)`);
  console.log(`  PATCH http://localhost:${PORT}/api/alert/:id/unpublish - Unpublish alert (Admin/SubAdmin)`);
  console.log(`Category endpoints:`);
  console.log(`  GET http://localhost:${PORT}/api/category/active - Get active categories (public)`);
  console.log(`  GET http://localhost:${PORT}/api/category/search - Search categories (public)`);
  console.log(`  GET http://localhost:${PORT}/api/category/stats - Get category statistics (public)`);
  console.log(`  GET http://localhost:${PORT}/api/category - Get all categories (Admin/SubAdmin)`);
  console.log(`  GET http://localhost:${PORT}/api/category/:id - Get category by ID`);
  console.log(`  POST http://localhost:${PORT}/api/category - Create category (Admin/SubAdmin)`);
  console.log(`  PUT http://localhost:${PORT}/api/category/:id - Update category (Admin/SubAdmin)`);
  console.log(`  DELETE http://localhost:${PORT}/api/category/:id - Delete category (Admin/SubAdmin)`);
  console.log(`  DELETE http://localhost:${PORT}/api/category - Delete all categories (Admin only)`);
  console.log(`  GET http://localhost:${PORT}/api/category/:id/data - Get data entries for category (Admin/SubAdmin)`);
  console.log(`  POST http://localhost:${PORT}/api/category/:id/data - Add data entry to category (Admin/SubAdmin)`);
  console.log(`  PUT http://localhost:${PORT}/api/category/:id/data/:entryId - Update data entry (Admin/SubAdmin)`);
  console.log(`  DELETE http://localhost:${PORT}/api/category/:id/data/:entryId - Delete data entry (Admin/SubAdmin)`);
  console.log(`  PATCH http://localhost:${PORT}/api/category/:id/data/reorder - Reorder data entries (Admin/SubAdmin)`);
});

module.exports = app;
