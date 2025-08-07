const fs = require('fs');
const path = require('path');
const { validateThaiWord, normalizeThaiText } = require('../utils/thaiTextHandler');

// Configure terminal for proper UTF-8 output
process.stdout.setEncoding('utf8');

/**
 * Test Thai text handling and display
 */
function testThaiText() {
  console.log('🇹🇭 Testing Thai Text Handling');
  console.log('=============================\n');

  // Test cases - Thai words with meanings
  const testCases = [
    { thai: 'กิน', meaning: 'ăn', phonetic: 'kin' },
    { thai: 'น้ำ', meaning: 'nước', phonetic: 'nam' },
    { thai: 'สวัสดี', meaning: 'xin chào', phonetic: 'sawatdee' },
    { thai: 'ขอบคุณ', meaning: 'cảm ơn', phonetic: 'khob khun' },
    { thai: 'ภาษาไทย', meaning: 'tiếng Thái', phonetic: 'paasaa thai' },
    { thai: 'บ่า', meaning: 'ba tây', phonetic: 'bà' },
    { thai: 'ป่า', meaning: 'rừng', phonetic: 'pà' },
  ];

  console.log('📝 Testing Thai text validation and normalization:');
  console.log('------------------------------------------------');
  
  testCases.forEach((item, index) => {
    const result = validateThaiWord(item.thai);
    console.log(`\n${index + 1}. Thai Word: ${item.thai}`);
    console.log(`   Meaning: ${item.meaning}`);
    console.log(`   Phonetic: ${item.phonetic}`);
    console.log(`   Valid: ${result.isValid ? '✅ Yes' : '❌ No'}`);
    
    if (!result.isValid) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.normalized !== item.thai) {
      console.log(`   Normalized: ${result.normalized}`);
    }
    
    // Show character codes for debugging
    console.log('   Character Codes:');
    for (let i = 0; i < item.thai.length; i++) {
      const char = item.thai.charAt(i);
      const code = item.thai.charCodeAt(i);
      console.log(`     - '${char}' = U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
    }
  });
  
  console.log('\n\n📊 Thai Character Set Test');
  console.log('------------------------');
  
  // Test full Thai character range
  const thaiConsonants = 'ก ข ฃ ค ฅ ฆ ง จ ฉ ช ซ ฌ ญ ฎ ฏ ฐ ฑ ฒ ณ ด ต ถ ท ธ น บ ป ผ ฝ พ ฟ ภ ม ย ร ล ว ศ ษ ส ห ฬ อ ฮ';
  const thaiVowels = 'ะ  า ำ  ิ  ี  ึ  ื  ุ  ู เ แ โ ใ ไ';
  const thaiToneMarks = '่ ้ ๊ ๋';
  
  console.log(`Thai Consonants: ${thaiConsonants}`);
  console.log(`Thai Vowels: ${thaiVowels}`);
  console.log(`Thai Tone Marks: ${thaiToneMarks}`);
  
  // Export test results to file
  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, 'thai_font_test.txt');
  
  const output = `Thai Font Test Results
=======================
Date: ${new Date().toISOString()}

TEST CASES:
${testCases.map((item, i) => 
  `${i + 1}. Thai: ${item.thai}
   Meaning: ${item.meaning}
   Phonetic: ${item.phonetic}
   Normalized: ${normalizeThaiText(item.thai)}
   Valid: ${validateThaiWord(item.thai).isValid ? 'Yes' : 'No'}
`).join('\n')}

THAI CHARACTER SETS:
Consonants: ${thaiConsonants}
Vowels: ${thaiVowels}
Tone Marks: ${thaiToneMarks}
`;

  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`\n✅ Test results written to ${outputFile}`);
}

// Run the test
testThaiText();