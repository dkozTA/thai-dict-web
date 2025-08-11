const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase-admin');

// Helper function to normalize text for search
const normalizeSearchTerm = (text) => {
  if (!text) return '';
  return decodeURIComponent(text.trim());
};

// Helper function to create search patterns
const createSearchPatterns = (searchTerm) => {
  const patterns = [
    searchTerm, // Original
    searchTerm.toLowerCase(), // Lowercase
    searchTerm.toUpperCase(), // Uppercase
    searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase() // Title case
  ];
  
  return [...new Set(patterns)];
};

// Helper function to extract meaningful parts from Vietnamese meaning
const extractMeaningKeywords = (vietnameseMeaning) => {
  if (!vietnameseMeaning) return [];
  
  // Remove parenthetical content like (vh), (dt), etc.
  let cleanMeaning = vietnameseMeaning.replace(/\([^)]*\)/g, '');
  
  // Split by common delimiters
  const parts = cleanMeaning.split(/[,;:.]/);
  
  // Clean up and filter parts
  const keywords = parts
    .map(part => part.trim())
    .filter(part => part && part.length > 1)
    .filter(part => !part.match(/^\d+$/)); // Remove numbers
  
  return keywords;
};

/**
 * @route   GET /api/dictionary/search
 * @desc    Search for words in dictionary
 * @access  Public
 */
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10, category, searchType = 'all' } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }

    const searchTerm = normalizeSearchTerm(query);
    const searchPatterns = createSearchPatterns(searchTerm);
    let results = [];
    
    console.log('Search term:', searchTerm);
    console.log('Search patterns:', searchPatterns);
    console.log('Search type:', searchType);
    
    // Search by Vietnamese meaning
    if (searchType === 'meaning' || searchType === 'all') {
      const allDocsSnapshot = await db.collection('dictionary').get();
      
      allDocsSnapshot.forEach(doc => {
        if (results.length >= parseInt(limit)) return;
        
        const data = doc.data();
        const vietnameseMeaning = data.vietnamese_meaning || '';
        
        const matchesPattern = searchPatterns.some(pattern => {
          if (vietnameseMeaning.toLowerCase().includes(pattern.toLowerCase())) {
            return true;
          }
          
          const keywords = extractMeaningKeywords(vietnameseMeaning);
          return keywords.some(keyword => 
            keyword.toLowerCase().includes(pattern.toLowerCase()) ||
            pattern.toLowerCase().includes(keyword.toLowerCase())
          );
        });
        
        if (matchesPattern && !results.some(r => r.id === doc.id)) {
          results.push({
            id: doc.id,
            ...data,
            // Add search relevance info
            searchType: 'meaning',
            matchedField: 'vietnamese_meaning'
          });
        }
      });
      
      if (results.length > 0) {
        results.sort((a, b) => {
          const aRelevance = searchPatterns.some(pattern => 
            a.vietnamese_meaning.toLowerCase().startsWith(pattern.toLowerCase())
          ) ? 1 : 0;
          const bRelevance = searchPatterns.some(pattern => 
            b.vietnamese_meaning.toLowerCase().startsWith(pattern.toLowerCase())
          ) ? 1 : 0;
          
          return bRelevance - aRelevance;
        });
      }
    }
    
    // Search by phonetic (word_transliterated field)
    if ((searchType === 'phonetic' || searchType === 'all') && results.length < parseInt(limit)) {
      for (const pattern of searchPatterns) {
        if (results.length >= parseInt(limit)) break;
        
        const phoneticResults = await db.collection('dictionary')
          .where('word_transliterated', '>=', pattern)
          .where('word_transliterated', '<=', pattern + '\uf8ff')
          .limit(parseInt(limit) - results.length)
          .get();
        
        phoneticResults.forEach(doc => {
          if (!results.some(r => r.id === doc.id)) {
            results.push({
              id: doc.id,
              ...doc.data(),
              searchType: 'phonetic',
              matchedField: 'word_transliterated'
            });
          }
        });
        
        const exactPhoneticResults = await db.collection('dictionary')
          .where('word_transliterated', '==', pattern)
          .limit(parseInt(limit) - results.length)
          .get();
        
        exactPhoneticResults.forEach(doc => {
          if (!results.some(r => r.id === doc.id)) {
            results.push({
              id: doc.id,
              ...doc.data(),
              searchType: 'phonetic',
              matchedField: 'word_transliterated'
            });
          }
        });
      }
    }
    
    // Search by Thai word
    if (results.length < parseInt(limit)) {
      for (const pattern of searchPatterns) {
        if (results.length >= parseInt(limit)) break;
        
        const exactResults = await db.collection('dictionary')
          .where('word', '==', pattern)
          .limit(parseInt(limit) - results.length)
          .get();
        
        exactResults.forEach(doc => {
          if (!results.some(r => r.id === doc.id)) {
            results.push({
              id: doc.id,
              ...doc.data(),
              searchType: 'word',
              matchedField: 'word'
            });
          }
        });
        
        if (results.length < parseInt(limit)) {
          const startResults = await db.collection('dictionary')
            .where('word', '>=', pattern)
            .where('word', '<=', pattern + '\uf8ff')
            .limit(parseInt(limit) - results.length)
            .get();
          
          startResults.forEach(doc => {
            if (!results.some(r => r.id === doc.id)) {
              results.push({
                id: doc.id,
                ...doc.data(),
                searchType: 'word',
                matchedField: 'word'
              });
            }
          });
        }
      }
    }

    console.log('Found results:', results.length);

    // Format results for better display
    const formattedResults = results.slice(0, parseInt(limit)).map(result => {
      // Parse examples if they're stored as strings
      let examples = result.examples || [];
      if (typeof examples === 'string') {
        examples = examples.split('\n').filter(ex => ex.trim());
      } else if (Array.isArray(examples)) {
        examples = examples.filter(ex => ex && ex.trim());
      }

      return {
        id: result.id,
        word: result.word || '',
        word_transliterated: result.word_transliterated || '',
        vietnamese_meaning: result.vietnamese_meaning || '',
        examples: examples,
        grammar_note: result.grammar_note || '',
        note: result.note || '',
        category: result.category || 'general',
        searchType: result.searchType || 'unknown',
        matchedField: result.matchedField || 'unknown',
        created_at: result.created_at,
        updated_at: result.updated_at,
        source: result.source || ''
      };
    });

    return res.json({
      success: true,
      count: formattedResults.length,
      data: formattedResults,
      searchTerm: searchTerm,
      searchType: searchType,
      totalFound: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during search',
      error: error.message
    });
  }
});

// Get word by ID
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

    return res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data()
      }
    });
  } catch (error) {
    console.error('Get word error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching word',
      error: error.message
    });
  }
});

// Get popular words
router.get('/popular', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const popularWordsRef = db.collection('dictionary')
      .orderBy('search_count', 'desc')
      .limit(parseInt(limit));
    
    const snapshot = await popularWordsRef.get();
    const words = [];
    
    snapshot.forEach(doc => {
      words.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return res.json({
      success: true,
      data: words
    });
  } catch (error) {
    console.error('Popular words error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching popular words',
      error: error.message
    });
  }
});

module.exports = router;