/**
 * Breadsmith Marketing Automation
 * Test Startup Script - Launches both services in test mode
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('┌────────────────────────────────────────────┐');
console.log('│  BREADSMITH MARKETING AUTOMATION - TEST    │');
console.log('└────────────────────────────────────────────┘');

// Ensure required directories exist
const directories = [
  './uploads',
  './processed',
  './posted'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create .gitkeep files to preserve empty directories in git
directories.forEach(dir => {
  const gitkeepPath = path.join(dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }
});

// Launch caption generator process (test version)
console.log('\n📷 Starting caption generator service (TEST MODE)...');
const captionGenerator = spawn('node', ['caption-generator-test.js'], {
  stdio: 'inherit',
  detached: false
});

captionGenerator.on('error', (err) => {
  console.error('Failed to start caption generator:', err);
});

// Launch Instagram poster process (test version)
console.log('\n📱 Starting Instagram posting service (TEST MODE)...');
const instagramPoster = spawn('node', ['instagram-poster-test.js'], {
  stdio: 'inherit',
  detached: false
});

instagramPoster.on('error', (err) => {
  console.error('Failed to start Instagram poster:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test services...');
  
  captionGenerator.kill();
  instagramPoster.kill();
  
  console.log('Test services stopped. Goodbye!');
  process.exit();
});

console.log('\n✅ All test services started successfully!');
console.log('🔍 The system is now monitoring the uploads folder for new photos');
console.log('🧪 TESTING MODE: No actual API calls will be made');
console.log('🚀 To test, add images to the uploads folder');
console.log('💡 Press Ctrl+C to stop all services');
