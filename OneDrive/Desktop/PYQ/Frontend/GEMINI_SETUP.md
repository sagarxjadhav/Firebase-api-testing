# Gemini API Setup Instructions

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Setting Up the API Key

1. Open `src/config/gemini.js`
2. Replace `YOUR_API_KEY_HERE` with your actual API key:

```javascript
export const GEMINI_API_KEY = 'your-actual-api-key-here'
```

## Environment Variable Setup (Recommended)

For better security, you can also set the API key as an environment variable:

1. Create a `.env` file in the Frontend directory
2. Add: `VITE_GEMINI_API_KEY=your-actual-api-key-here`
3. Update `src/config/gemini.js` to use the environment variable:

```javascript
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE'
```

## Package Information

This project uses the `@google/genai` package for Gemini API integration:
- **Package**: `@google/genai` (already installed)
- **Model**: `gemini-2.0-flash` (latest and fastest)
- **API Key**: `AIzaSyBpHn2yL8vqDbVGzAR2CxTmU5D9kxMcOVw` ✅
- **Project Number**: `793775176147` ✅
- **Features**: Advanced reasoning, context-aware responses, safety controls

## Features

The AI chat assistant can help users with:

- **Performance Analysis**: Analyze quiz scores, accuracy trends, and performance patterns
- **Study Recommendations**: Suggest study strategies based on quiz performance
- **Weak Area Identification**: Identify topics where the user struggles
- **Progress Tracking**: Track improvement over time
- **Personalized Advice**: Provide customized study tips based on individual performance

## How It Works

1. **Data Collection**: The AI reads all quiz analysis history from localStorage
2. **Context Preparation**: Quiz data is formatted and sent as context to Gemini
3. **AI Processing**: Gemini analyzes the data and user questions
4. **Response Generation**: AI provides personalized responses based on quiz performance

## Example Questions Users Can Ask

- "How am I performing overall?"
- "What are my weak areas?"
- "How can I improve my accuracy?"
- "What should I focus on for my next quiz?"
- "Show me my progress over time"
- "Which topics do I need to practice more?"
- "Create a study plan for me"
- "What's my average score in the last 5 quizzes?"
- "Which year's questions are most challenging for me?"
- "Give me tips to improve my test-taking strategy"

## Fallback System

If the Gemini API is not configured or fails, the system will use intelligent mock responses based on the user's quiz data to ensure the feature always works.

## Security Note

- Never commit your API key to version control
- Consider using environment variables for production
- The API key is only used for AI responses and is not stored permanently
