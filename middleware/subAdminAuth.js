const jwt = require('jsonwebtoken');
const SubAdmin = require('../models/SubAdmin');

// Sub Admin JWT Authentication Middleware
const authenticateSubAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token is for sub admin
    if (decoded.type !== 'subadmin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Check if sub admin still exists and is active
    const subAdmin = await SubAdmin.findById(decoded.subAdminId);
    if (!subAdmin || !subAdmin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Add sub admin info to request object
    req.subAdmin = subAdmin.getPublicProfile();
    req.subAdminId = decoded.subAdminId;
    req.subAdminUserId = decoded.userId;
    next();
  } catch (error) {
    console.error('Sub admin auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Optional sub admin authentication middleware (doesn't fail if no token)
const optionalSubAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.subAdmin = null;
      req.subAdminId = null;
      req.subAdminUserId = null;
      return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type === 'subadmin') {
      const subAdmin = await SubAdmin.findById(decoded.subAdminId);
      if (subAdmin && subAdmin.isActive) {
        req.subAdmin = subAdmin.getPublicProfile();
        req.subAdminId = decoded.subAdminId;
        req.subAdminUserId = decoded.userId;
      } else {
        req.subAdmin = null;
        req.subAdminId = null;
        req.subAdminUserId = null;
      }
    } else {
      req.subAdmin = null;
      req.subAdminId = null;
      req.subAdminUserId = null;
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    req.subAdmin = null;
    req.subAdminId = null;
    req.subAdminUserId = null;
    next();
  }
};

// Middleware to check if sub admin has access to specific voter
const checkVoterAccess = async (req, res, next) => {
  try {
    const { voterId, voterType } = req.params;
    const subAdminId = req.subAdminId;

    if (!voterId || !voterType) {
      return res.status(400).json({
        success: false,
        message: 'Voter ID and voter type are required'
      });
    }

    // Check if voter is assigned to this sub admin
    const VoterAssignment = require('../models/VoterAssignment');
    const assignment = await VoterAssignment.findOne({
      subAdminId,
      voterId,
      voterType,
      isActive: true
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Voter not assigned to you'
      });
    }

    next();
  } catch (error) {
    console.error('Check voter access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking voter access',
      error: error.message
    });
  }
};

module.exports = {
  authenticateSubAdmin,
  optionalSubAdminAuth,
  checkVoterAccess
};
