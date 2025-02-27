# Breadsmith Marketing Automation

An automated Instagram marketing solution for Breadsmith bakery. This system analyzes bakery photos, generates personalized captions, posts to Instagram on a schedule, and responds to comments with a personalized, authentic voice.

## 🌟 Features

- **AI-Powered Photo Analysis**: Analyzes bakery product photos to identify what's in them
- **Personalized Caption Generation**: Creates captions in the bakery owner's authentic voice
- **Automated Instagram Posting**: Posts content on a customizable schedule
- **Customer Relationship Management**: Remembers customer interactions and builds relationships over time
- **Comment Response System**: Automatically engages with followers in a personal way

## 📋 Prerequisites

- Node.js (v14 or higher)
- DeepSeek API key
- Instagram business account credentials
- Computer or server that can run Node.js applications

## 🚀 Quick Start

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```
   cp .env.example .env
   ```
4. Start the application:
   ```
   npm start
   ```

## 📁 Project Structure

- **caption-generator.js**: Monitors a folder for new images, analyzes them, and generates captions
- **instagram-poster.js**: Handles posting to Instagram and monitoring/responding to comments
- **startup.js**: Starts both services together
- **config/brand-personality.js**: Customizable brand voice settings

## 📝 Usage

1. Take high-quality photos of bakery products
2. Copy or move the photos to the `uploads` folder
3. The system will process them automatically
4. Photos will be posted to Instagram according to the schedule
5. The system will monitor and respond to comments automatically

## ⚙️ Configuration

Edit the `.env` file to configure:
- API keys
- Instagram credentials
- Directory paths

Customize your brand voice and personality in `config/brand-personality.js`.

## 📚 Documentation

See the [docs](./docs) folder for detailed documentation:

- [Setup Guide](./docs/setup-guide.md): Complete installation and setup instructions
- [User Guide](./docs/user-guide.md): Guide for bakery owners
- [Developer Guide](./docs/developer-guide.md): Technical documentation for developers

## 🔒 Security Notes

- Store your `.env` file securely and never commit it to version control
- Instagram credentials are sensitive—keep them protected
- Consider using environment variables if deploying to a cloud service

## 📞 Support

For support or questions, please open an issue on GitHub.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
