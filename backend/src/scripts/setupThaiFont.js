const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Setup Thai font support for the backend
 */
async function setupThaiFont() {
  console.log('🇹🇭 Setting up Thai font support');
  console.log('===============================\n');

  // 1. Create a fonts directory if it doesn't exist
  const fontsDir = path.join(__dirname, '../..', 'fonts');
  if (!fs.existsSync(fontsDir)) {
    console.log('📂 Creating fonts directory...');
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  // 2. Check if we have Thai fonts installed on the system
  console.log('🔍 Checking for Thai fonts...');
  
  const fontCheckCommand = process.platform === 'win32' 
    ? 'fc-list | findstr -i thai'
    : 'fc-list | grep -i thai';

  exec(fontCheckCommand, (error, stdout, stderr) => {
    if (error) {
      console.log('⚠️  Could not check system fonts. You may need to install Thai fonts manually.');
    } else {
      console.log('System Thai fonts found:');
      console.log(stdout);
    }
    
    // Continue with setup regardless of system fonts
    console.log('\n📝 Creating font configuration file...');
    
    // Create a fonts.css file with Thai font fallbacks
    const cssContent = `/* Thai font configuration */
@font-face {
  font-family: 'Sarabun';
  src: url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
  font-weight: normal;
  font-style: normal;
}

/* Thai font class */
.thai-font {
  font-family: 'Sarabun', 'Tahoma', 'Arial', sans-serif;
}

/* Thai text with proper line height */
[lang="th"] {
  font-family: 'Sarabun', 'Tahoma', 'Arial', sans-serif;
  line-height: 1.5;
  font-weight: 400;
}
`;
    
    fs.writeFileSync(path.join(fontsDir, 'thai-fonts.css'), cssContent, 'utf8');
    console.log('✅ Font configuration file created');
    
    // Create an HTML test file for Thai fonts
    const htmlTestContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thai Font Test</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    [lang="th"] {
      font-family: 'Sarabun', 'Tahoma', 'Arial', sans-serif;
    }
    
    .thai-word {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .meaning {
      color: #555;
    }
    
    .phonetic {
      color: #888;
      font-style: italic;
    }
    
    .section {
      margin-bottom: 30px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>Thai Font Test</h1>
  <p>This page tests the display of Thai characters in your browser.</p>
  
  <div class="section">
    <h2>Basic Thai Words</h2>
    <div class="thai-word" lang="th">กิน</div>
    <div class="meaning">Meaning: to eat</div>
    <div class="phonetic">Phonetic: kin</div>
    
    <div class="thai-word" lang="th">น้ำ</div>
    <div class="meaning">Meaning: water</div>
    <div class="phonetic">Phonetic: nam</div>
    
    <div class="thai-word" lang="th">สวัสดี</div>
    <div class="meaning">Meaning: hello</div>
    <div class="phonetic">Phonetic: sawatdee</div>
  </div>
  
  <div class="section">
    <h2>Thai Consonants</h2>
    <div class="thai-word" lang="th">ก ข ฃ ค ฅ ฆ ง จ ฉ ช ซ ฌ ญ ฎ ฏ ฐ ฑ ฒ ณ ด ต ถ ท ธ น บ ป ผ ฝ พ ฟ ภ ม ย ร ล ว ศ ษ ส ห ฬ อ ฮ</div>
  </div>
  
  <div class="section">
    <h2>Thai Vowels</h2>
    <div class="thai-word" lang="th">ะ  า ำ  ิ  ี  ึ  ื  ุ  ู เ แ โ ใ ไ</div>
  </div>
  
  <div class="section">
    <h2>Thai Tone Marks</h2>
    <div class="thai-word" lang="th">่ ้ ๊ ๋</div>
  </div>
  
  <div class="section">
    <h2>Sample Sentence</h2>
    <div class="thai-word" lang="th">ฉันชอบกินอาหารไทย</div>
    <div class="meaning">Meaning: I like to eat Thai food</div>
  </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(fontsDir, 'thai-test.html'), htmlTestContent, 'utf8');
    console.log('✅ HTML test file created');
    
    console.log('\n✅ Thai font setup complete!');
    console.log('\n🔍 To test Thai font rendering:');
    console.log(`   Open ${path.join(fontsDir, 'thai-test.html')} in your browser`);
    console.log('\n🚀 Next steps:');
    console.log('   1. Run the Thai text validation test:');
    console.log('      npm run test-thai-text');
    console.log('   2. If you see proper Thai text in tests, proceed with import');
  });
}

// Run the setup
setupThaiFont();