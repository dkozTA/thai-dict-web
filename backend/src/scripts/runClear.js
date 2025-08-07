require('dotenv').config();

async function runClear() {
  console.log('🗑️  Dictionary Collection Cleaner');
  console.log('=================================\n');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  npm run clear-dictionary                 # Clear all documents (with confirmation)');
    console.log('  npm run clear-dictionary --force         # Clear all documents (no confirmation)');
    console.log('  npm run clear-dictionary --imports       # Clear ALL imports (Excel + PDF)');
    console.log('  npm run clear-dictionary --source excel_import  # Clear Excel imports only');
    console.log('  npm run clear-dictionary --source pdf_import    # Clear PDF imports only');
    console.log('  npm run clear-dictionary --category general     # Clear by category');
    console.log('');
    console.log('Examples:');
    console.log('  npm run clear-dictionary --imports       # Recommended: Clear all imported data');
    console.log('  npm run clear-dictionary --source excel_import');
    console.log('  npm run clear-dictionary --source pdf_import');
    console.log('  npm run clear-dictionary --category family');
    console.log('');
    process.exit(0);
  }
  
  try {
    // Import the main function from clearDictionary and execute it
    const main = require('./clearDictionary');
    
    // Since clearDictionary.js exports the main function when require.main === module,
    // we need to execute it manually here
    const { db } = require('../config/firebase-admin');
    
    class DictionaryCleaner {
      constructor() {
        this.collection = db.collection('dictionary');
        this.deletedCount = 0;
      }

      // Xóa documents theo batch
      async deleteBatch(batch) {
        const batchDelete = db.batch();
        
        batch.forEach(doc => {
          batchDelete.delete(doc.ref);
        });
        
        await batchDelete.commit();
        this.deletedCount += batch.length;
      }

      // Xóa tất cả imports (cả Excel và PDF)
      async clearAllImports() {
        try {
          console.log('🗑️  Clearing ALL imported documents (Excel + PDF)...');
          
          const importSources = ['excel_import', 'pdf_import'];
          let totalDeleted = 0;
          
          for (const source of importSources) {
            console.log(`\n📂 Clearing ${source} documents...`);
            
            let hasMore = true;
            const batchSize = 500;
            let sourceDeleted = 0;
            
            while (hasMore) {
              const snapshot = await this.collection
                .where('source', '==', source)
                .limit(batchSize)
                .get();
              
              if (snapshot.empty) {
                hasMore = false;
                break;
              }
              
              console.log(`🔄 Deleting batch of ${snapshot.size} ${source} documents...`);
              await this.deleteBatch(snapshot.docs);
              sourceDeleted += snapshot.size;
              console.log(`✅ Deleted ${snapshot.size} documents. ${source} total: ${sourceDeleted}`);
              
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.log(`📊 Total ${source} documents deleted: ${sourceDeleted}`);
            totalDeleted += sourceDeleted;
          }
          
          console.log(`\n🎉 Successfully deleted ${totalDeleted} imported documents`);
          this.deletedCount = totalDeleted;
          
        } catch (error) {
          console.error('❌ Error clearing imported documents:', error);
          throw error;
        }
      }

      // Xóa documents với điều kiện
      async clearByCondition(field, value) {
        try {
          console.log(`🗑️  Clearing documents where ${field} = ${value}...`);
          
          let hasMore = true;
          const batchSize = 500;
          
          while (hasMore) {
            const snapshot = await this.collection
              .where(field, '==', value)
              .limit(batchSize)
              .get();
            
            if (snapshot.empty) {
              hasMore = false;
              break;
            }
            
            console.log(`🔄 Deleting batch of ${snapshot.size} documents...`);
            await this.deleteBatch(snapshot.docs);
            console.log(`✅ Deleted ${snapshot.size} documents. Total: ${this.deletedCount}`);
            
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          console.log(`🎉 Successfully deleted ${this.deletedCount} documents where ${field} = ${value}`);
          
        } catch (error) {
          console.error(`❌ Error clearing documents by condition:`, error);
          throw error;
        }
      }

      // Hiển thị thống kê
      async showStatistics() {
        try {
          console.log('📊 Current dictionary statistics:');
          
          const snapshot = await this.collection.get();
          const totalCount = snapshot.size;
          console.log(`   Total documents: ${totalCount}`);
          
          if (totalCount === 0) {
            console.log('   Collection is already empty!');
            return false;
          }

          // Thống kê theo source
          const sourceStats = {};
          
          snapshot.forEach(doc => {
            const data = doc.data();
            const source = data.source || 'unknown';
            sourceStats[source] = (sourceStats[source] || 0) + 1;
          });
          
          console.log('\n📂 Documents by source:');
          Object.entries(sourceStats).forEach(([source, count]) => {
            console.log(`   ${source}: ${count}`);
          });
          
          // Show import statistics
          const importCount = (sourceStats['excel_import'] || 0) + (sourceStats['pdf_import'] || 0);
          if (importCount > 0) {
            console.log(`\n📥 Total imported documents: ${importCount}`);
            console.log(`   Excel imports: ${sourceStats['excel_import'] || 0}`);
            console.log(`   PDF imports: ${sourceStats['pdf_import'] || 0}`);
          }
          
          return true;
          
        } catch (error) {
          console.error('❌ Error showing statistics:', error);
          throw error;
        }
      }
    }

    // Execute the cleaning logic
    const cleaner = new DictionaryCleaner();
    
    // Show current stats
    const hasDocuments = await cleaner.showStatistics();
    
    if (!hasDocuments) {
      console.log('✅ Nothing to delete!');
      process.exit(0);
    }

    // Parse arguments
    const operation = args[0];
    const value = args[1];
    
    if (operation === '--source' && value) {
      // Clear by source
      console.log(`\n⚠️  You are about to delete ALL documents with source = "${value}"`);
      
      // Auto-confirm for script execution
      console.log('🔄 Proceeding with deletion...');
      await cleaner.clearByCondition('source', value);
      
    } else if (operation === '--imports') {
      // Clear all imports
      console.log('\n⚠️  You are about to delete ALL imported documents (Excel + PDF)!');
      console.log('⚠️  This will remove all documents with source: excel_import or pdf_import');
      
      // Auto-confirm for script execution
      console.log('🔄 Proceeding with deletion...');
      await cleaner.clearAllImports();
      
    } else {
      console.log('❌ Invalid operation. Use --help for usage information.');
      process.exit(1);
    }
    
    console.log('\n✅ Clear operation completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Clear failed:', error.message);
    process.exit(1);
  }
}

runClear();