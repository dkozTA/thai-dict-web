const fs = require('fs');
const pdf = require('pdf-parse');
const { db } = require('../config/firebase-admin');
const path = require('path');

class PDFImporter {
  constructor() {
    this.collection = db.collection('dictionary');
    this.processedCount = 0;
    this.errorCount = 0;
    this.errors = [];
    this.MAX_IMPORT_LIMIT = 200;
  }

  // Đọc PDF file
  async readPDFFile(filePath) {
    try {
      console.log(`📖 Reading PDF file: ${filePath}`);
      
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      console.log(`✅ PDF loaded successfully`);
      console.log(`📄 Total pages: ${data.numpages}`);
      console.log(`📝 Total text length: ${data.text.length} characters`);
      
      return data.text;
    } catch (error) {
      console.error('❌ Error reading PDF file:', error);
      throw error;
    }
  }

  // Parse bảng từ text PDF với cấu trúc sách
  parseTableFromPDF(text) {
    const words = [];
    
    // Tách theo dòng và clean up
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line && line.length > 2);
    
    console.log(`📊 Processing ${lines.length} lines from PDF...`);
    
    let isInVocabularySection = false;
    let currentSection = '';
    let currentCategory = 'general';
    let tableHeaderFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
      
      // Tìm các section chính (I., II., III., etc.)
      if (this.isSectionHeader(line)) {
        isInVocabularySection = true;
        currentSection = line;
        currentCategory = this.extractCategoryFromSection(line);
        tableHeaderFound = false;
        console.log(`📂 Found section: ${currentSection}`);
        console.log(`📁 Category: ${currentCategory}`);
        continue;
      }
      
      // Skip non-vocabulary sections
      if (!isInVocabularySection) {
        continue;
      }
      
      // Tìm header bảng
      if (this.isTableHeader(line, nextLine)) {
        tableHeaderFound = true;
        console.log(`📋 Found table header at line ${i + 1}`);
        // Skip header rows
        if (nextLine && nextLine.includes('TT')) {
          i++; // Skip next line too
        }
        continue;
      }
      
      // Skip rows trước khi có table header
      if (!tableHeaderFound) {
        continue;
      }
      
      // Skip header và separator rows
      if (this.isHeaderOrSeparator(line)) {
        continue;
      }
      
      // Parse table row
      const wordData = this.parseTableRow(line, i + 1);
      if (wordData) {
        wordData.category = currentCategory;
        wordData.section = currentSection;
        words.push(wordData);
        
        // Log sample
        if (words.length <= 5) {
          console.log(`📝 Sample ${words.length}:`, {
            thai: wordData.word,
            phonetic: wordData.phonetic,
            meaning: wordData.vietnamese_meaning.substring(0, 30) + '...',
            category: wordData.category
          });
        }
      }
      
      // Stop if reached limit
      if (words.length >= this.MAX_IMPORT_LIMIT) {
        console.log(`⚠️  Reached import limit of ${this.MAX_IMPORT_LIMIT} words`);
        break;
      }
    }
    
    return words;
  }

  // Kiểm tra có phải section header không
  isSectionHeader(line) {
    // Pattern: "I. Bảng từ ngữ...", "II. Bảng từ ngữ...", "III. ..."
    const sectionPatterns = [
      /^I\.\s*Bảng từ ngữ/i,
      /^II\.\s*Bảng từ ngữ/i,
      /^III\.\s*Bảng từ ngữ/i,
      /^IV\.\s*Bảng từ ngữ/i,
      /^V\.\s*Bảng từ ngữ/i,
      /^VI\.\s*Bảng từ ngữ/i,
      /^I+\.\s*[^0-9]/i, // Roman numerals followed by non-numbers
      /^\d+\.\s*Từ vựng/i // "1. Từ vựng Thái - Việt"
    ];
    
    return sectionPatterns.some(pattern => pattern.test(line));
  }

  // Kiểm tra có phải table header không
  isTableHeader(line, nextLine = '') {
    const headerPatterns = [
      /Từ vựng Thái.*Việt/i,
      /Tiếng Thái.*Tiếng Việt/i,
      /Chữ Thái.*Phiên âm.*Tiếng Việt/i,
      /TT.*Chữ Thái.*Phiên âm/i
    ];
    
    const hasHeaderPattern = headerPatterns.some(pattern => pattern.test(line));
    const nextLineHasTT = nextLine && nextLine.includes('TT');
    
    return hasHeaderPattern || nextLineHasTT;
  }

  // Kiểm tra có phải header hoặc separator row không
  isHeaderOrSeparator(line) {
    return (
      line.includes('TT') && line.includes('Chữ Thái') ||
      line.includes('Tiếng Thái') && line.includes('Tiếng Việt') ||
      line.includes('Phiên âm') ||
      line.includes('Chú thích') ||
      line.match(/^-+$/) || // Dashes
      line.match(/^=+$/) || // Equal signs
      line.match(/^\|+$/) || // Pipes
      line.length < 3 ||
      line.match(/^\d+\s*$/) // Chỉ có số
    );
  }

  // Extract category từ section header
  extractCategoryFromSection(sectionText) {
    const categoryMap = {
      'sự vật hiện tượng': 'objects_phenomena',
      'vật hiện tượng': 'objects_phenomena', 
      'bộ phận cơ thể': 'body_parts',
      'cơ thể': 'body_parts',
      'con người': 'people',
      'người': 'people',
      'gia đình': 'family',
      'họ hàng': 'family',
      'động vật': 'animals',
      'thực vật': 'plants',
      'cây cối': 'plants',
      'ẩm thực': 'food',
      'đồ ăn': 'food',
      'thức ăn': 'food',
      'màu sắc': 'colors',
      'thời gian': 'time',
      'số đếm': 'numbers',
      'con số': 'numbers',
      'giao thông': 'transport',
      'tính từ': 'adjectives',
      'động từ': 'verbs',
      'danh từ': 'nouns'
    };
    
    const lowerText = sectionText.toLowerCase();
    
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerText.includes(key)) {
        return value;
      }
    }
    
    return 'general';
  }

  // Parse một row trong bảng
  parseTableRow(line, lineNumber) {
    try {
      // Clean up line
      let cleanLine = line.trim();
      
      // Skip obviously invalid lines
      if (cleanLine.length < 5 || 
          cleanLine.match(/^[0-9\s\-\|\.]+$/) ||
          cleanLine.includes('Tiếng Thái') ||
          cleanLine.includes('Phiên âm')) {
        return null;
      }
      
      // Remove leading number (STT)
      cleanLine = cleanLine.replace(/^\d+\.?\s*/, '').trim();
      
      if (!cleanLine) {
        return null;
      }
      
      // Split into parts - multiple strategies
      let parts = this.smartSplitTableRow(cleanLine);
      
      if (parts.length < 2) {
        return null;
      }
      
      // Extract components
      const thaiWord = parts[0].trim();
      let phonetic = '';
      let vietnameseMeaning = '';
      
      if (parts.length === 2) {
        // Chỉ có Thai word và Vietnamese meaning
        vietnameseMeaning = parts[1].trim();
      } else if (parts.length >= 3) {
        // Có Thai word, phonetic, và Vietnamese meaning
        phonetic = parts[1].trim();
        vietnameseMeaning = parts.slice(2).join(' ').trim();
      }
      
      // Clean up data
      if (!thaiWord || !vietnameseMeaning) {
        return null;
      }
      
      // Parse examples from Vietnamese meaning
      const { mainMeaning, examples } = this.parseVietnameseMeaning(vietnameseMeaning);
      
      return {
        word: thaiWord,
        phonetic: phonetic,
        vietnamese_meaning: mainMeaning,
        examples: examples,
        grammar_note: '',
        note: '',
        source: 'pdf_import',
        created_at: new Date(),
        updated_at: new Date()
      };
      
    } catch (error) {
      this.errors.push({
        line: line,
        lineNumber: lineNumber,
        error: error.message
      });
      return null;
    }
  }

  // Smart split table row
  smartSplitTableRow(text) {
    // Strategy 1: Split by multiple spaces (most common in tables)
    let parts = text.split(/\s{2,}/);
    if (parts.length >= 2) {
      return parts;
    }
    
    // Strategy 2: Split by tabs
    parts = text.split(/\t+/);
    if (parts.length >= 2) {
      return parts;
    }
    
    // Strategy 3: Pattern matching for Thai + Latin + Vietnamese
    const match = text.match(/^([^\s]+)\s+([a-zA-Zɯəɔɪəʊɛɒɑʌʤʧʃʒθðŋ\s]+?)\s+(.+)$/);
    if (match) {
      return [match[1], match[2], match[3]];
    }
    
    // Strategy 4: Split by single space and try to identify phonetic
    parts = text.split(/\s+/);
    if (parts.length >= 3) {
      // Find where phonetic might end (usually ends before Vietnamese words)
      for (let i = 1; i < parts.length - 1; i++) {
        const potentialPhonetic = parts.slice(1, i + 1).join(' ');
        const potentialVietnamese = parts.slice(i + 1).join(' ');
        
        // Check if potentialVietnamese contains Vietnamese words
        if (this.containsVietnameseWords(potentialVietnamese)) {
          return [parts[0], potentialPhonetic, potentialVietnamese];
        }
      }
    }
    
    // Strategy 5: Fallback - just Thai word and meaning
    if (parts.length >= 2) {
      return [parts[0], parts.slice(1).join(' ')];
    }
    
    return parts;
  }

  // Check if text contains Vietnamese words
  containsVietnameseWords(text) {
    const vietnameseWords = [
      'người', 'con', 'cái', 'của', 'và', 'có', 'là', 'được', 'đã', 'sẽ',
      'trong', 'trên', 'dưới', 'với', 'để', 'cho', 'về', 'từ', 'theo',
      'như', 'nếu', 'khi', 'mà', 'hay', 'hoặc', 'nhưng', 'vì', 'nên',
      'màu', 'trắng', 'đen', 'đỏ', 'xanh', 'vàng', 'tím', 'hồng',
      'cây', 'hoa', 'lá', 'quả', 'rau', 'củ'
    ];
    
    const lowerText = text.toLowerCase();
    return vietnameseWords.some(word => lowerText.includes(word));
  }

  // Parse Vietnamese meaning để tách meaning và examples
  parseVietnameseMeaning(text) {
    const result = {
      mainMeaning: text,
      examples: []
    };
    
    // Tách theo dấu phẩy hoặc dấu chấm phẩy
    const parts = text.split(/[,;]/);
    
    if (parts.length > 1) {
      result.mainMeaning = parts[0].trim();
      result.examples = parts.slice(1)
        .map(part => part.trim())
        .filter(part => part && part.length > 2)
        .slice(0, 3); // Limit to 3 examples
    }
    
    return result;
  }

  // Upload lên Firebase (unchanged)
  async batchUpload(documents, batchSize = 50) {
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

    for (let i = 0; i < batches.length; i++) {
      try {
        await batches[i].commit();
        console.log(`✅ Batch ${i + 1}/${batches.length} uploaded successfully`);
        this.processedCount += Math.min(batchSize, documents.length - i * batchSize);
        
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`❌ Error uploading batch ${i + 1}:`, error);
        this.errorCount += Math.min(batchSize, documents.length - i * batchSize);
      }
    }
  }

  // Main import function (unchanged)
  async importFromPDF(filePath) {
    try {
      console.log('🚀 Starting PDF import process...');
      console.log(`📊 Import limit: ${this.MAX_IMPORT_LIMIT} records`);
      
      const pdfText = await this.readPDFFile(filePath);
      const words = this.parseTableFromPDF(pdfText);
      
      console.log(`✅ Parsed ${words.length} words from PDF`);
      
      if (words.length > 0) {
        console.log('🔄 Starting upload to Firebase...');
        await this.batchUpload(words);
      }

      this.printSummary();
      
    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  }

  // Print summary
  printSummary() {
    console.log('\n📊 PDF IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully imported: ${this.processedCount} documents`);
    console.log(`❌ Failed: ${this.errorCount} documents`);
    console.log(`⚠️  Parse errors: ${this.errors.length} lines`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Parse Error Details:');
      this.errors.slice(0, 5).forEach((error, index) => {
        console.log(`${index + 1}. Line ${error.lineNumber}: ${error.error}`);
        console.log(`   Text: "${error.line.substring(0, 50)}..."`);
      });
      
      if (this.errors.length > 5) {
        console.log(`... and ${this.errors.length - 5} more errors`);
      }
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Check Firebase Console to verify data');
    console.log('2. Run: npm run validate-import');
    console.log('3. If data looks good, increase MAX_IMPORT_LIMIT');
  }
}

// Main function (unchanged)
async function main() {
  try {
    const possibleFiles = [
      path.join(__dirname, '../data/thai_vocabulary.pdf'),
      path.join(__dirname, '../data/dictionary.pdf'), 
      path.join(__dirname, '../data/thai.pdf'),
      path.join(__dirname, '../data/vocab.pdf'),
      path.join(__dirname, '../data/book.pdf')
    ];
    
    let pdfFilePath = null;
    const fs = require('fs');
    
    for (const filePath of possibleFiles) {
      if (fs.existsSync(filePath)) {
        pdfFilePath = filePath;
        break;
      }
    }
    
    if (!pdfFilePath) {
      console.error(`❌ PDF file not found. Tried:`);
      possibleFiles.forEach(file => console.log(`   - ${file}`));
      console.log('\n📝 Please place your PDF file in backend/src/data/ directory');
      process.exit(1);
    }

    console.log(`📂 Using PDF file: ${pdfFilePath}`);
    
    const importer = new PDFImporter();
    await importer.importFromPDF(pdfFilePath);
    
    console.log('🎉 PDF Import completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 PDF Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PDFImporter;