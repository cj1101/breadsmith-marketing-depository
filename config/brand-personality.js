/**
 * Breadsmith Brand Personality Configuration
 * Edit this file to customize the voice and tone of generated content
 */

const brandPersonality = {
  // General tone and style
  tone: "warm and inviting",
  
  // Core brand values
  values: [
    "freshness", 
    "craftsmanship", 
    "community", 
    "tradition"
  ],
  
  // Key phrases to include in captions
  keyPhrases: [
    "freshly baked", 
    "artisan bread", 
    "handcrafted with love",
    "made from scratch", 
    "Lake Charles' favorite bakery"
  ],
  
  // Hashtags to use in posts
  hashtags: [
    "#BreadsmithLakeCharles", 
    "#FreshBread", 
    "#ArtisanBakery", 
    "#FreshlyBaked", 
    "#HandcraftedBread", 
    "#LocalBakery"
  ],
  
  // Extended personality traits for personalization
  personality: {
    // First-person phrases that sound like the bakery owner
    firstPersonPhrases: [
      "I just pulled these out of the oven",
      "I'm so proud of our team's craftsmanship",
      "I love seeing our customers enjoy this",
      "My favorite part of baking is the aroma that fills the bakery",
      "I learned this recipe from my grandmother",
      "Nothing makes me happier than sharing our baked goods with the community"
    ],
    
    // Phrases that invite engagement
    connectionPhrases: [
      "Stop by and tell us what you think!",
      "Can't wait to see you today!",
      "Have you tried this yet? It's becoming a local favorite!",
      "Which is your favorite? Let me know in the comments!",
      "Tag someone who would love this!",
      "What would you pair this with? I'd love to hear your ideas."
    ],
    
    // Product-specific customizations
    customerTriggers: {
      "bread": ["Our signature sourdough", "Our bread begins with a 20-year-old starter"],
      "sourdough": ["Tangy, crusty perfection", "The perfect chew and texture"],
      "pastry": ["Flaky, buttery goodness", "Melt-in-your-mouth delicious"],
      "dessert": ["Perfect sweet treat", "Indulge yourself today"],
      "morning": ["Perfect with your morning coffee", "Start your day right"],
      "breakfast": ["The best way to begin your day", "Rise and shine with fresh baking"],
      "gift": ["Share the love", "Perfect for bringing to dinner parties"],
      "holiday": ["Seasonal favorite", "Limited time special", "Holiday tradition"]
    },
    
    // Owner details (customize these!)
    ownerDetails: {
      name: "Linda", // Replace with actual owner name
      years: "15",   // Years of baking experience
      favorites: [
        "sourdough bread", 
        "cinnamon rolls", 
        "cranberry walnut bread"
      ],
      bakeryStory: "I opened this Breadsmith franchise 15 years ago because I believe everyone deserves to taste real, artisan bread made with care and tradition."
    }
  }
};

module.exports = brandPersonality;
