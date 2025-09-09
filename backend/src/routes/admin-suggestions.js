const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Get all suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const snapshot = await db.collection('suggestions')
      .orderBy('created_at', 'desc')
      .get();
    
    const suggestions = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Fetch user data if available
      let userData = null;
      if (data.userId) {
        const userDoc = await db.collection('user').doc(data.userId).get();
        if (userDoc.exists) {
          userData = {
            id: userDoc.id,
            displayName: userDoc.data().displayName,
            email: userDoc.data().email
          };
        }
      }
      
      // Fetch original word if it's an edit suggestion
      let originalWord = null;
      if (data.type === 'edit_word' && data.wordId) {
        const wordDoc = await db.collection('dictionary').doc(data.wordId).get();
        if (wordDoc.exists) {
          originalWord = {
            id: wordDoc.id,
            ...wordDoc.data()
          };
        }
      }
      
      suggestions.push({
        id: doc.id,
        ...data,
        user: userData,
        original: originalWord,
        created_at: data.created_at?.toDate() || new Date()
      });
    }
    
    return res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Approve a suggestion
router.post('/suggestions/:id/approve', async (req, res) => {
  try {
    const suggestionId = req.params.id;
    const suggestionRef = db.collection('suggestions').doc(suggestionId);
    const suggestionDoc = await suggestionRef.get();
    
    if (!suggestionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    const suggestion = suggestionDoc.data();
    
    // Perform different actions based on suggestion type
    if (suggestion.type === 'new_word') {
      // Add new word to dictionary
      const wordData = {
        word: suggestion.word.word || suggestion.word,
        word_transliterated: suggestion.word.word_transliterated || suggestion.word_transliterated || '',
        vietnamese_meaning: suggestion.word.vietnamese_meaning || suggestion.vietnamese_meaning || '',
        grammar_note: suggestion.word.grammar_note || suggestion.grammar_note || '',
        category: suggestion.word.category || suggestion.category || 'general',
        examples: suggestion.word.examples || suggestion.examples || [],
        search_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
        source: 'user_suggestion'
      };
      
      await db.collection('dictionary').add(wordData);
    } 
    else if (suggestion.type === 'edit_word' && suggestion.wordId) {
      // Update existing word
      const wordRef = db.collection('dictionary').doc(suggestion.wordId);
      const wordDoc = await wordRef.get();
      
      if (!wordDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Word not found for editing'
        });
      }
      
      const updatedWordData = {
        word: suggestion.word.word || suggestion.word,
        word_transliterated: suggestion.word.word_transliterated || suggestion.word_transliterated || wordDoc.data().word_transliterated || '',
        vietnamese_meaning: suggestion.word.vietnamese_meaning || suggestion.vietnamese_meaning || wordDoc.data().vietnamese_meaning || '',
        grammar_note: suggestion.word.grammar_note || suggestion.grammar_note || wordDoc.data().grammar_note || '',
        category: suggestion.word.category || suggestion.category || wordDoc.data().category || 'general',
        examples: suggestion.word.examples || suggestion.examples || wordDoc.data().examples || [],
        updated_at: new Date()
      };
      
      await wordRef.update(updatedWordData);
    }
    
    // Update suggestion status to approved
    await suggestionRef.update({
      status: 'approved',
      processed_at: new Date()
    });
    
    // Notify user if there's a userId attached
    if (suggestion.userId) {
      // Add a notification to user's notifications collection
      await db.collection('user').doc(suggestion.userId).collection('notifications').add({
        type: 'suggestion_approved',
        message: `Góp ý từ của bạn đã được chấp nhận`,
        created_at: new Date(),
        read: false
      });
    }
    
    return res.json({
      success: true,
      message: 'Suggestion approved successfully'
    });
  } catch (error) {
    console.error('Error approving suggestion:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reject a suggestion
router.post('/suggestions/:id/reject', async (req, res) => {
  try {
    const suggestionId = req.params.id;
    const suggestionRef = db.collection('suggestions').doc(suggestionId);
    const suggestionDoc = await suggestionRef.get();
    
    if (!suggestionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    const suggestion = suggestionDoc.data();
    
    // Update suggestion status to rejected
    await suggestionRef.update({
      status: 'rejected',
      processed_at: new Date()
    });
    
    // Notify user if there's a userId attached
    if (suggestion.userId) {
      // Add a notification to user's notifications collection
      await db.collection('user').doc(suggestion.userId).collection('notifications').add({
        type: 'suggestion_rejected',
        message: `Góp ý từ của bạn đã bị từ chối`,
        created_at: new Date(),
        read: false
      });
    }
    
    return res.json({
      success: true,
      message: 'Suggestion rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;