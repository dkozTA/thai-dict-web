const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Get all dictionary words with pagination and search
router.get('/dictionary', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = 'all' } = req.query;
    
    let query = db.collection('dictionary');
    
    // Apply category filter if specified
    if (category !== 'all') {
      query = query.where('category', '==', category);
    }
    
    // Get total count (inefficient but necessary for pagination)
    const snapshot = await query.get();
    const totalItems = snapshot.size;
    
    // Apply pagination
    const startAt = (parseInt(page) - 1) * parseInt(limit);
    const querySnapshot = await query
      .orderBy('updated_at', 'desc')
      .limit(parseInt(limit))
      .offset(startAt)
      .get();
    
    const words = [];
    
    querySnapshot.forEach(doc => {
      const wordData = doc.data();
      
      // Apply search filter client-side (not ideal but works for now)
      if (search) {
        const searchLower = search.toLowerCase();
        const wordMatch = wordData.word?.toLowerCase().includes(searchLower);
        const transliteratedMatch = wordData.word_transliterated?.toLowerCase().includes(searchLower);
        const meaningMatch = wordData.vietnamese_meaning?.toLowerCase().includes(searchLower);
        
        if (!wordMatch && !transliteratedMatch && !meaningMatch) {
          return;
        }
      }
      
      words.push({
        id: doc.id,
        ...wordData,
        created_at: wordData.created_at?.toDate() || new Date(),
        updated_at: wordData.updated_at?.toDate() || new Date()
      });
    });
    
    return res.json({
      success: true,
      data: words,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalItems / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting dictionary words:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add a new word
router.post('/dictionary', async (req, res) => {
  try {
    const { word, word_transliterated, vietnamese_meaning, grammar_note, category, examples } = req.body;
    
    if (!word || !vietnamese_meaning) {
      return res.status(400).json({
        success: false,
        message: 'Word and meaning are required'
      });
    }
    
    const newWord = {
      word,
      word_transliterated: word_transliterated || '',
      vietnamese_meaning,
      grammar_note: grammar_note || '',
      category: category || 'general',
      examples: examples || [],
      search_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const wordRef = await db.collection('dictionary').add(newWord);
    
    return res.json({
      success: true,
      data: {
        id: wordRef.id,
        ...newWord
      },
      message: 'Word added successfully'
    });
  } catch (error) {
    console.error('Error adding word:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update a word
router.put('/dictionary/:id', async (req, res) => {
  try {
    const wordId = req.params.id;
    const { word, word_transliterated, vietnamese_meaning, grammar_note, category, examples } = req.body;
    
    if (!word || !vietnamese_meaning) {
      return res.status(400).json({
        success: false,
        message: 'Word and meaning are required'
      });
    }
    
    const wordRef = db.collection('dictionary').doc(wordId);
    const wordDoc = await wordRef.get();
    
    if (!wordDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }
    
    const updatedWord = {
      word,
      word_transliterated: word_transliterated || '',
      vietnamese_meaning,
      grammar_note: grammar_note || '',
      category: category || 'general',
      examples: examples || [],
      updated_at: new Date()
    };
    
    await wordRef.update(updatedWord);
    
    return res.json({
      success: true,
      data: {
        id: wordId,
        ...updatedWord
      },
      message: 'Word updated successfully'
    });
  } catch (error) {
    console.error('Error updating word:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a word
router.delete('/dictionary/:id', async (req, res) => {
  try {
    const wordId = req.params.id;
    const wordRef = db.collection('dictionary').doc(wordId);
    const wordDoc = await wordRef.get();
    
    if (!wordDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Word not found'
      });
    }
    
    await wordRef.delete();
    
    return res.json({
      success: true,
      message: 'Word deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting word:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get recent words
router.get('/dictionary/recent', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const recentWordsRef = db.collection('dictionary')
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit));
    
    const snapshot = await recentWordsRef.get();
    const words = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      words.push({
        id: doc.id,
        word: data.word || '',
        vietnamese_meaning: data.vietnamese_meaning || '',
        category: data.category || 'general',
        created_at: data.created_at?.toDate() || new Date()
      });
    });

    return res.json({
      success: true,
      data: words
    });
  } catch (error) {
    console.error('Recent words error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get dictionary statistics
router.get('/dictionary/stats', async (req, res) => {
  try {
    // Get word count
    const wordsSnapshot = await db.collection('dictionary').get();
    
    // Count categories
    const categories = new Set();
    let totalSearches = 0;
    
    wordsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
      
      // Sum up total searches
      totalSearches += (data.search_count || 0);
    });
    
    // Get search logs from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const searchLogsSnapshot = await db.collection('search_logs')
      .where('timestamp', '>=', thirtyDaysAgo)
      .get();
    
    const recentSearches = searchLogsSnapshot.size;
    
    return res.json({
      success: true,
      data: {
        totalWords: wordsSnapshot.size,
        totalCategories: categories.size,
        totalSearches: totalSearches,
        recentSearches: recentSearches
      }
    });
  } catch (error) {
    console.error('Error getting dictionary stats:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;