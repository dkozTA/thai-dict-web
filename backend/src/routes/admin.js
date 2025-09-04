const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');
const { verifyAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/users', /*verifyAdmin,*/ async (req, res) => {
  try {
    const snapshot = await db.collection('user').get();
    const users = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      // Remove sensitive data before sending to client
      if (userData.password) delete userData.password;
      
      users.push({ 
        id: doc.id, 
        ...userData,
        // Format timestamps for frontend display
        created_at: userData.created_at ? userData.created_at.toDate() : null,
        updated_at: userData.updated_at ? userData.updated_at.toDate() : null,
        last_login: userData.last_login ? userData.last_login.toDate() : null
      });
    });
    
    return res.json({ 
      success: true, 
      data: users 
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Admin
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'moderator', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    await db.collection('user').doc(req.params.id).update({
      role,
      updated_at: new Date()
    });
    
    return res.json({ success: true, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/admin/users/:id/toggle-active
 * @desc    Toggle user active status
 * @access  Admin
 */
router.put('/users/:id/toggle-active', async (req, res) => {
  try {
    const userRef = db.collection('user').doc(req.params.id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const userData = userDoc.data();
    const currentStatus = userData.isActive === true || userData.isActive === 'yes';
    
    await userRef.update({
      isActive: !currentStatus,
      updated_at: new Date()
    });
    
    return res.json({ 
      success: true, 
      message: `User ${currentStatus ? 'deactivated' : 'activated'} successfully` 
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;