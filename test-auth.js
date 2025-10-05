const jwt = require('jsonwebtoken');

// Test authentication function
function testAuth(req, res) {
  try {
    console.log('=== AUTH DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Authorization header:', req.headers.authorization);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        debug: 'Authorization header missing or invalid format'
      });
    }
    
    console.log('✅ Token found:', token.substring(0, 20) + '...');
    
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token decoded successfully');
    console.log('Decoded payload:', decoded);
    console.log('Token type:', decoded.type || 'admin');
    console.log('Expires at:', new Date(decoded.exp * 1000));
    console.log('Is expired:', Date.now() > decoded.exp * 1000);
    
    res.json({
      success: true,
      message: 'Token is valid',
      debug: {
        tokenType: decoded.type || 'admin',
        adminId: decoded.adminId || null,
        subAdminId: decoded.subAdminId || null,
        expiresAt: new Date(decoded.exp * 1000),
        isExpired: Date.now() > decoded.exp * 1000,
        timeUntilExpiry: Math.round((decoded.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24)) + ' days'
      }
    });
    
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        debug: {
          error: error.message,
          expiredAt: new Date(error.expiredAt)
        }
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        debug: {
          error: error.message
        }
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      debug: {
        error: error.message
      }
    });
  }
}

module.exports = { testAuth };
