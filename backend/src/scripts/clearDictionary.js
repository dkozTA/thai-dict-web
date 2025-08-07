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

  // Xóa toàn bộ collection
  async clearAllDocuments() {
    try {
      console.log('🗑️  Starting to clear dictionary collection...');
      console.log('⚠️  This will delete ALL documents in the dictionary collection!');
      
      let hasMore = true;
      const batchSize = 500; // Firestore batch limit
      
      while (hasMore) {
        // Lấy batch documents
        const snapshot = await this.collection.limit(batchSize).get();
        
        if (snapshot.empty) {
          hasMore = false;
          break;
        }
        
        console.log(`🔄 Deleting batch of ${snapshot.size} documents...`);
        
        // Xóa batch hiện tại
        await this.deleteBatch(snapshot.docs);
        
        console.log(`✅ Deleted ${snapshot.size} documents. Total: ${this.deletedCount}`);
        
        // Delay nhỏ để tránh rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`🎉 Successfully deleted ${this.deletedCount} documents from dictionary collection`);
      
    } catch (error) {
      console.error('❌ Error clearing dictionary collection:', error);
      throw error;
    }
  }

  // Xóa documents với điều kiện (ví dụ: theo source)
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

  // Kiểm tra số lượng documents trước khi xóa
  async getDocumentCount() {
    try {
      const snapshot = await this.collection.get();
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error getting document count:', error);
      throw error;
    }
  }

  // Hiển thị thống kê trước khi xóa
  async showStatistics() {
    try {
      console.log('📊 Current dictionary statistics:');
      
      const totalCount = await this.getDocumentCount();
      console.log(`   Total documents: ${totalCount}`);
      
      if (totalCount === 0) {
        console.log('   Collection is already empty!');
        return false;
      }

      // Thống kê theo source
      const sourceStats = {};
      const categoryStats = {};
      
      const snapshot = await this.collection.get();
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Count by source
        const source = data.source || 'unknown';
        sourceStats[source] = (sourceStats[source] || 0) + 1;
        
        // Count by category
        const category = data.category || 'unknown';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });
      
      console.log('\n📂 Documents by source:');
      Object.entries(sourceStats).forEach(([source, count]) => {
        console.log(`   ${source}: ${count}`);
      });
      
      console.log('\n📂 Documents by category:');
      Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) // Show top 10 categories
        .forEach(([category, count]) => {
          console.log(`   ${category}: ${count}`);
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

// Hàm xác nhận từ user
function askForConfirmation(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

// Main function
async function main() {
  try {
    const cleaner = new DictionaryCleaner();
    
    // Hiển thị thống kê hiện tại
    const hasDocuments = await cleaner.showStatistics();
    
    if (!hasDocuments) {
      console.log('✅ Nothing to delete!');
      process.exit(0);
    }
    
    // Lấy tham số từ command line
    const args = process.argv.slice(2);
    const operation = args[0];
    const value = args[1];
    
    if (operation === '--source' && value) {
      // Xóa theo source cụ thể
      console.log(`\n⚠️  You are about to delete ALL documents with source = "${value}"`);
      const confirmed = await askForConfirmation('Are you sure? Type "yes" to confirm: ');
      
      if (confirmed) {
        await cleaner.clearByCondition('source', value);
      } else {
        console.log('❌ Operation cancelled by user');
      }
    } else if (operation === '--category' && value) {
      // Xóa theo category
      console.log(`\n⚠️  You are about to delete ALL documents with category = "${value}"`);
      const confirmed = await askForConfirmation('Are you sure? Type "yes" to confirm: ');
      
      if (confirmed) {
        await cleaner.clearByCondition('category', value);
      } else {
        console.log('❌ Operation cancelled by user');
      }
    } else if (operation === '--imports') {
      // Xóa tất cả imports (Excel + PDF)
      console.log('\n⚠️  You are about to delete ALL imported documents (Excel + PDF)!');
      console.log('⚠️  This will remove all documents with source: excel_import or pdf_import');
      const confirmed = await askForConfirmation('Are you sure? Type "yes" to confirm: ');
      
      if (confirmed) {
        await cleaner.clearAllImports();
      } else {
        console.log('❌ Operation cancelled by user');
      }
    } else if (operation === '--force') {
      // Xóa tất cả không cần xác nhận
      console.log('\n🗑️  Force deleting ALL documents...');
      await cleaner.clearAllDocuments();
    } else {
      // Xóa tất cả có xác nhận
      console.log('\n⚠️  You are about to delete ALL documents in the dictionary collection!');
      console.log('⚠️  This action cannot be undone!');
      
      const confirmed = await askForConfirmation('Are you sure? Type "yes" to confirm: ');
      
      if (confirmed) {
        await cleaner.clearAllDocuments();
      } else {
        console.log('❌ Operation cancelled by user');
      }
    }
    
    console.log('\n✅ Operation completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Clear operation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DictionaryCleaner;