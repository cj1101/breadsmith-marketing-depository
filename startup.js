/**
 * Breadsmith Marketing Automation
 * Startup Script - Launches both services
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('┌────────────────────────────────────────────┐');
console.log('│     BREADSMITH MARKETING AUTOMATION        │');
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

// Launch caption generator process
console.log('\n📷 Starting caption generator service...');
const captionGenerator = spawn('node', ['caption-generator.js'], {
  stdio: 'inherit',
  detached: false
});

captionGenerator.on('error', (err) => {
  console.error('Failed to start caption generator:', err);
});

// Launch Instagram poster process
console.log('\n📱 Starting Instagram posting service...');
const instagramPoster = spawn('node', ['instagram-poster.js'], {
  stdio: 'inherit',
  detached: false
});

instagramPoster.on('error', (err) => {
  console.error('Failed to start Instagram poster:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  
  captionGenerator.kill();
  instagramPoster.kill();
  
  console.log('Services stopped. Goodbye!');
  process.exit();
});

console.log('\n✅ All services started successfully!');
console.log('🔍 The system is now monitoring the uploads folder for new photos');
console.log('💡 Press Ctrl+C to stop all services');
