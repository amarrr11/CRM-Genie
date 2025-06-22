const fs = require('fs');
const path = require('path');

console.log('🔍 Testing AI-Powered CRM System Setup...\n');

// Test 1: Check if .env file exists
console.log('1. Checking environment configuration...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file found');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are present');
  } else {
    console.log('⚠️  Missing environment variables:', missingVars.join(', '));
    console.log('   Please update your .env file with the missing variables');
  }
} else {
  console.log('❌ .env file not found');
  console.log('   Please create a .env file with your configuration');
}

// Test 2: Check if node_modules exists
console.log('\n2. Checking Node.js dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('✅ Server dependencies installed');
} else {
  console.log('❌ Server dependencies not installed');
  console.log('   Run: npm install');
}

// Test 3: Check if client node_modules exists
console.log('\n3. Checking React client dependencies...');
if (fs.existsSync('client/node_modules')) {
  console.log('✅ Client dependencies installed');
} else {
  console.log('❌ Client dependencies not installed');
  console.log('   Run: cd client && npm install');
}

// Test 4: Check if exports directory exists
console.log('\n4. Checking exports directory...');
if (fs.existsSync('exports')) {
  console.log('✅ Exports directory exists');
} else {
  console.log('❌ Exports directory missing');
  console.log('   Creating exports directory...');
  fs.mkdirSync('exports', { recursive: true });
  console.log('✅ Exports directory created');
}

// Test 5: Check if Python requirements file exists
console.log('\n5. Checking Python dependencies...');
if (fs.existsSync('requirements.txt')) {
  console.log('✅ requirements.txt found');
  const requirements = fs.readFileSync('requirements.txt', 'utf8');
  const requiredPackages = ['Flask', 'mysql-connector-python', 'openai', 'pandas'];
  const missingPackages = requiredPackages.filter(pkg => !requirements.includes(pkg));
  
  if (missingPackages.length === 0) {
    console.log('✅ All required Python packages are listed');
  } else {
    console.log('⚠️  Missing Python packages:', missingPackages.join(', '));
  }
} else {
  console.log('❌ requirements.txt not found');
}

// Test 6: Check if all main files exist
console.log('\n6. Checking main application files...');
const requiredFiles = [
  'server.js',
  'ai_service.py',
  'package.json',
  'client/package.json',
  'client/src/App.js',
  'client/src/components/Login.js',
  'client/src/components/Dashboard.js',
  'client/src/components/AdminDashboard.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesExist = false;
  }
});

// Test 7: Check package.json scripts
console.log('\n7. Checking package.json configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['start', 'dev', 'build'];
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length === 0) {
    console.log('✅ All required scripts are present');
  } else {
    console.log('⚠️  Missing scripts:', missingScripts.join(', '));
  }
} catch (error) {
  console.log('❌ Error reading package.json');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 SETUP SUMMARY');
console.log('='.repeat(50));

if (allFilesExist) {
  console.log('✅ All main files are present');
  console.log('✅ Basic setup appears complete');
  console.log('\n🚀 Next steps:');
  console.log('1. Update your .env file with real API keys');
  console.log('2. Ensure MySQL is running and create database: CREATE DATABASE crm_database;');
  console.log('3. Run: npm run dev (or double-click start.bat)');
  console.log('4. Visit: http://localhost:3000');
} else {
  console.log('❌ Some files are missing');
  console.log('Please ensure all files are present before running the application');
}

console.log('\n📚 For detailed setup instructions, see README.md');
console.log('🆘 For troubleshooting, check the troubleshooting section in README.md'); 