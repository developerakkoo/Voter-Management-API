const Alert = require('../models/Alert');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for multiple image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/alerts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'alert-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 10 // Maximum 10 images per alert
  }
});

// Middleware for handling multiple image uploads
const uploadImages = upload.array('images', 10);

// GET /api/alert - Get all alerts with pagination and filtering
const getAllAlerts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isActive, 
      isPublished,
      priority,
      category,
      targetAudience,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (priority) filter.priority = priority;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (targetAudience) filter.targetAudience = targetAudience;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [alerts, totalCount] = await Promise.all([
      Alert.find(filter)
        .populate('createdBy', 'email')
        .populate('lastUpdatedBy', 'email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Alert.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: alerts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

// GET /api/alert/:id - Get alert by ID
const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('createdBy', 'email')
      .populate('lastUpdatedBy', 'email');
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Increment view count
    await alert.incrementView();
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Get alert by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert',
      error: error.message
    });
  }
};

// POST /api/alert - Create new alert
const createAlert = async (req, res) => {
  try {
    const {
      title,
      description,
      link,
      priority = 'medium',
      category = 'general',
      targetAudience = 'all',
      tags = [],
      expiresAt,
      metadata = {}
    } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    // Parse link if provided
    let parsedLink = null;
    if (link) {
      try {
        parsedLink = typeof link === 'string' ? JSON.parse(link) : link;
      } catch (error) {
        parsedLink = { url: link, text: 'View Details' };
      }
    }
    
    // Parse tags if provided as string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (error) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }
    
    // Create new alert
    const alert = new Alert({
      title,
      description,
      link: parsedLink,
      priority,
      category,
      targetAudience,
      tags: parsedTags,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      metadata,
      createdBy: req.adminId || req.subAdminId
    });
    
    await alert.save();
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
};

// PUT /api/alert/:id - Update alert
const updateAlert = async (req, res) => {
  try {
    const alertId = req.params.id;
    const updateData = req.body;
    
    // Check if alert exists
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Parse link if provided
    if (updateData.link) {
      try {
        updateData.link = typeof updateData.link === 'string' ? JSON.parse(updateData.link) : updateData.link;
      } catch (error) {
        updateData.link = { url: updateData.link, text: 'View Details' };
      }
    }
    
    // Parse tags if provided
    if (updateData.tags) {
      if (typeof updateData.tags === 'string') {
        try {
          updateData.tags = JSON.parse(updateData.tags);
        } catch (error) {
          updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
        }
      }
    }
    
    // Parse expiresAt if provided
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }
    
    // Add lastUpdatedBy
    updateData.lastUpdatedBy = req.adminId || req.subAdminId;
    
    const updatedAlert = await Alert.findByIdAndUpdate(
      alertId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'email').populate('lastUpdatedBy', 'email');
    
    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: updatedAlert
    });
  } catch (error) {
    console.error('Update alert error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating alert',
      error: error.message
    });
  }
};

// DELETE /api/alert/:id - Delete alert
const deleteAlert = async (req, res) => {
  try {
    const alertId = req.params.id;
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Delete associated image files
    for (const image of alert.images) {
      const imagePath = image.path;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Alert.findByIdAndDelete(alertId);
    
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message
    });
  }
};

// DELETE /api/alert - Delete all alerts (for testing/reset)
const deleteAllAlerts = async (req, res) => {
  try {
    // Get all alerts to delete their images
    const alerts = await Alert.find({});
    
    // Delete all image files
    for (const alert of alerts) {
      for (const image of alert.images) {
        const imagePath = image.path;
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
    
    const result = await Alert.deleteMany({});
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} alerts`
    });
  } catch (error) {
    console.error('Delete all alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all alerts',
      error: error.message
    });
  }
};

// POST /api/alert/:id/images - Upload images to alert
const uploadAlertImages = async (req, res) => {
  try {
    const alertId = req.params.id;
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Handle image upload
    uploadImages(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Image upload error',
          error: err.message
        });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images uploaded'
        });
      }
      
      // Process uploaded images
      const imageData = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      }));
      
      // Add images to alert
      alert.images.push(...imageData);
      await alert.save();
      
      res.json({
        success: true,
        message: `Successfully uploaded ${imageData.length} images`,
        data: {
          alertId: alert._id,
          images: imageData,
          totalImages: alert.images.length
        }
      });
    });
  } catch (error) {
    console.error('Upload alert images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// DELETE /api/alert/:id/images/:imageId - Delete specific image from alert
const deleteAlertImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    const image = alert.images.id(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Delete image file
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }
    
    // Remove image from alert
    await alert.removeImage(imageId);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        alertId: alert._id,
        remainingImages: alert.images.length
      }
    });
  } catch (error) {
    console.error('Delete alert image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// PATCH /api/alert/:id/publish - Publish alert
const publishAlert = async (req, res) => {
  try {
    const alertId = req.params.id;
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    await alert.publish();
    
    res.json({
      success: true,
      message: 'Alert published successfully',
      data: alert
    });
  } catch (error) {
    console.error('Publish alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing alert',
      error: error.message
    });
  }
};

// PATCH /api/alert/:id/unpublish - Unpublish alert
const unpublishAlert = async (req, res) => {
  try {
    const alertId = req.params.id;
    
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    await alert.unpublish();
    
    res.json({
      success: true,
      message: 'Alert unpublished successfully',
      data: alert
    });
  } catch (error) {
    console.error('Unpublish alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unpublishing alert',
      error: error.message
    });
  }
};

// GET /api/alert/published - Get published alerts
const getPublishedAlerts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      targetAudience = 'all',
      priority,
      category,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter criteria
    const filter = {};
    if (targetAudience !== 'all') {
      filter.$or = [
        { targetAudience: 'all' },
        { targetAudience: targetAudience }
      ];
    }
    if (priority) filter.priority = priority;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [alerts, totalCount] = await Promise.all([
      Alert.getPublishedAlerts(filter)
        .populate('createdBy', 'email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Alert.countDocuments({ ...filter, isPublished: true, isActive: true })
    ]);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: alerts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get published alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching published alerts',
      error: error.message
    });
  }
};

// GET /api/alert/stats - Get alert statistics
const getAlertStats = async (req, res) => {
  try {
    const [
      totalAlerts,
      publishedAlerts,
      activeAlerts,
      priorityStats,
      categoryStats,
      recentAlerts
    ] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ isPublished: true }),
      Alert.countDocuments({ isActive: true }),
      Alert.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Alert.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Alert.find({ isPublished: true })
        .sort({ publishedAt: -1 })
        .limit(5)
        .populate('createdBy', 'email')
        .lean()
    ]);
    
    res.json({
      success: true,
      data: {
        totalAlerts,
        publishedAlerts,
        activeAlerts,
        priorityStats,
        categoryStats,
        recentAlerts
      }
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  deleteAllAlerts,
  uploadAlertImages,
  deleteAlertImage,
  publishAlert,
  unpublishAlert,
  getPublishedAlerts,
  getAlertStats
};
