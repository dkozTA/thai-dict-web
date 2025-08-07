const { db } = require('../config/firebase-admin');

async function validateImport() {
  try {
    console.log('🔍 Validating imported data...\n');
    
    const snapshot = await db.collection('dictionary').get();
    
    console.log(`📊 Total documents: ${snapshot.size}`);
    
    // Sample documents
    const sampleDocs = [];
    const categories = {};
    const sources = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Collect samples
      if (sampleDocs.length < 5) {
        sampleDocs.push({ id: doc.id, ...data });
      }
      
      // Count by category
      const category = data.category || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
      
      // Count by source
      const source = data.source || 'unknown';
      sources[source] = (sources[source] || 0) + 1;
    });
    
    console.log('\n📝 Sample documents:');
    sampleDocs.forEach((doc, index) => {
      console.log(`${index + 1}. Word: "${doc.word}"`);
      console.log(`   Phonetic: "${doc.phonetic}"`);
      console.log(`   Meaning: "${doc.vietnamese_meaning?.substring(0, 50)}${doc.vietnamese_meaning?.length > 50 ? '...' : ''}"`);
      console.log(`   Examples: ${doc.examples?.length || 0}`);
      console.log(`   Category: ${doc.category}`);
      console.log('');
    });
    
    console.log('📂 Documents by category:');
    Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}`);
      });
    
    console.log('\n📊 Documents by source:');
    Object.entries(sources).forEach(([source, count]) => {
      console.log(`   ${source}: ${count}`);
    });
    
    // Check data quality
    console.log('\n🔍 Data Quality Check:');
    let emptyMeanings = 0;
    let noExamples = 0;
    let noPhonetic = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.vietnamese_meaning || data.vietnamese_meaning.trim() === '') emptyMeanings++;
      if (!data.examples || data.examples.length === 0) noExamples++;
      if (!data.phonetic || data.phonetic.trim() === '') noPhonetic++;
    });
    
    console.log(`   Empty meanings: ${emptyMeanings}`);
    console.log(`   No examples: ${noExamples}`);
    console.log(`   No phonetic: ${noPhonetic}`);
    
    console.log('\n✅ Validation completed!');
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
  }
}

if (require.main === module) {
  validateImport();
}

module.exports = validateImport;