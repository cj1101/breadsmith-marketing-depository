# Breadsmith Marketing Automation: User Guide

Welcome to your automated Instagram marketing system! This guide will help you effectively use the system to showcase your bakery products, engage with customers, and save time on social media management.

## Overview: How It Works

This system automates your Instagram marketing through these steps:

1. **Photo Processing**: You take photos of your bread and bakery items
2. **AI Analysis**: The system analyzes the photos to identify what's in them
3. **Caption Generation**: Creates personalized captions in your authentic voice
4. **Scheduled Posting**: Posts content to Instagram on a set schedule
5. **Comment Monitoring**: Automatically engages with followers' comments

## Day-to-Day Usage

### Taking Effective Photos

For best results:

- **Lighting**: Use natural light whenever possible
- **Composition**: Show the product clearly, consider using props (coffee cup, cutting board)
- **Variety**: Include different angles and products
- **Quality**: High-resolution, in-focus images work best for AI analysis
- **Quantity**: Aim for 3-5 photos per week for consistent posting

### Uploading Photos

1. Take photos of your bakery products
2. Transfer them to your computer
3. Place them in the `uploads` folder of the system
4. The system will automatically process them

### Reviewing Captions Before Posting

After processing but before posting, you can:

1. Check the `processed` folder
2. Open the JSON file with the same name as your image
3. Review the generated caption
4. Edit the caption if needed (by changing the JSON file)

### Monitoring Performance

The system stores:
- Photos that have been posted (in the `posted` folder)
- Comment interactions (in `customerContext.json`)

Review these periodically to:
- See which products get the most engagement
- Understand which captions perform best
- Identify your most engaged followers

## Customizing Your System

### Adjusting Your Brand Voice

To make the captions sound more like you:

1. Open the `config/brand-personality.js` file
2. Edit the `ownerDetails` section with your name and preferences
3. Add phrases you commonly use to `firstPersonPhrases`
4. Update your bakery's `values` and `keyPhrases`

Example updates:
```javascript
ownerDetails: {
  name: "Linda",  // Your actual name
  years: "15",    // Your actual experience
  favorites: [
    "honey wheat bread",  // Your actual favorites
    "apple turnovers",
    "rosemary focaccia"
  ]
}
```

### Changing Posting Schedule

The default schedule posts at 11 AM and 3 PM daily. To change this:

1. Edit the `.env` file
2. Update the `POSTING_SCHEDULE` line
3. Use cron format: `* * * * *` (minute, hour, day, month, weekday)

Examples:
- `0 9,17 * * *` - Post at 9 AM and 5 PM
- `0 12 * * 1,4` - Post at noon on Mondays and Thursdays only

### Adding Special Product Keywords

To customize captions for specific products:

1. Open `config/brand-personality.js`
2. Find the `customerTriggers` section
3. Add new product keywords and phrases

Example:
```javascript
customerTriggers: {
  "focaccia": ["Crispy, herb-infused", "Perfect with olive oil"],
  "rye": ["Traditional recipe", "Great for sandwiches"]
}
```

## Advanced Features

### Customer Relationship Management

The system remembers your customers and builds relationships over time:

- It identifies returning commenters
- Remembers their product preferences
- Adapts responses based on their history
- Creates personalized interactions

### Handling Negative Comments

The system is designed to:

1. Detect negative sentiment in comments
2. Respond empathetically and professionally
3. Offer to make things right
4. Invite the customer to direct message for resolution

### Holiday and Seasonal Updates

For seasonal promotions or special events:

1. Update the `keyPhrases` in `config/brand-personality.js`
2. Add seasonal hashtags to the `hashtags` section
3. Add seasonal triggers to `customerTriggers`

## Maintenance and Support

### Regular System Checks

Periodically check:

1. That the system is running properly
2. That new photos are being processed
3. That posts are appearing on Instagram
4. That comments are being monitored and answered

### When to Contact Technical Support

Reach out for help if:

1. Instagram posts fail consistently
2. The system stops generating captions
3. Comment responses seem inappropriate
4. You need to change Instagram credentials

## Best Practices for Success

1. **Consistency**: Upload new photos regularly
2. **Quality**: Focus on high-quality, appealing food photography
3. **Variety**: Showcase different products and angles
4. **Engagement**: Check your Instagram occasionally to see how automatic responses are performing
5. **Adaptation**: Update your brand personality settings as your voice evolves

## Frequently Asked Questions

**Q: How many photos should I upload at once?**  
A: 3-5 per week is ideal for consistent posting.

**Q: Can I schedule specific posts for certain days?**  
A: Currently, the system posts chronologically. Add the most time-sensitive photos first.

**Q: What if I don't like a generated caption?**  
A: You can edit the caption in the JSON file before it's posted, or adjust your brand personality settings.

**Q: Does the system respond to all comments?**  
A: Yes, it will respond to new comments on posts from the last 30 days.

**Q: How do I turn off the system for vacation?**  
A: Simply shut down the application using Ctrl+C, and restart it when you return.
