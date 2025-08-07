const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');

/**
 * @route   GET /api/dictionary/search
 * @desc    Search for words in dictionary
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10, category } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }

    // Ensure proper UTF-8 encoding for Thai characters
    const searchTerm = decodeURIComponent(query.trim().toLowerCase());
    let results = [];
    
    // Step 1: Try exact match search
    const exactResults = await db.collection('dictionary')
      .where('word', '==', searchTerm)
      .limit(parseInt(limit))
      .get();
    
    exactResults.forEach(doc => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Step 2: If not enough results, try starts-with search
    if (results.length < parseInt(limit)) {
      const startResults = await db.collection('dictionary')
        .where('word', '>=', searchTerm)
        .where('word', '<=', searchTerm + '\uf8ff')
        .limit(parseInt(limit) - results.length)
        .get();
      
      startResults.forEach(doc => {
        // Avoid duplicates
        if (!results.some(r => r.id === doc.id)) {
          results.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });
    }

    // Step 3: If still not enough results, try phonetic search
    if (results.length < parseInt(limit)) {
      const phoneticResults = await db.collection('dictionary')
        .where('phonetic', '>=', searchTerm.toUpperCase())
        .where('phonetic', '<=', searchTerm.toUpperCase() + '\uf8ff')
        .limit(parseInt(limit) - results.length)
        .get();
      
      phoneticResults.forEach(doc => {
        // Avoid duplicates
        if (!results.some(r => r.id === doc.id)) {
          results.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });
    }

    // Return results with proper encoding
    res.json({
      success: true,
      count: results.length,
      data: results
    });
    
  } catch (error) {
    console.error('Dictionary search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Other routes remain unchanged
router.get('/word/:id', async (req, res) => {
  try {
    const wordRef = db.collection('dictionary').doc(req.params.id);
    const doc = await wordRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        message: 'Word not found' 
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
    
  } catch (error) {
    console.error('Get word error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const snapshot = await db.collection('dictionary').get();
    const categories = new Set();
    
    snapshot.forEach(doc => {
      const category = doc.data().category;
      if (category) categories.add(category);
    });
    
    res.json({
      success: true,
      data: Array.from(categories).sort()
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const snapshot = await db.collection('dictionary')
      .limit(parseInt(limit))
      .get();
    
    const words = [];
    snapshot.forEach(doc => {
      words.push({
        id: doc.id,
        word: doc.data().word,
        phonetic: doc.data().phonetic,
        vietnamese_meaning: doc.data().vietnamese_meaning
      });
    });
    
    res.json({
      success: true,
      count: words.length,
      data: words
    });
    
  } catch (error) {
    console.error('Get popular words error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;