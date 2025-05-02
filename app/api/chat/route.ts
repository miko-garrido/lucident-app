import { generateWithGemini } from "@/lib/google-adk"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Check if we have messages to process
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }

    // Get the API key from environment variables
    const apiKey = process.env.GOOGLE_API_KEY

    if (!apiKey) {
      return new Response("Google API key not configured", { status: 500 })
    }

    // Format messages for Google's API
    const lastMessage = messages[messages.length - 1]
    const prompt = lastMessage.content

    // Generate response using Google's Gemini model
    const responseText = await generateWithGemini(apiKey, prompt)

    // Return the response
    return new Response(
      JSON.stringify({
        text: responseText,
        id: Date.now().toString(),
        role: "assistant",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("[CHAT ERROR]", error)
    return new Response("Error processing your request", { status: 500 })
  }
}
