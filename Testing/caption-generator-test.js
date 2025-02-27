// Breadsmith Marketing Automation - Caption Generator (TEST VERSION)
// This prototype demonstrates how to:
// 1. Monitor a folder for new images
// 2. Analyze images using a free vision API
// 3. Generate appropriate captions with an LLM
// 4. Prepare content for Instagram posting

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar'); // For watching file changes

// Load brand personality configuration
const brandPersonality = require('./config/brand-personality');

console.log("TESTING MODE: Using mock API responses instead of real API calls");

// Directory to monitor for new images
const uploadDirectory = process.env.UPLOAD_DIRECTORY || './uploads';
const processedDirectory = process.env.PROCESSED_DIRECTORY || './processed';

// Ensure directories exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}
if (!fs.existsSync(processedDirectory)) {
  fs.mkdirSync(processedDirectory, { recursive: true });
}

// MOCK Function to analyze image - replaces actual API call
async function analyzeImage(imagePath) {
  console.log(`[MOCK] Analyzing image: ${imagePath}`);
  
  // Get filename to customize mock response
  const filename = path.basename(imagePath).toLowerCase();
  
  // Generate different responses based on filename keywords
  if (filename.includes('bread') || filename.includes('loaf')) {
    return "This is a beautifully baked artisan sourdough bread. It has a golden-brown crust with flour dusting on top. The crust appears crispy and has a rustic scoring pattern. Inside, the crumb looks open and airy with nice fermentation bubbles throughout. This bread likely contains flour, water, salt, and a sourdough starter.";
  } else if (filename.includes('pastry') || filename.includes('croissant')) {
    return "This is a flaky, golden-brown croissant with beautiful lamination visible in its layers. The exterior is glossy, suggesting an egg wash before baking. The pastry has a crescent shape and appears buttery and rich.";
  } else if (filename.includes('cake') || filename.includes('dessert')) {
    return "This appears to be a delicious cake with creamy frosting. It's decorated with what looks like seasonal berries on top. The cake appears to have multiple layers with frosting between them. It has a smooth, professional finish and would make a delightful dessert for any special occasion.";
  } else if (filename.includes('roll') || filename.includes('bun')) {
    return "These are freshly baked cinnamon rolls with a swirl of cinnamon visible inside. They're topped with a creamy white glaze that's dripping down the sides. The rolls appear soft and fluffy with a light golden-brown exterior.";
  } else {
    // Default generic response
    return "This appears to be a delicious bakery item freshly made with care and quality ingredients. It has a wonderful golden color and appetizing appearance that would tempt any bakery customer.";
  }
}

// MOCK Function to generate a caption - replaces actual API call
async function generateCaption(imageAnalysis) {
  console.log('[MOCK] Generating caption');
  
  // First-person phrases
  const firstPersonPhrases = brandPersonality.personality.firstPersonPhrases;
  const randomFirstPerson = firstPersonPhrases[Math.floor(Math.random() * firstPersonPhrases.length)];
  
  // Connection phrases
  const connectionPhrases = brandPersonality.personality.connectionPhrases;
  const randomConnection = connectionPhrases[Math.floor(Math.random() * connectionPhrases.length)];
  
  // Hashtags
  const hashtags = brandPersonality.hashtags;
  const selectedHashtags = [];
  // Select 3-4 random hashtags
  while (selectedHashtags.length < 3) {
    const randomHashtag = hashtags[Math.floor(Math.random() * hashtags.length)];
    if (!selectedHashtags.includes(randomHashtag)) {
      selectedHashtags.push(randomHashtag);
    }
  }
  
  // Create personalized caption based on analysis content
  let caption = "";
  
  if (imageAnalysis.includes("sourdough") || imageAnalysis.includes("bread")) {
    caption = `${randomFirstPerson} - this sourdough has the perfect crust and chewy interior! The secret is our 15-year-old starter that gives it that distinctive tangy flavor. ${randomConnection} ${selectedHashtags.join(" ")}`;
  } else if (imageAnalysis.includes("croissant") || imageAnalysis.includes("pastry")) {
    caption = `${randomFirstPerson} with 27 delicate layers of buttery goodness! These take three days to make from start to finish, but the flaky result is so worth it. ${randomConnection} ${selectedHashtags.join(" ")}`;
  } else if (imageAnalysis.includes("cake") || imageAnalysis.includes("dessert")) {
    caption = `${randomFirstPerson} for a special celebration! Made with local ingredients and a whole lot of love. Perfect for birthdays, anniversaries, or just because it's Tuesday. ${randomConnection} ${selectedHashtags.join(" ")}`;
  } else if (imageAnalysis.includes("roll") || imageAnalysis.includes("cinnamon")) {
    caption = `${randomFirstPerson} and the bakery smells incredible! Our cinnamon rolls are made with Ceylon cinnamon and topped with cream cheese frosting. They're a Saturday morning tradition. ${randomConnection} ${selectedHashtags.join(" ")}`;
  } else {
    caption = `${randomFirstPerson} and couldn't wait to share! Made with traditional techniques and the finest ingredients. This is what makes mornings at Breadsmith so special. ${randomConnection} ${selectedHashtags.join(" ")}`;
  }
  
  return caption;
}

// Function to prepare post content
async function preparePost(imagePath) {
  console.log(`Processing new image: ${imagePath}`);
  
  try {
    // Analyze the image
    const imageAnalysis = await analyzeImage(imagePath);
    console.log("Image analysis complete");
    
    // Generate caption
    const caption = await generateCaption(imageAnalysis);
    console.log("Caption generated");
    
    // Create a post object
    const post = {
      imagePath,
      caption,
      analysisTimestamp: new Date().toISOString(),
      status: 'ready', // ready, posted, error
      analysis: imageAnalysis
    };
    
    // Save the post data to a JSON file (same name as image but .json extension)
    const postDataPath = path.join(
      processedDirectory, 
      `${path.basename(imagePath, path.extname(imagePath))}.json`
    );
    
    fs.writeFileSync(postDataPath, JSON.stringify(post, null, 2));
    
    // Move the image to processed directory
    const newImagePath = path.join(processedDirectory, path.basename(imagePath));
    fs.copyFileSync(imagePath, newImagePath);
    fs.unlinkSync(imagePath); // Remove from upload directory
    
    console.log(`Post prepared and saved to ${postDataPath}`);
    return post;
  } catch (error) {
    console.error("Error preparing post:", error);
    return null;
  }
}

// Watch for new images in upload directory
console.log(`Watching for new images in ${uploadDirectory}`);
const watcher = chokidar.watch(uploadDirectory, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});

// Process new images as they're added
watcher.on('add', async (filePath) => {
  // Check if it's an image file
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(filePath).toLowerCase();
  
  if (validExtensions.includes(ext)) {
    // Wait a moment to ensure file is fully written
    setTimeout(async () => {
      await preparePost(filePath);
    }, 1000);
  }
});

// Basic CLI interface
console.log("Breadsmith Marketing Automation Started (TEST MODE)");
console.log("Upload images to the 'uploads' folder to generate captions automatically");
console.log("Press Ctrl+C to stop the service");
