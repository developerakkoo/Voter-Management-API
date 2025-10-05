const jwt = require('jsonwebtoken');

// Debug script to check token expiration
function debugToken(token) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('Token decoded successfully:');
    console.log('- Admin ID:', decoded.adminId || 'Not present');
    console.log('- SubAdmin ID:', decoded.subAdminId || 'Not present');
    console.log('- Token Type:', decoded.type || 'admin');
    console.log('- Issued At:', new Date(decoded.iat * 1000));
    console.log('- Expires At:', new Date(decoded.exp * 1000));
    console.log('- Is Expired:', Date.now() > decoded.exp * 1000);
    console.log('- Time Until Expiry:', Math.round((decoded.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24)), 'days');
    
    return decoded;
  } catch (error) {
    console.error('Token error:', error.message);
    if (error.name === 'TokenExpiredError') {
      console.log('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token format');
    }
    return null;
  }
}

// Usage: node debug-token.js "your-token-here"
if (process.argv[2]) {
  debugToken(process.argv[2]);
} else {
  console.log('Usage: node debug-token.js "your-jwt-token"');
}
