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
  
  // Parse Column C into structured data
  parseColumnC(text) {
    const result = {
      phonetic: '',
      grammar_note: '',
      mainMeaning: '',
      examples: []  // Will be array of { thai: '', meaning: '' } pairs
    };

    if (!text) return result;

    // Step 1: Extract phonetic part (usually all caps at beginning)
    const phoneticMatch = text.match(/^([A-ZÀÁẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴÈÉẸẺẼÊẾỀỆỂỄÍÌỊỈĨÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠÚÙỤỦŨƯỨỪỰỬỮÝỲỴỶỸĐ\s]+)/);
    if (phoneticMatch) {
      result.phonetic = phoneticMatch[1].trim();
      text = text.substring(phoneticMatch[0].length).trim();
    }
    
    // Step 2: Extract grammar note if present (vh)
    const grammarMatch = text.match(/^\(([^\)]+)\)/);
    if (grammarMatch) {
      result.grammar_note = grammarMatch[1].trim();
      text = text.substring(grammarMatch[0].length).trim();
    }
    
    // Step 3: Split numbered definitions (1. ... 2. ...)
    const definitions = [];
    const definitionMatches = text.split(/(\d+\.\s*)/).filter(Boolean);
    
    if (definitionMatches.length > 1) {
      // Group definition number with content
      for (let i = 0; i < definitionMatches.length; i += 2) {
        const number = definitionMatches[i].trim();
        const content = (i + 1 < definitionMatches.length) ? definitionMatches[i + 1].trim() : '';
        if (content) {
          definitions.push({ number, content });
        }
      }
    } else {
      // No numbered definitions, just take the whole text
      definitions.push({ number: '', content: text });
    }
    
    // Step 4: Process each definition to extract examples and main meaning
    definitions.forEach(def => {
      // Split by colon to separate examples
      const parts = def.content.split(':').map(p => p.trim());
      
      if (parts.length > 1) {
        // First part is main meaning or example Thai word
        const firstPart = parts[0].trim();
        
        // Rest could contain both example meaning and additional meanings
        const restParts = parts.slice(1).join(':').split('-').map(p => p.trim());
        
        if (restParts.length > 0) {
          // First of the rest is the example meaning
          result.examples.push({
            thai: firstPart,
            meaning: restParts[0]
          });
          
          // Any additional parts are part of the main meaning
          if (restParts.length > 1) {
            result.mainMeaning += (result.mainMeaning ? ' ' : '') + 
              def.number + ' ' + restParts.slice(1).join(' - ');
          } else if (!result.mainMeaning) {
            result.mainMeaning = def.number + ' ' + firstPart;
          }
        }
      } else if (parts.length === 1 && !result.mainMeaning) {
        // Only one part, use as main meaning
        result.mainMeaning = def.number + ' ' + parts[0];
      }
    });

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
      
      // Extract examples from column B and match with meanings
      const mergedExamples = [];
      
      // Process column B examples (Thai text)
      const thaiExamples = [];
      if (thaiExamplesRaw) {
        // Split by numbered items (1. 2. etc)
        const examples = thaiExamplesRaw.split(/(\d+\.\s*)/).filter(Boolean);
        
        // Group them properly
        for (let i = 0; i < examples.length; i += 2) {
          const number = examples[i].trim();
          const content = (i + 1 < examples.length) ? examples[i + 1].trim() : '';
          if (content) {
            thaiExamples.push({ number, content });
          }
        }
      }
      
      // Match Thai examples from column B with meanings from parsed column C
      thaiExamples.forEach((ex, index) => {
        mergedExamples.push({
          thai: ex.content,
          meaning: index < parsed.examples.length ? parsed.examples[index].meaning : ''
        });
      });
      
      // Add any remaining examples from column C
      if (parsed.examples.length > thaiExamples.length) {
        for (let i = thaiExamples.length; i < parsed.examples.length; i++) {
          mergedExamples.push(parsed.examples[i]);
        }
      }

      // Create document object
      const document = {
        word: thaiWord,
        word_transliterated: parsed.phonetic || '',
        vietnamese_meaning: parsed.mainMeaning || 'Chưa có nghĩa',
        examples: mergedExamples,
        grammar_note: parsed.grammar_note || '',
        note: '',
        category: 'general',
        created_at: new Date(),
        updated_at: new Date(),
        source: 'excel_import'
      };

      return document;
    } catch (error) {
      this.errors.push({ row, error: error.message });
      return null;
    }
  }

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