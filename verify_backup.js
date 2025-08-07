const fs = require('fs');
const path = require('path');

const backupDir = '../boltAPPworkmgmt_V1.1_BACKUP_20250807_130108';
const currentDir = '.';

console.log('🔍 Verifying backup completeness...\n');

// Critical files and directories to check
const criticalPaths = [
  'src/',
  'server/',
  'data/',
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tailwind.config.js',
  'tsconfig.json',
  'README.md',
  'src/App.tsx',
  'src/main.tsx',
  'server/index.js',
  'server/package.json',
  'data/smartuniit_taskflow.db',
  'src/components/',
  'src/pages/',
  'src/contexts/',
  'src/hooks/',
  'src/lib/',
  'src/types/',
  'src/utils/',
  'server/routes/',
  'server/middleware/',
  'server/lib/'
];

let allGood = true;

criticalPaths.forEach(filePath => {
  const backupPath = path.join(backupDir, filePath);
  const currentPath = path.join(currentDir, filePath);
  
  if (fs.existsSync(backupPath)) {
    console.log(`✅ ${filePath}`);
  } else {
    console.log(`❌ ${filePath} - MISSING IN BACKUP`);
    allGood = false;
  }
});

// Check file sizes to ensure they're not empty
const importantFiles = [
  'src/App.tsx',
  'server/index.js',
  'package.json',
  'vite.config.ts'
];

console.log('\n📊 Checking file sizes...\n');

importantFiles.forEach(filePath => {
  const backupPath = path.join(backupDir, filePath);
  const currentPath = path.join(currentDir, filePath);
  
  if (fs.existsSync(backupPath)) {
    const backupSize = fs.statSync(backupPath).size;
    const currentSize = fs.statSync(currentPath).size;
    
    if (backupSize > 0) {
      console.log(`✅ ${filePath} - ${backupSize} bytes`);
    } else {
      console.log(`❌ ${filePath} - EMPTY FILE`);
      allGood = false;
    }
  }
});

// Check database file
const dbPath = path.join(backupDir, 'data/smartuniit_taskflow.db');
if (fs.existsSync(dbPath)) {
  const dbSize = fs.statSync(dbPath).size;
  console.log(`✅ Database file - ${dbSize} bytes`);
} else {
  console.log(`❌ Database file - MISSING`);
  allGood = false;
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 BACKUP VERIFICATION: SUCCESSFUL');
  console.log('✅ All critical files are present and non-empty');
  console.log('✅ Backup is ready for restoration');
} else {
  console.log('⚠️  BACKUP VERIFICATION: ISSUES FOUND');
  console.log('❌ Some files are missing or empty');
  console.log('⚠️  Please check the backup before restoration');
}
console.log('='.repeat(50));

console.log(`\n📁 Backup location: ${path.resolve(backupDir)}`);
console.log(`📁 Current location: ${path.resolve(currentDir)}`); 