const XLSX = require('xlsx');
const { db } = require('../config/firebase-admin');
const path = require('path');
const fs = require('fs');

// Import Thai text handler utilities - make sure this file exists
const { 
  containsThaiCharacters, 
  normalizeThaiText,
  transliteratedToThai 
} = require('../utils/thaiTextHandler');

class ExcelImporter {
  constructor() {
    this.collection = db.collection('dictionary');
    this.processedCount = 0;
    this.errorCount = 0;
    this.errors = [];
    this.MAX_IMPORT_LIMIT = 1000; // Import limit
  }

  // Add your existing methods here...
  
  // Clean text and handle character encoding
  cleanText(text) {
    if (!text) return '';
    
    // Handle potential HTML entities in Thai text
    const decodedText = text.toString()
      .replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/ig, (match, entity) => {
        switch (entity) {
          case 'amp': return '&';
          case 'lt': return '<';
          case 'gt': return '>';
          case 'quot': return '"';
          case 'apos': return "'";
          default:
            if (entity.charAt(0) === '#') {
              const code = entity.charAt(1).toLowerCase() === 'x'
                ? parseInt(entity.substring(2), 16)
                : parseInt(entity.substring(1), 10);
              return String.fromCharCode(code);
            }
            return match;
        }
      });
      
    // Normalize Thai characters
    return decodedText.trim().replace(/\s+/g, ' ');
  }
  
  // Add other methods like parseColumnC, extractMainMeaning, etc.
  parseColumnC(text) {
    const result = {
      phonetic: '',
      grammar_note: '',
      mainMeaning: '',
      examples: []  // array of { phrase, meaning }
    };
    if (!text) return result;

    let work = text.trim().replace(/\s+/g, ' ');

    // 1. Extract leading phonetic (uppercase Vietnamese letters & spaces)
    const UPPER_VIET = 'A-ZĐÁÀẢÃẠÂẦẤẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊỀẾỂỄỆÍÌỈĨỊÓÒỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÚÙỦŨỤƯỪỨỬỮỰÝỲỶỸỴ';
    const phoneticRe = new RegExp(`^([${UPPER_VIET}][${UPPER_VIET}\\s]*)`);
    const phoneticMatch = work.match(phoneticRe);
    if (phoneticMatch) {
      result.phonetic = phoneticMatch[1].trim().replace(/\s+/g, ' ');
      work = work.slice(phoneticMatch[0].length).trim();
    }

    // 2. Extract optional grammar note in parentheses immediately after
    const grammarMatch = work.match(/^\(([^\)]+)\)\s*/);
    if (grammarMatch) {
      result.grammar_note = grammarMatch[1].trim();
      work = work.slice(grammarMatch[0].length).trim();
    }

    // 3. Find example pairs of form "<phrase>: <meaning>"
    // Accept both uppercase/lowercase phrase parts (transliteration / mixed) before colon
    // We capture Vietnamese meaning up to a period OR end OR next numbered sense.
    const examplePairs = [];
    const exampleRe = /([^:.]+?):\s*([^.:]+(?:\.[^0-9]|$|))/g;
    let exMatch;
    // To avoid removing parts inside enumerated definitions (1. 2. etc.), collect indices.
    while ((exMatch = exampleRe.exec(work)) !== null) {
      const phrase = exMatch[1].trim();
      const meaning = exMatch[2].trim().replace(/[.;]+$/,'');
      if (phrase && meaning && meaning.length > 1) {
        examplePairs.push({ phrase, meaning, start: exMatch.index, end: exampleRe.lastIndex });
      }
    }

    // 4. Remove example substrings (from end to start to preserve indices)
    if (examplePairs.length) {
      let mutable = work;
      examplePairs.sort((a,b)=>b.start-a.start).forEach(p=>{
        mutable = mutable.slice(0,p.start).trim() + ' ' + mutable.slice(p.end).trim();
      });
      work = mutable.replace(/\s+/g,' ').trim();
    }

    // 5. Enumerated senses: split by patterns "1." "2." etc.
    // Keep them joined as mainMeaning; we do not split into separate records here.
    // If no enumeration, main meaning is remaining text up to first extra trailing period.
    if (/^\d+\./.test(work)) {
      // Reconstruct enumerated senses cleanly
      const senses = work.split(/(?=\d+\.)/).map(s=>s.trim()).filter(Boolean);
      result.mainMeaning = senses.join(' ');
    } else {
      // If first token after phonetic looks like a single Vietnamese word (likely direct gloss),
      // capture it when examples existed (case like "BÁ vai Bá dăn tin pau: ...")
      if (examplePairs.length && work) {
        const firstWord = work.split(/\s+/)[0];
        // If remaining minus first word is very short, just take firstWord.
        result.mainMeaning = firstWord.replace(/[.,;]+$/,'');
        // Remove that word from remaining tail (not used further now)
      } else {
        result.mainMeaning = work.replace(/[.;\s]+$/,'');
      }
    }

    // 6. Attach example pairs
    result.examples = examplePairs.map(p => ({
      phrase_transliterated: p.phrase,
      example_meaning: p.meaning
    }));

    // Final cleanups
    if (!result.mainMeaning) result.mainMeaning = result.phonetic ? '' : 'Chưa có nghĩa';

    return result;
  }
  // Process a row from Excel to create a document object
  processRow(row, index) {
    try {
      const thaiWord = this.cleanText(row[0]);
      const thaiExamplesRaw = this.cleanText(row[1]);
      const columnC = this.cleanText(row[2]);

      if (!thaiWord || !columnC) return null;

      const parsed = this.parseColumnC(columnC);

      // Merge examples: Thai examples from column B + parsed example pairs
      const mergedExamples = [];

      if (thaiExamplesRaw) {
        // Split numbered examples in Column B (e.g., "1. ... 2. ...")
        const splitThai = thaiExamplesRaw.split(/\d+\.\s*/).map(s=>s.trim()).filter(s=>s);
        if (splitThai.length) mergedExamples.push(...splitThai);
        else mergedExamples.push(thaiExamplesRaw);
      }

      parsed.examples.forEach(ex => {
        mergedExamples.push(`${ex.phrase_transliterated}: ${ex.example_meaning}`);
      });

      const document = {
        word: thaiWord,
        word_transliterated: parsed.phonetic || thaiWord,
        vietnamese_meaning: parsed.mainMeaning || columnC || 'Chưa có nghĩa',
        examples: mergedExamples,
        grammar_note: parsed.grammar_note || '',
        note: '',
        category: 'general',
        created_at: new Date(),
        updated_at: new Date(),
        source: 'excel_import'
      };

      if (!document.word) throw new Error('Missing required field: word');

      return document;
    } catch (error) {
      this.errors.push({ row, error: error.message });
      return null;
    }
  }

  // THIS IS THE CRITICAL METHOD THAT NEEDS TO BE IMPLEMENTED
  async importFromExcel(filePath) {
    try {
      console.log('🚀 Starting Excel import process...');
      console.log(`📊 Import limit: ${this.MAX_IMPORT_LIMIT} records`);
      
      if (!filePath) {
        throw new Error('No file path provided');
      }
      
      // 1. Read Excel file
      console.log(`📖 Reading Excel file: ${filePath}`);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const rows = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: ''
      });

      console.log(`✅ Found ${rows.length} rows in Excel file`);
      console.log(`⚠️  Will import only first ${this.MAX_IMPORT_LIMIT} rows for testing`);
      
      // 2. Process each row with limit
      const documents = [];
      let processedRows = 0;
      
      for (let i = 1; i < rows.length && processedRows < this.MAX_IMPORT_LIMIT; i++) { // Start from 1 to skip header
        const row = rows[i];
        
        // Skip empty rows
        if (row.every(cell => !cell)) {
          continue;
        }
        
        // Process data row
        const document = this.processRow(row, i);
        if (document) {
          documents.push(document);
          processedRows++;
        }
        
        // Log progress
        if (i % 10 === 0) {
          console.log(`📊 Processed ${processedRows}/${this.MAX_IMPORT_LIMIT} records`);
        }
      }

      console.log(`✅ Processed ${documents.length} valid documents`);
      
      // 3. Upload to Firebase in batches
      if (documents.length > 0) {
        console.log('🔄 Starting upload to Firebase...');
        
        // Upload in batches of 20
        const batchSize = 20;
        const batches = [];
        
        for (let i = 0; i < documents.length; i += batchSize) {
          const batch = db.batch();
          const batchDocs = documents.slice(i, i + batchSize);
          
          batchDocs.forEach(doc => {
            const docRef = this.collection.doc();
            batch.set(docRef, doc);
          });
          
          batches.push(batch);
        }

        console.log(`📦 Created ${batches.length} batches for upload`);

        // Execute batches
        for (let i = 0; i < batches.length; i++) {
          try {
            await batches[i].commit();
            console.log(`✅ Batch ${i + 1}/${batches.length} uploaded successfully`);
            this.processedCount += batches[i].size;
          } catch (error) {
            console.error(`❌ Error uploading batch ${i + 1}:`, error);
            this.errorCount += batchSize;
          }
        }
      }

      // 4. Print summary
      console.log('\n📊 IMPORT SUMMARY');
      console.log('='.repeat(50));
      console.log(`✅ Successfully imported: ${this.processedCount} documents`);
      console.log(`❌ Failed: ${this.errorCount} documents`);
      console.log(`⚠️  Errors: ${this.errors.length} rows`);
      
      if (this.errors.length > 0) {
        console.log('\n❌ Error Details:');
        this.errors.slice(0, 5).forEach((error, index) => {
          console.log(`${index + 1}. ${error.error}`);
          console.log(`   Row: ${JSON.stringify(error.row.slice(0, 3))}`);
        });
        
        if (this.errors.length > 5) {
          console.log(`... and ${this.errors.length - 5} more errors`);
        }
      }
      
    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  }
}

module.exports = ExcelImporter;