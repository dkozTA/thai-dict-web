const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');

/**
 * @route   POST /api/user/:userId/suggestions/new-word
 * @desc    Submit a suggestion for a new word
 */
router.post('/:userId/suggestions/new-word', async (req, res) => {
  try {
    const { userId } = req.params;
    const { word, note } = req.body;
    
    if (!word || !word.word || !word.vietnamese_meaning) {
      return res.status(400).json({
        success: false,
        message: 'Word text and meaning are required'
      });
    }
    
    // Create the suggestion
    const suggestionData = {
      type: 'new_word',
      word,
      userId,
      note: note || '',
      status: 'pending',
      created_at: new Date()
    };
    
    const suggestionRef = await db.collection('suggestions').add(suggestionData);
    
    // Add a notification for admin users (optional)
    const adminSnapshot = await db.collection('user').where('role', '==', 'admin').get();
    adminSnapshot.forEach(async (adminDoc) => {
      await db.collection('user').doc(adminDoc.id).collection('notifications').add({
        type: 'new_suggestion',
        message: 'Có góp ý từ mới chờ duyệt',
        created_at: new Date(),
        read: false
      });
    });
    
    return res.json({
      success: true,
      data: {
        id: suggestionRef.id,
        ...suggestionData
      },
      message: 'Cảm ơn bạn đã đóng góp từ mới. Góp ý của bạn đang chờ được duyệt.'
    });
  } catch (error) {
    console.error('Error submitting new word suggestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting suggestion'
    });
  }
});

/**
 * @route   POST /api/user/:userId/suggestions/edit-word
 * @desc    Submit a suggestion to edit an existing word
 */
router.post('/:userId/suggestions/edit-word', async (req, res) => {
  try {
    const { userId } = req.params;
    const { wordId, word, note } = req.body;
    
    if (!wordId || !word) {
      return res.status(400).json({
        success: false,
        message: 'Word ID and updated word data are required'
      });
    }
    
    // Verify the original word exists
    const wordRef = db.collection('dictionary').doc(wordId);
    const wordDoc = await wordRef.get();
    
    if (!wordDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Original word not found'
      });
    }
    
    // Create the suggestion
    const suggestionData = {
      type: 'edit_word',
      wordId,
      original: {
        id: wordId,
        ...wordDoc.data()
      },
      word, // The updated word data
      userId,
      note: note || '',
      status: 'pending',
      created_at: new Date()
    };
    
    const suggestionRef = await db.collection('suggestions').add(suggestionData);
    
    // Add a notification for admin users (optional)
    const adminSnapshot = await db.collection('user').where('role', '==', 'admin').get();
    adminSnapshot.forEach(async (adminDoc) => {
      await db.collection('user').doc(adminDoc.id).collection('notifications').add({
        type: 'new_suggestion',
        message: 'Có góp ý chỉnh sửa từ chờ duyệt',
        created_at: new Date(),
        read: false
      });
    });
    
    return res.json({
      success: true,
      data: {
        id: suggestionRef.id,
        ...suggestionData
      },
      message: 'Cảm ơn bạn đã góp ý chỉnh sửa. Góp ý của bạn đang chờ được duyệt.'
    });
  } catch (error) {
    console.error('Error submitting edit suggestion:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting suggestion'
    });
  }
});

/**
 * @route   POST /api/user/:userId/suggestions/translation
 * @desc    Submit feedback about an incorrect translation
 */
router.post('/:userId/suggestions/translation', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      originalText,
      translatedText,
      sourceLanguage,
      feedback
    } = req.body;
    
    if (!originalText || !translatedText || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Original text, translated text, and feedback are required'
      });
    }
    
    // Create the suggestion
    const suggestionData = {
      type: 'translation_feedback',
      originalText,
      translatedText,
      sourceLanguage,
      feedback,
      userId,
      status: 'pending',
      created_at: new Date()
    };
    
    const suggestionRef = await db.collection('suggestions').add(suggestionData);
    
    // Notify admins
    const adminSnapshot = await db.collection('user').where('role', '==', 'admin').get();
    adminSnapshot.forEach(async (adminDoc) => {
      await db.collection('user').doc(adminDoc.id).collection('notifications').add({
        type: 'translation_feedback',
        message: 'Có góp ý về bản dịch',
        created_at: new Date(),
        read: false
      });
    });
    
    return res.json({
      success: true,
      message: 'Cảm ơn bạn đã góp ý về bản dịch.'
    });
  } catch (error) {
    console.error('Error submitting translation feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback'
    });
  }
});

module.exports = router;