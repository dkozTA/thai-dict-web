const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');

/**
 * @route   GET /api/shared-notebooks
 * @desc    Get all publicly shared notebooks
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('shared_notebooks')
      .where('visibility', '==', 'public')
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();
    
    const notebooks = [];
    
    snapshot.forEach(doc => {
      notebooks.push({
        id: doc.id,
        ...doc.data(),
        wordCount: Object.keys(doc.data().words || {}).length
      });
    });
    
    return res.json({
      success: true,
      data: notebooks
    });
  } catch (error) {
    console.error('Error getting shared notebooks:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/shared-notebooks/:id
 * @desc    Get a specific shared notebook
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('shared_notebooks').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Shared notebook not found'
      });
    }
    
    // Increment view count
    await doc.ref.update({
      views: (doc.data().views || 0) + 1
    });
    
    return res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        views: (doc.data().views || 0) + 1
      }
    });
  } catch (error) {
    console.error('Error getting shared notebook:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;