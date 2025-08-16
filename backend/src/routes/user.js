const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');
const bcrypt = require('bcryptjs');

const COLLECTION = 'user';
const MAX_HISTORY = 30;
const now = () => new Date();

// REGISTER new user  body: { id, email, username, password }
router.post('/register', async (req, res) => {
  try {
    const { id, email, username, password } = req.body;
    if (!id || !email || !username || !password) {
      return res.status(400).json({ success:false, message:'id, email, username, password required' });
    }
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      return res.status(409).json({ success:false, message:'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const data = {
      id,
      email,
      username,
      password: hashed,
      history: {
        search: [],
        translate: []
      },
      notebooks: {},   // notebooks.{notebookId} = { id,name,words:{} }
      created_at: now(),
      updated_at: now()
    };
    await ref.set(data);
    return res.json({ success:true, data: { id, email, username } });
  } catch (e) {
    return res.status(500).json({ success:false, message:e.message });
  }
});

// LOGIN body: { id, password } OR { email, password }
router.post('/login', async (req, res) => {
  try {
    const { id, email, password } = req.body;
    if (!password || (!id && !email)) {
      return res.status(400).json({ success:false, message:'id or email and password required' });
    }
    let queryRef;
    if (id) {
      queryRef = db.collection(COLLECTION).doc(id);
      const snap = await queryRef.get();
      if (!snap.exists) return res.status(404).json({ success:false, message:'User not found' });
      const user = snap.data();
      const ok = await bcrypt.compare(password, user.password || '');
      if (!ok) return res.status(401).json({ success:false, message:'Invalid credentials' });
      return res.json({ success:true, data:{ id:user.id, email:user.email, username:user.username } });
    } else {
      const q = await db.collection(COLLECTION).where('email','==', email).limit(1).get();
      if (q.empty) return res.status(404).json({ success:false, message:'User not found' });
      const snap = q.docs[0];
      const user = snap.data();
      const ok = await bcrypt.compare(password, user.password || '');
      if (!ok) return res.status(401).json({ success:false, message:'Invalid credentials' });
      return res.json({ success:true, data:{ id:user.id, email:user.email, username:user.username } });
    }
  } catch (e) {
    return res.status(500).json({ success:false, message:e.message });
  }
});

// GET /api/user/:id
router.get('/:id', async (req, res) => {
  try {
    const snap = await db.collection(COLLECTION).doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ success:false, message:'User not found' });
    return res.json({ success:true, data:{ id:snap.id, ...snap.data(), password: undefined }});
  } catch (e) {
    return res.status(500).json({ success:false, message:e.message });
  }
});

// UPSERT (fallback) body: { id, email, username? }
router.post('/', async (req, res) => {
  try {
    const { id, email, username } = req.body;
    if (!id || !email) return res.status(400).json({ success:false, message:'id & email required' });
    const ref = db.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    const existing = snap.exists ? snap.data() : {};
    const baseData = {
      id,
      email,
      username: username || existing.username || '',
      history: existing.history || { search: [], translate: [] },
      notebooks: existing.notebooks || {},
      created_at: existing.created_at || now(),
      updated_at: now()
    };
    await ref.set(baseData, { merge:true });
    return res.json({ success:true, data: { id, email, username: baseData.username } });
  } catch (e) {
    return res.status(500).json({ success:false, message:e.message });
  }
});

// ADD search history  body: { term }
router.post('/:id/history/search', async (req, res) => {
  try {
    const { term } = req.body;
    if (!term) return res.status(400).json({ success:false, message:'term required' });
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success:false, message:'User not found' });
    const data = snap.data();
    const current = data.history?.search || [];
    const next = [term, ...current.filter(t=>t!==term)].slice(0, MAX_HISTORY);
    await ref.update({
      'history.search': next,
      updated_at: now()
    });
    return res.json({ success:true, data: next });
  } catch (e) {
    return res.status(500).json({ success:false, message:e.message });
  }
});

// ADD translate history  body: { text }
router.post('/:id/history/translate', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success:false, message:'text required' });
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success:false, message:'User not found' });
    const data = snap.data();
    const current = data.history?.translate || [];
    const next = [text, ...current].slice(0, MAX_HISTORY);
    await ref.update({
      'history.translate': next,
      updated_at: now()
    });
    return res.json({ success:true, data: next });
  } catch (e) {
    return res.status(500).json({ success:false, message:e.message });
  }
});

// CREATE notebook  body: { name, id? }
router.post('/:id/notebooks', async (req, res) => {
  try {
    const { name, id: nbIdInput } = req.body;
    if (!name) return res.status(400).json({ success:false, message:'name required' });
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success:false, message:'User not found' });
    const nbId = nbIdInput || 'nb_' + Date.now();
    const path = `notebooks.${nbId}`;
    await ref.update({
      [path]: { id: nbId, name, words: {}, created_at: now(), updated_at: now() },
      updated_at: now()
    });
    const updated = (await ref.get()).data().notebooks[nbId];
    return res.json({ success:true, data: updated });
  } catch (e) {
    return res.status(500).json({ success:false, message:e.message });
  }
});

// ADD word to notebook
router.post('/:id/notebooks/:nbId/words', async (req, res) => {
  try {
    const { wordId, word, vietnamese_meaning, phonetic='', note='', examples=[] } = req.body;
    if (!wordId || !word) return res.status(400).json({ success:false, message:'wordId & word required' });
    const ref = db.collection(COLLECTION).doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ success:false, message:'User not found' });
    const notebooks = snap.data().notebooks || {};
    if (!notebooks[req.params.nbId]) return res.status(404).json({ success:false, message:'Notebook not found' });
    const path = `notebooks.${req.params.nbId}.words.${wordId}`;
    await ref.update({
      [path]: { id: wordId, word, vietnamese_meaning, phonetic, note, examples, added_at: now() },
      updated_at: now(),
      [`notebooks.${req.params.nbId}.updated_at`]: now()
    });
    const updatedNotebook = (await ref.get()).data().notebooks[req.params.nbId];
    return res.json({ success:true, data: updatedNotebook.words[wordId] });
  } catch (e) {
    return res.status(500).json({ success:false, message:e.message });
  }
});

/**
 * @route   PUT /api/user/:userId/notebooks/:notebookId/words/:wordId
 * @desc    Update a word in a notebook
 * @access  Private
 */
router.put('/:userId/notebooks/:notebookId/words/:wordId', async (req, res) => {
  try {
    const { userId, notebookId, wordId } = req.params;
    const { word, vietnamese_meaning, phonetic, note } = req.body;

    // Get user document
    const userRef = db.collection('user').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    
    // Check if notebook exists
    if (!userData.notebooks || !userData.notebooks[notebookId]) {
      return res.status(404).json({
        success: false,
        message: 'Notebook not found'
      });
    }

    // Check if word exists in notebook
    if (!userData.notebooks[notebookId].words || !userData.notebooks[notebookId].words[wordId]) {
      return res.status(404).json({
        success: false,
        message: 'Word not found in notebook'
      });
    }

    // Update the word
    const updatedWord = {
      ...userData.notebooks[notebookId].words[wordId],
      word: word || userData.notebooks[notebookId].words[wordId].word,
      vietnamese_meaning: vietnamese_meaning || userData.notebooks[notebookId].words[wordId].vietnamese_meaning,
      phonetic: phonetic || userData.notebooks[notebookId].words[wordId].phonetic,
      note: note || userData.notebooks[notebookId].words[wordId].note,
      updated_at: Date.now()
    };

    // Update in database
    await userRef.update({
      [`notebooks.${notebookId}.words.${wordId}`]: updatedWord,
      [`notebooks.${notebookId}.updated_at`]: Date.now()
    });

    res.json({
      success: true,
      data: updatedWord,
      message: 'Word updated successfully'
    });

  } catch (error) {
    console.error('Update word error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update word',
      error: error.message
    });
  }
});

module.exports = router;