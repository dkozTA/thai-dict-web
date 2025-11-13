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
    const userId = req.params.id;
    const adminId = req.user.uid;
    
    // Cant derole own account
    if (userId === adminId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Không thể thay đổi quyền của chính bạn' 
      });
    }
    
    if (!['user', 'moderator', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }
    
    // Cant derole other admin account
    if (role !== 'admin') {
      const userDoc = await db.collection('user').doc(userId).get();
      
      if (userDoc.exists && userDoc.data().role === 'admin') {
        // Count admin
        const adminSnapshot = await db.collection('user')
          .where('role', '==', 'admin')
          .get();
          
        if (adminSnapshot.size <= 1) {
          return res.status(403).json({
            success: false,
            message: 'Không thể hạ quyền admin cuối cùng trong hệ thống'
          });
        }
      }
    }
    
    // update role
    await db.collection('user').doc(userId).update({
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

/**
 * @route   GET /api/admin/users/recent
 * @desc    Get recent users
 * @access  Admin
 */
router.get('/users/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const recentUsersRef = db.collection('user')
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit));
    
    const snapshot = await recentUsersRef.get();
    const users = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      // Remove sensitive data
      if (userData.password) delete userData.password;
      
      users.push({
        id: doc.id,
        displayName: userData.displayName || userData.username || 'User',
        email: userData.email || '',
        role: userData.role || 'user',
        created_at: userData.created_at?.toDate() || new Date()
      });
    });
    
    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error getting recent users:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Admin
 */
router.get('/users/stats', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('user').get();
    let totalUsers = 0;
    let activeUsers = 0;
    
    // Calculate 30 days ago for new users count
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let newUsers = 0;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      totalUsers++;
      
      // Count active users
      if (userData.isActive !== false) {
        activeUsers++;
      }
      
      // Count new users in the last 30 days
      if (userData.created_at && 
          userData.created_at.toDate && 
          userData.created_at.toDate() >= thirtyDaysAgo) {
        newUsers++;
      }
    });
    
    return res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsers
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;