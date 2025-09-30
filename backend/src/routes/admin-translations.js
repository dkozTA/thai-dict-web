const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');
const { verifyAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/translations/feedback
 * @desc    Get all translation feedback reports
 * @access  Admin
 */
router.get('/translations/feedback', async (req, res) => {
  try {
    // Get filter parameters
    const { status = 'all' } = req.query;
    
    // Query suggestions collection with type filter
    let query = db.collection('suggestions')
      .where('type', '==', 'translation_feedback');
    
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    // Add ordering
    query = query.orderBy('created_at', 'desc');
    
    // Get all feedback
    const snapshot = await query.get();
    const feedback = [];
    
    snapshot.forEach(doc => {
      feedback.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().created_at?.toDate() || new Date()
      });
    });
    
    return res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching translation feedback:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/translations/feedback/:id
 * @desc    Update translation feedback status
 * @access  Admin
 */
router.patch('/translations/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    
    // Update in suggestions collection
    const feedbackRef = db.collection('suggestions').doc(id);
    await feedbackRef.update({
      status,
      adminNote,
      reviewedAt: new Date()
    });
    
    return res.json({
      success: true,
      message: 'Translation feedback updated successfully'
    });
  } catch (error) {
    console.error('Error updating translation feedback:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;