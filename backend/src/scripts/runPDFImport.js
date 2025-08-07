require('dotenv').config();
const PDFImporter = require('./importPDFToFirebase');

async function runPDFImport() {
  console.log('📄 Thai Dictionary PDF Import Tool');
  console.log('==================================\n');
  
  const importer = new PDFImporter();
  
  // Lấy file path từ command line
  const pdfFile = process.argv[2];
  
  try {
    if (pdfFile) {
      console.log(`📂 Using specified file: ${pdfFile}`);
      await importer.importFromPDF(pdfFile);
    } else {
      console.log('📂 Looking for PDF file in data directory...');
      await importer.importFromPDF(); // Tự tìm file
    }
    
    console.log('\n✅ PDF Import completed successfully!');
    console.log('\n🔍 Run validation script:');
    console.log('   npm run validate-import');
    
  } catch (error) {
    console.error('\n❌ PDF Import failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PDF file exists in backend/src/data/');
    console.log('2. Check PDF format and text extraction');
    console.log('3. Verify Firebase credentials');
    console.log('4. Check internet connection');
  }
}

runPDFImport();