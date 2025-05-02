// Import and export Google ADK functionality
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI with your API key
export function initializeGoogleAI(apiKey: string) {
  return new GoogleGenerativeAI(apiKey)
}

// Function to generate content using Google's Gemini model
export async function generateWithGemini(apiKey: string, prompt: string) {
  const genAI = initializeGoogleAI(apiKey)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}
