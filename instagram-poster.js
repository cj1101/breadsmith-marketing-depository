// Breadsmith Marketing Automation - Instagram Poster
// This script handles:
// 1. Finding prepared posts in the processed directory
// 2. Posting to Instagram using Facebook Graph API
// 3. Monitoring and responding to comments

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { IgApiClient } = require('instagram-private-api');
const cron = require('node-cron');

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

// Instagram credentials (should be stored in .env file)
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

// Directory where processed content is stored
const processedDirectory = process.env.PROCESSED_DIRECTORY || './processed';
const postedDirectory = process.env.POSTED_DIRECTORY || './posted';

// Ensure directories exist
if (!fs.existsSync(postedDirectory)) {
  fs.mkdirSync(postedDirectory, { recursive: true });
}

// Instagram API client
const ig = new IgApiClient();

// Context database to remember customer interactions
const customerContextDB = {
  customers: {},
  
  // Add or update customer interaction
  updateCustomer: function(username, commentData) {
    if (!this.customers[username]) {
      this.customers[username] = {
        interactions: [],
        lastInteraction: null,
        preferredProducts: new Set(),
        tone: 'neutral', // can be 'enthusiastic', 'neutral', 'concerned' based on their comments
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
    
    // Analyze tone based on keywords
    const positiveWords = ['love', 'delicious', 'amazing', 'yummy', 'best', 'great', 'awesome'];
    const negativeWords = ['disappointed', 'bad', 'worst', 'not good', 'terrible', 'poor'];
    
    const comment = commentData.comment.toLowerCase();
    
    if (positiveWords.some(word => comment.includes(word))) {
      this.customers[username].tone = 'enthusiastic';
    } else if (negativeWords.some(word => comment.includes(word))) {
      this.customers[username].tone = 'concerned';
    }
    
    // Save DB periodically (simplified for prototype)
    fs.writeFileSync('./customerContext.json', JSON.stringify(this.customers, null, 2));
  },
  
  // Get customer context for personalized responses
  getCustomerContext: function(username) {
    return this.customers[username] || null;
  },
  
  // Initialize DB from file if exists
  initialize: function() {
    try {
      if (fs.existsSync('./customerContext.json')) {
        const data = JSON.parse(fs.readFileSync('./customerContext.json', 'utf8'));
        this.customers = data;
        console.log('Loaded customer context database');
      }
    } catch (error) {
      console.error('Error loading customer context:', error);
    }
  }
};

// Initialize the customer context database
customerContextDB.initialize();

// Initialize Instagram client
async function initializeInstagram() {
  ig.state.generateDevice(IG_USERNAME);
  await ig.account.login(IG_USERNAME, IG_PASSWORD);
  console.log('Instagram login successful');
}

// Function to analyze comment for product mentions
function analyzeCommentForProducts(comment, productList) {
  const commentLower = comment.toLowerCase();
  return productList.find(product => commentLower.includes(product.toLowerCase())) || null;
}

// Function to generate a highly personalized response to a comment
async function generateCommentResponse(username, comment, postContext) {
  try {
    // Get customer context if available
    const customerContext = customerContextDB.getCustomerContext(username);
    
    // Build personalization context
    let personalizationContext = "";
    if (customerContext) {
      // Is this a returning commenter?
      if (customerContext.regularCustomer) {
        personalizationContext += `This is a regular customer who has commented ${customerContext.interactions.length} times before. `;
      }
      
      // Do they have preferred products?
      if (customerContext.preferredProducts.size > 0) {
        personalizationContext += `They have previously mentioned liking: ${Array.from(customerContext.preferredProducts).join(', ')}. `;
      }
      
      // What's their typical tone?
      personalizationContext += `Their usual tone appears to be ${customerContext.tone}. `;
      
      // When did they last interact?
      if (customerContext.lastInteraction) {
        const lastInteraction = new Date(customerContext.lastInteraction);
        const daysSince = Math.floor((new Date() - lastInteraction) / (1000 * 60 * 60 * 24));
        
        if (daysSince < 7) {
          personalizationContext += `They last commented ${daysSince} days ago. `;
        }
      }
    }
    
    // Product analysis
    const productMentioned = analyzeCommentForProducts(comment, [
      'bread', 'sourdough', 'pastry', 'roll', 'cake', 'muffin', 'coffee',
      // Add other bakery products here
    ]);
    
    // Call DeepSeek API for personalized response
    const response = await axios.post(
      `${DEEPSEEK_API_URL}/chat/completions`,
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system", 
            content: `You are the friendly owner (Linda) of Breadsmith bakery in Lake Charles. 
            Respond warmly and personally to customer comments.
            Keep responses concise (max 100 characters), authentic, and in your voice.
            ${personalizationContext ? 'Important customer context: ' + personalizationContext : ''}
            This comment is on a post about: ${postContext || 'a bakery product'}.
            ${productMentioned ? 'They specifically mentioned ' + productMentioned + '.' : ''}
            
            Guidelines:
            - If they're a regular customer, acknowledge them warmly
            - If they mention a product they've liked before, reference that
            - Always use first-person tone as the bakery owner
            - For negative comments, respond with empathy and an offer to make it right
            - Keep it personable and warm, like speaking to a friend
            - Sign with your first name (Linda) on longer responses`
          },
          {
            role: "user",
            content: `A customer (${username}) commented on our bakery Instagram post: "${comment}". How should I personally respond?`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const generatedResponse = response.data.choices[0].message.content;
    
    // Update customer context
    customerContextDB.updateCustomer(username, {
      comment: comment,
      timestamp: new Date().toISOString(),
      productContext: postContext,
      ourResponse: generatedResponse,
      productMentioned: productMentioned
    });
    
    return generatedResponse;
  } catch (error) {
    console.error("Error generating comment response:", error);
    console.error(error.response?.data || error.message);
    return "Thank you so much for your comment! ❤️ -Linda";  // Default fallback response
  }
}

// Function to post image to Instagram
async function postToInstagram(imagePath, caption) {
  try {
    // Upload the photo
    const publishResult = await ig.publish.photo({
      file: fs.readFileSync(imagePath),
      caption: caption,
    });
    
    console.log(`Post successful! Media ID: ${publishResult.media.id}`);
    return {
      success: true,
      mediaId: publishResult.media.id,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to post to Instagram:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to monitor and respond to comments on a post
async function monitorComments(mediaId, postData) {
  try {
    // Get comments on the post
    const commentsResponse = await ig.media.comments(mediaId);
    const comments = commentsResponse.comments || [];
    
    // Get already responded comments from post data
    const respondedCommentIds = new Set(postData.respondedComments || []);
    
    // Extract post context for more relevant responses
    const postContext = postData.analysis || postData.caption || "bakery product";
    
    // Check for new comments
    for (const comment of comments) {
      // Skip if we've already responded or if it's our own comment
      if (respondedCommentIds.has(comment.pk) || comment.user_id === ig.state.cookieUserId) {
        continue;
      }
      
      console.log(`New comment from ${comment.user.username}: ${comment.text}`);
      
      // Generate personalized response
      const response = await generateCommentResponse(
        comment.user.username, 
        comment.text, 
        postContext
      );
      
      // Post the response
      await ig.media.comment({
        mediaId: mediaId,
        text: response
      });
      
      console.log(`Responded to ${comment.user.username} with: ${response}`);
      
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
  } catch (error) {
    console.error("Error monitoring comments:", error);
    return postData;
  }
}

// Function to find and post unposted content
async function findAndPostContent() {
  try {
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
  } catch (error) {
    console.error("Error finding and posting content:", error);
  }
}

// Function to check for comments on recently posted content
async function checkRecentPostComments() {
  try {
    const files = fs.readdirSync(postedDirectory);
    
    // Find JSON files with post data
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    
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
      
      console.log(`Checking comments for post from ${postDate.toLocaleDateString()}`);
      
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
    // Initialize Instagram
    await initializeInstagram();
    
    // Schedule posting - twice per day (11 AM and 3 PM)
    cron.schedule(process.env.POSTING_SCHEDULE || '0 11,15 * * *', async () => {
      console.log('Running scheduled post check');
      await findAndPostContent();
    });
    
    // Check for comments every 4 hours
    cron.schedule(process.env.COMMENT_CHECK_SCHEDULE || '0 */4 * * *', async () => {
      console.log('Running scheduled comment check');
      await checkRecentPostComments();
    });
    
    // Initial run
    await findAndPostContent();
    await checkRecentPostComments();
    
    console.log('Instagram automation service started');
    console.log('Posts will be published at 11 AM and 3 PM daily');
    console.log('Comments will be checked and responded to every 4 hours');
  } catch (error) {
    console.error('Error starting Instagram automation service:', error);
  }
}

// Start the service
main().catch(console.error);
