const { containsThaiCharacters, normalizeThaiText } = require('../utils/thaiTextHandler');

// Set UTF-8 encoding for output
process.stdout.setEncoding('utf8');

console.log('🇹🇭 Testing Thai Text Detection');
console.log('=============================');

// Test cases
const testCases = [
  { text: 'กิน', description: 'Pure Thai' },
  { text: 'ภาษาไทย', description: 'Thai word for "Thai language"' },
  { text: 'สวัสดี', description: 'Thai greeting' },
  { text: 'Thai', description: 'Latin "Thai"' },
  { text: 'ก ข ค', description: 'Thai consonants' },
  { text: 'b*a', description: 'Latin with symbols' },
  { text: 'b&a', description: 'Latin with symbols' },
  { text: 'บ่า', description: 'Real Thai with tone mark' },
  { text: 'ป่า', description: 'Real Thai with tone mark' },
  { text: '123', description: 'Numbers only' }
];

console.log('\nTest Results:');
console.log('============');

testCases.forEach(({ text, description }) => {
  const containsThai = containsThaiCharacters(text);
  const normalized = normalizeThaiText(text);
  
  console.log(`\n${text} (${description}):`);
  console.log(`- Contains Thai: ${containsThai ? 'YES ✅' : 'NO ❌'}`);
  console.log(`- Normalized: "${normalized}"`);
  
  // Print character codes
  console.log('- Character codes:');
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const code = text.charCodeAt(i);
    console.log(`  ${char}: U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
  }
});

console.log('\n✅ Test completed');