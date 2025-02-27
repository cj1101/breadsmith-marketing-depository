# Breadsmith Marketing Automation: Setup Guide

This guide walks you through the complete setup process for the Breadsmith Marketing Automation system.

## Prerequisites

Before you begin, make sure you have the following:

1. **Node.js**: Version 14 or higher installed on your computer or server
   - Download from [nodejs.org](https://nodejs.org/)
   - To check if you have it: Run `node -v` in your terminal/command prompt

2. **DeepSeek API Key**:
   - Sign up at [deepseek.com](https://deepseek.com)
   - Create an API key with vision capabilities
   - Keep this key private and secure

3. **Instagram Business Account**:
   - You'll need the username and password for your bakery's Instagram account
   - Ensure the account has business features enabled

## Installation Options

You can set up this automation in two ways:

### Option 1: Local Installation (Your Computer)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/breadsmith-marketing-automation.git
   cd breadsmith-marketing-automation
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   - Copy the example file: `cp .env.example .env`
   - Edit the `.env` file with your credentials

4. **Start the Service**:
   ```bash
   npm start
   ```

### Option 2: Cloud Deployment

#### Heroku Deployment

1. **Create a Heroku Account** at [heroku.com](https://heroku.com)

2. **Install Heroku CLI** from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

3. **Prepare the Application**:
   ```bash
   git clone https://github.com/yourusername/breadsmith-marketing-automation.git
   cd breadsmith-marketing-automation
   heroku create breadsmith-marketing
   ```

4. **Configure Environment Variables**:
   ```bash
   heroku config:set DEEPSEEK_API_KEY=your_deepseek_api_key
   heroku config:set IG_USERNAME=your_instagram_username
   heroku config:set IG_PASSWORD=your_instagram_password
   ```

5. **Deploy the Application**:
   ```bash
   git push heroku main
   ```

6. **Set Up Image Upload** (requires additional development - contact developer)

#### DigitalOcean Deployment

1. **Create a Droplet** at [digitalocean.com](https://digitalocean.com)

2. **Connect to Your Droplet** via SSH

3. **Install Node.js**:
   ```bash
   curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2** (process manager):
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone and Set Up the Repository**:
   ```bash
   git clone https://github.com/yourusername/breadsmith-marketing-automation.git
   cd breadsmith-marketing-automation
   npm install
   ```

6. **Configure Environment**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your credentials
   ```

7. **Start with PM2**:
   ```bash
   pm2 start startup.js --name breadsmith
   pm2 save
   pm2 startup
   ```

## Configuration

### Essential Settings

Edit your `.env` file with these required settings:

```
# DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Instagram Account Credentials
IG_USERNAME=your_instagram_username
IG_PASSWORD=your_instagram_password

# Directories (default settings usually work fine)
UPLOAD_DIRECTORY=./uploads
PROCESSED_DIRECTORY=./processed
POSTED_DIRECTORY=./posted

# Posting Schedule (11 AM and 3 PM daily by default)
POSTING_SCHEDULE="0 11,15 * * *"

# Comment Checking Schedule (every 4 hours by default)
COMMENT_CHECK_SCHEDULE="0 */4 * * *"
```

### Customizing Brand Voice

Edit the `config/brand-personality.js` file to customize:

- **Owner Details**: Name, experience, favorite products
- **Brand Values**: What your bakery stands for
- **Key Phrases**: Special phrases that represent your brand
- **First-Person Voice**: How you personally speak
- **Product-Specific Language**: Special terms for different products

## Testing the Installation

1. Start the service: `npm start`

2. Test image uploading:
   - Place a bakery product photo in the `uploads` folder
   - Check the logs to see it being processed
   - Look in the `processed` folder for the JSON file with the caption

3. Verify Instagram connection:
   - The service should log a successful Instagram login
   - Check for any error messages related to authentication

## Troubleshooting

### Common Issues

1. **Instagram Login Fails**:
   - Make sure your username and password are correct
   - Check if your account has two-factor authentication (currently not supported)
   - Try logging in manually first, then restart the service

2. **DeepSeek API Errors**:
   - Verify your API key is correct and active
   - Ensure you have credit available on your DeepSeek account

3. **No Images Being Processed**:
   - Check that the images are in the correct folder
   - Verify the image formats are supported (JPG, PNG, etc.)
   - Check file permissions if on Linux/Mac

4. **Service Crashes**:
   - Check the error logs for specific issues
   - Make sure all dependencies were installed correctly

### Getting Help

If you encounter issues not covered here, please:

1. Open an issue on GitHub
2. Include detailed error messages and steps to reproduce
3. Specify your operating system and Node.js version

## Next Steps

After successful installation, please read the [User Guide](./user-guide.md) for information on how to use the system effectively.
