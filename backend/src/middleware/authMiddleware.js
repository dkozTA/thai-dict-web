const { admin, db } = require('../config/firebase-admin');

// Verify user is authenticated
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Verify user has admin role
const verifyAdmin = async (req, res, next) => {
  try {
    // For development, you can temporarily disable auth checks
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_ADMIN_AUTH === 'true') {
      console.warn('⚠️ Admin auth check disabled in development mode');
      return next();
    }

    // First verify they're authenticated
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    // Then check role in Firestore
    const userDoc = await db.collection('user').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const userData = userDoc.data();
    if (userData.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { verifyAuth, verifyAdmin };