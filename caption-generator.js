// Breadsmith Marketing Automation - Caption Generator
// This prototype demonstrates how to:
// 1. Monitor a folder for new images
// 2. Analyze images using a free vision API
// 3. Generate appropriate captions with an LLM
// 4. Prepare content for Instagram posting

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const chokidar = require('chokidar'); // For watching file changes
const FormData = require('form-data');

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY; // Get from .env file
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

// Load brand personality configuration
const brandPersonality = require('./config/brand-personality');

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

// Function to analyze image using DeepSeek Vision API
async function analyzeImage(imagePath) {
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', imageBuffer, { filename: path.basename(imagePath) });
    
    // Call DeepSeek API
    const response = await axios.post(
      `${DEEPSEEK_API_URL}/vision/analyze`, 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          ...formData.getHeaders()
        },
        params: {
          prompt: "Describe this bakery item in detail. What is it? How does it look? What ingredients might be in it? Is it a bread, pastry, or dessert? Describe textures and visual appeal."
        }
      }
    );
    
    return response.data.description;
  } catch (error) {
    console.error("Error analyzing image:", error);
    console.error(error.response?.data || error.message);
    return "Error analyzing image. Please try again.";
  }
}

// Function to generate a personalized Instagram caption based on image analysis
async function generateCaption(imageAnalysis) {
  try {
    // Identify keywords in the analysis to trigger personalized content
    let personalizedPrompt = `You are ${brandPersonality.personality.ownerDetails.name}, the owner of Breadsmith bakery in Lake Charles, Illinois who has been baking for ${brandPersonality.personality.ownerDetails.years} years.\n\n`;
    
    // Check for trigger words to personalize further
    for (const [trigger, phrases] of Object.entries(brandPersonality.personality.customerTriggers)) {
      if (imageAnalysis.toLowerCase().includes(trigger)) {
        personalizedPrompt += `Since this seems to be related to "${trigger}", consider mentioning: ${phrases.join(', ')}.\n`;
      }
    }
    
    // Add a first-person touch
    const randomFirstPerson = brandPersonality.personality.firstPersonPhrases[
      Math.floor(Math.random() * brandPersonality.personality.firstPersonPhrases.length)
    ];
    
    // Add a connection phrase
    const randomConnection = brandPersonality.personality.connectionPhrases[
      Math.floor(Math.random() * brandPersonality.personality.connectionPhrases.length)
    ];
    
    // Call DeepSeek API for text generation
    const response = await axios.post(
      `${DEEPSEEK_API_URL}/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `${personalizedPrompt}
            Your tone is ${brandPersonality.tone}. 
            The bakery values ${brandPersonality.values.join(", ")}. 
            Use these key phrases when appropriate: ${brandPersonality.keyPhrases.join(", ")}.
            Use first person phrasing, as if you're the bakery owner. Consider using something like: "${randomFirstPerson}"
            End with a connection to customers, such as: "${randomConnection}"`
          },
          {
            role: "user",
            content: `Based on this description of a bakery item, create an engaging, warm Instagram caption that's between 2-4 sentences. 
            Make it personal, written in the first person as if you're me (the bakery owner). 
            Include 3-4 relevant hashtags from our list or create new ones if appropriate.
            
            Image description: ${imageAnalysis}`
          }
        ],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating caption:", error);
    console.error(error.response?.data || error.message);
    return "Error generating caption. Please try again.";
  }
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
console.log("Breadsmith Marketing Automation Started");
console.log("Upload images to the 'uploads' folder to generate captions automatically");
console.log("Press Ctrl+C to stop the service");
