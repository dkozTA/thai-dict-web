require('dotenv').config();
const ExcelImporter = require('./importExcelToFirebase');
const path = require('path');

async function runImport() {
  console.log('📚 Thai Dictionary Excel Import Tool');
  console.log('==================================\n');

  try {
    // Ensure the terminal supports UTF-8 encoding
    process.stdout.setEncoding('utf8');
    
    // Create an instance of the ExcelImporter class
    const importer = new ExcelImporter();
    
    // Get file path from command line arguments
    const excelFile = process.argv[2];
    
    if (!excelFile) {
      throw new Error('Please provide an Excel file path as argument');
    }
    
    console.log(`📂 Using specified file: ${excelFile}`);
    
    // Call the importFromExcel method with the file path
    await importer.importFromExcel(excelFile);
    
    console.log('\n✅ Import completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

runImport();