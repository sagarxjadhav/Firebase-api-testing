import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API Configuration
// Replace 'YOUR_API_KEY_HERE' with your actual Gemini API key
// Or set VITE_GEMINI_API_KEY environment variable
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE'
export const GEMINI_PROJECT_NUMBER = '978725243334'

// Function to call Gemini API using the official SDK
export const callGeminiAPI = async (prompt, context = '') => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY.')
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const isOverloaded = (err) => {
    const msg = String(err?.message || err)
    return msg.includes('503') || msg.toLowerCase().includes('overloaded') || msg.toLowerCase().includes('service unavailable')
  }
  const isRateLimited = (err) => {
    const msg = String(err?.message || err).toLowerCase()
    return msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')
  }

  // Minimize duplicate calls by using a single model for now
  const modelCandidates = [
    'gemini-1.5-flash'
  ]

  // Basic guardrails
  const generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 300,
  }
  const safetySettings = [
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
  ]

  // Build prompt (question is already inside the JSON context under "question")
  const fullPrompt = `You are an AI tutor analyzing a student's quiz performance data.

STUDENT DATA:
${context}

INSTRUCTIONS:
- Answer the user's specific question about their quiz performance
- If they ask about performance, analyze their actual scores and trends
- If they ask about weak areas, identify specific topics they struggled with
- If they ask for study advice, give personalized recommendations based on their data
- If they ask about specific topics, reference their performance in those areas
- Always base your response on the actual quiz data provided above
- Be specific and reference actual scores, dates, and question topics
- Do NOT give the same generic analysis for every question
- Tailor your response to what they're actually asking
- Keep responses concise and to the point (2-4 sentences for most questions)

Provide a personalized response that directly answers the question using the data above.`

  // Retry with exponential backoff + jitter and fallback models
  // Reduce retries to cut HTTP volume on 429
  const maxAttempts = 3
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const modelName of modelCandidates) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig,
          safetySettings
        })

        console.log('Gemini API: model.generateContent start')
        const result = await model.generateContent(fullPrompt)
        const response = await result.response
        const text = response.text()
        if (text && text.trim().length > 0) return text
        // If empty text, throw to trigger retry
        throw new Error('Empty response from model')
      } catch (err) {
        lastError = err
        // For non-overload/non-429 errors, surface config problems early
        if (!isOverloaded(err) && !isRateLimited(err)) {
          // If it looks like config/permission issue, surface immediately
          const msg = String(err?.message || err)
          if (msg.includes('API_KEY_INVALID')) {
            throw new Error('Invalid API key. Please check VITE_GEMINI_API_KEY.')
          }
          if (msg.includes('QUOTA_EXCEEDED')) {
            throw new Error('API quota exceeded. Please check your usage limits.')
          }
          if (msg.includes('PERMISSION_DENIED')) {
            throw new Error('Permission denied for project ' + GEMINI_PROJECT_NUMBER)
          }
        }
        // If overloaded or 429, try the next model in the same attempt
        continue
      }
    }
    // Backoff with jitter; longer wait for 429
    const base = 600 * Math.pow(2, attempt - 1)
    const multiplier = isRateLimited(lastError) ? 2 : 1
    const jitter = Math.floor(Math.random() * 300)
    await sleep((base * multiplier) + jitter)
  }

  // If we got here, all retries failed
  if (isOverloaded(lastError)) {
    throw new Error('The AI service is temporarily overloaded (503). Please try again in a moment.')
  }
  if (isRateLimited(lastError)) {
    throw new Error('You have hit the rate limit (429). Please wait a bit and try again.')
  }
  throw lastError || new Error('Failed to get a response from the AI service.')
}

// Test function to verify API connection
export const testGeminiConnection = async () => {
  try {
    console.log('Testing Gemini API connection...')
    console.log('Project Number:', GEMINI_PROJECT_NUMBER)
    console.log('API Key:', GEMINI_API_KEY.substring(0, 10) + '...')
    
    const testResponse = await callGeminiAPI(
      "Hello, can you respond with 'API connection successful'?",
      "This is a test connection to verify the Gemini API is working properly."
    )
    
    console.log('✅ Gemini API connection successful!')
    console.log('Response:', testResponse)
    return { success: true, response: testResponse }
  } catch (error) {
    console.error('❌ Gemini API connection failed:', error)
    return { success: false, error: error.message }
  }
}
