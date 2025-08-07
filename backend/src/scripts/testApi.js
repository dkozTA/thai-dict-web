const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testDictionaryApi() {
  console.log('🧪 Testing Dictionary API');
  console.log('=======================\n');

  try {
    // Test health endpoint
    console.log('1. Testing API health...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check response:', healthResponse.data);

    // Test search endpoint
    console.log('\n2. Testing search endpoint...');
    const searchTerm = 'กิน'; // "eat" in Thai
    console.log(`   Searching for "${searchTerm}"...`);
    
    const searchResponse = await axios.get(`${API_URL}/dictionary/search`, {
      params: { query: searchTerm }
    });
    
    if (searchResponse.data.success) {
      console.log(`✅ Found ${searchResponse.data.count} results`);
      if (searchResponse.data.count > 0) {
        const firstResult = searchResponse.data.data[0];
        console.log('   Sample result:', {
          word: firstResult.word,
          meaning: firstResult.vietnamese_meaning,
          phonetic: firstResult.phonetic
        });
      }
    } else {
      console.log('❌ Search failed:', searchResponse.data.message);
    }

    // Test categories endpoint
    console.log('\n3. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_URL}/dictionary/categories`);
    
    if (categoriesResponse.data.success) {
      console.log(`✅ Found ${categoriesResponse.data.data.length} categories`);
      console.log('   Categories:', categoriesResponse.data.data.join(', '));
    } else {
      console.log('❌ Categories failed:', categoriesResponse.data.message);
    }

    // Test popular words endpoint
    console.log('\n4. Testing popular words endpoint...');
    const popularResponse = await axios.get(`${API_URL}/dictionary/popular`, {
      params: { limit: 5 }
    });
    
    if (popularResponse.data.success) {
      console.log(`✅ Found ${popularResponse.data.count} popular words`);
      if (popularResponse.data.count > 0) {
        console.log('   Popular words:', popularResponse.data.data.map(w => w.word).join(', '));
      }
    } else {
      console.log('❌ Popular words failed:', popularResponse.data.message);
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response data:', error.response.data);
      console.error('   Status code:', error.response.status);
    }
  }
}

testDictionaryApi();