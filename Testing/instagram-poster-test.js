// Breadsmith Marketing Automation - Instagram Poster (TEST VERSION)
// This script handles:
// 1. Finding prepared posts in the processed directory
// 2. Posting to Instagram using Facebook Graph API
// 3. Monitoring and responding to comments

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

console.log("TESTING MODE: Using mock API responses instead of real Instagram API calls");

// Directory where processed content is stored
const processedDirectory = process.env.PROCESSED_DIRECTORY || './processed';
const postedDirectory = process.env.POSTED_DIRECTORY || './posted';

// Ensure directories exist
if (!fs.existsSync(postedDirectory)) {
  fs.mkdirSync(postedDirectory, { recursive: true });
}

// MOCK customer context database
const customerContextDB = {
  customers: {
    // Add some mock customers for testing
    "johndoe": {
      interactions: [
        {
          comment: "These look delicious! I love your sourdough bread.",
          timestamp: "2023-11-01T14:22:33.000Z",
          productContext: "sourdough bread",
          ourResponse: "Thanks John! Always great to hear from our regular customers!"
        }
      ],
      lastInteraction: "2023-11-01T14:22:33.000Z",
      preferredProducts: new Set(["sourdough bread"]),
      tone: "enthusiastic",
      regularCustomer: true
    },
    "bakery_lover": {
      interactions: [
        {
          comment: "Your croissants are amazing!",
          timestamp: "2023-11-05T09:15:00.000Z",
          productContext: "croissant",
          ourResponse: "Thank you! I'm so glad you enjoy them!"
        }
      ],
      lastInteraction: "2023-11-05T09:15:00.000Z",
      preferredProducts: new Set(["croissant"]),
      tone: "enthusiastic",
      regularCustomer: false
    }
  },
  
  // Add or update customer interaction
  updateCustomer: function(username, commentData) {
    console.log(`[MOCK] Updating customer data for ${username}`);
    
    if (!this.customers[username]) {
      this.customers[username] = {
        interactions: [],
        lastInteraction: null,
        preferredProducts: new Set(),
        tone: 'neutral',
        regularCustomer: false
      };
    }
    
    // Add this interaction
    this.customers[username].interactions.push({
      comment: commentData.comment,
      timestamp: commentData.timestamp || new Date().toISOString(),
      productContext: commentData.productContext || 'unknown',
      ourResponse: commentData.ourResponse
    });
    
    // Update last interaction time
    this.customers[username].lastInteraction = new Date().toISOString();
    
    // Update if they mentioned liking a product
    if (commentData.productMentioned) {
      this.customers[username].preferredProducts.add(commentData.productMentioned);
    }
    
    // Check if regular customer (3+ comments)
    if (this.customers[username].interactions.length >= 3) {
      this.customers[username].regularCustomer = true;
    }
    
    // Save DB periodically (simplified for prototype)
    fs.writeFileSync('./customerContext-test.json', JSON.stringify(this.customers, null, 2));
    console.log(`[MOCK] Customer data saved to customerContext-test.json`);
  },
  
  // Get customer context for personalized responses
  getCustomerContext: function(username) {
    return this.customers[username] || null;
  }
};

// MOCK - Initialize Instagram client
async function initializeInstagram() {
  console.log('[MOCK] Instagram login successful');
  return true;
}

// MOCK - Function to analyze comment for product mentions
function analyzeCommentForProducts(comment, productList) {
  const commentLower = comment.toLowerCase();
  return productList.find(product => commentLower.includes(product.toLowerCase())) || null;
}

// MOCK - Function to generate a response to a comment
async function generateCommentResponse(username, comment, postContext) {
  console.log(`[MOCK] Generating response to comment from ${username}: "${comment}"`);
  
  // Get customer context
  const customerContext = customerContextDB.getCustomerContext(username);
  
  // Simulate response generation
  let response = "";
  
  // Check if regular customer
  if (customerContext && customerContext.regularCustomer) {
    response = `Thanks for being such a loyal customer, ${username}! I always love seeing your comments. -Linda`;
  } 
  // Check for product mentions
  else if (comment.toLowerCase().includes("bread") || comment.toLowerCase().includes("sourdough")) {
    response = "So glad you enjoyed our bread! It's made fresh every morning. -Linda";
  }
  else if (comment.toLowerCase().includes("pastry") || comment.toLowerCase().includes("croissant")) {
    response = "The pastries are my favorite too! Come in early to get them warm from the oven! -Linda";
  }
  // Generic positive response
  else if (comment.toLowerCase().includes("love") || comment.toLowerCase().includes("delicious") || comment.toLowerCase().includes("amazing")) {
    response = "Thank you so much for your kind words! Makes my day! ❤️";
  }
  // Generic response
  else {
    response = "Thanks for your comment! Hope to see you in the bakery soon!";
  }
  
  // Update customer context
  customerContextDB.updateCustomer(username, {
    comment: comment,
    timestamp: new Date().toISOString(),
    productContext: postContext,
    ourResponse: response
  });
  
  return response;
}

// MOCK - Function to post image to Instagram
async function postToInstagram(imagePath, caption) {
  console.log(`[MOCK] Posting to Instagram: "${path.basename(imagePath)}"`);
  console.log(`[MOCK] Caption: "${caption}"`);
  
  // Simulate successful post
  return {
    success: true,
    mediaId: `test_media_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
}

// MOCK - Function to monitor and respond to comments on a post
async function monitorComments(mediaId, postData) {
  console.log(`[MOCK] Checking for comments on media ID: ${mediaId}`);
  
  // Get already responded comments from post data
  const respondedCommentIds = new Set(postData.respondedComments || []);
  
  // Extract post context for more relevant responses
  const postContext = postData.analysis || postData.caption || "bakery product";
  
  // Generate mock comments if there are none yet
  if (!postData.mockComments) {
    postData.mockComments = [
      {
        pk: `comment_1_${mediaId}`,
        user: { username: "bakery_fan123" },
        text: "This looks absolutely delicious! I need to visit your bakery soon!",
        created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        pk: `comment_2_${mediaId}`,
        user: { username: "breadlover" },
        text: "Is this sourdough available every day or only on weekends?",
        created_at: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      }
    ];
  }
  
  // Check for new comments
  for (const comment of postData.mockComments) {
    // Skip if we've already responded
    if (respondedCommentIds.has(comment.pk)) {
      continue;
    }
    
    console.log(`[MOCK] New comment from ${comment.user.username}: ${comment.text}`);
    
    // Generate personalized response
    const response = await generateCommentResponse(
      comment.user.username, 
      comment.text, 
      postContext
    );
    
    // Simulate posting the response
    console.log(`[MOCK] Responded to ${comment.user.username} with: ${response}`);
    
    // Mark comment as responded
    respondedCommentIds.add(comment.pk);
    
    // Save interaction to customer database
    if (!postData.commentInteractions) {
      postData.commentInteractions = [];
    }
    
    postData.commentInteractions.push({
      commentId: comment.pk,
      username: comment.user.username,
      comment: comment.text,
      response: response,
      timestamp: new Date().toISOString()
    });
  }
  
  // Update the post data
  postData.respondedComments = Array.from(respondedCommentIds);
  postData.lastCommentCheck = new Date().toISOString();
  
  return postData;
}

// Function to find and post unposted content
async function findAndPostContent() {
  try {
    console.log('[MOCK] Checking for content to post');
    const files = fs.readdirSync(processedDirectory);
    
    // Find JSON files with post data
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    
    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(processedDirectory, jsonFile);
      const postData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      
      // Check if post is ready to be posted (not already posted)
      if (postData.status === 'ready') {
        console.log(`Found unposted content: ${jsonFile}`);
        
        // Get the image path
        const imageName = path.basename(postData.imagePath);
        const imagePath = path.join(processedDirectory, imageName);
        
        if (fs.existsSync(imagePath)) {
          // Post to Instagram
          console.log(`Posting to Instagram: ${imageName}`);
          const postResult = await postToInstagram(imagePath, postData.caption);
          
          if (postResult.success) {
            // Update post data with posting info
            postData.status = 'posted';
            postData.instagramPostingResult = postResult;
            postData.respondedComments = [];
            
            // Save updated post data
            fs.writeFileSync(jsonPath, JSON.stringify(postData, null, 2));
            
            // Move files to posted directory
            const newImagePath = path.join(postedDirectory, imageName);
            const newJsonPath = path.join(postedDirectory, jsonFile);
            
            fs.copyFileSync(imagePath, newImagePath);
            fs.copyFileSync(jsonPath, newJsonPath);
            
            // Remove from processed directory
            fs.unlinkSync(imagePath);
            fs.unlinkSync(jsonPath);
            
            console.log(`Successfully posted and moved to posted directory: ${imageName}`);
          }
        } else {
          console.error(`Image file not found: ${imagePath}`);
        }
      }
    }
    
    if (jsonFiles.length === 0) {
      console.log('[MOCK] No content ready to post');
    }
  } catch (error) {
    console.error("Error finding and posting content:", error);
  }
}

// Function to check for comments on recently posted content
async function checkRecentPostComments() {
  try {
    console.log('[MOCK] Checking for comments on recent posts');
    const files = fs.readdirSync(postedDirectory);
    
    // Find JSON files with post data
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    
    // Check if any files exist
    if (jsonFiles.length === 0) {
      console.log('[MOCK] No posted content found to check for comments');
      return;
    }
    
    // Sort by posting date (most recent first)
    const sortedJsonFiles = jsonFiles
      .map(file => {
        const jsonPath = path.join(postedDirectory, file);
        const postData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return { file, postData };
      })
      .filter(item => item.postData.status === 'posted' && item.postData.instagramPostingResult?.mediaId)
      .sort((a, b) => {
        const dateA = new Date(a.postData.instagramPostingResult.timestamp);
        const dateB = new Date(b.postData.instagramPostingResult.timestamp);
        return dateB - dateA; // Most recent first
      });
    
    // Check comments for posts from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (const { file, postData } of sortedJsonFiles) {
      const postDate = new Date(postData.instagramPostingResult.timestamp);
      
      // Skip if older than 30 days
      if (postDate < thirtyDaysAgo) {
        continue;
      }
      
      console.log(`[MOCK] Checking comments for post from ${postDate.toLocaleDateString()}`);
      
      // Monitor and respond to comments
      const mediaId = postData.instagramPostingResult.mediaId;
      const updatedPostData = await monitorComments(mediaId, postData);
      
      // Save updated post data
      const jsonPath = path.join(postedDirectory, file);
      fs.writeFileSync(jsonPath, JSON.stringify(updatedPostData, null, 2));
    }
  } catch (error) {
    console.error("Error checking recent post comments:", error);
  }
}

// Main function to start the service
async function main() {
  try {
    // Initialize Instagram (mock)
    await initializeInstagram();
    
    // Simulate shorter schedules for testing - every minute for posting and every 2 minutes for comments
    const postingSchedule = '* * * * *'; // Every minute
    const commentSchedule = '*/2 * * * *'; // Every 2 minutes
    
    console.log(`[MOCK] Setting test schedules - Posting: ${postingSchedule}, Comments: ${commentSchedule}`);
    
    // Schedule posting
    cron.schedule(postingSchedule, async () => {
      console.log('[MOCK] Running scheduled post check');
      await findAndPostContent();
    });
    
    // Check for comments
    cron.schedule(commentSchedule, async () => {
      console.log('[MOCK] Running scheduled comment check');
      await checkRecentPostComments();
    });
    
    // Initial run
    await findAndPostContent();
    await checkRecentPostComments();
    
    console.log('[MOCK] Instagram automation service started');
    console.log('[MOCK] Posts will be checked every minute');
    console.log('[MOCK] Comments will be checked every 2 minutes');
  } catch (error) {
    console.error('Error starting Instagram automation service:', error);
  }
}

// Start the service
main().catch(console.error);
