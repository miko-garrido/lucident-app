import { apiClient } from "@/lib/api-client"
import { NextResponse } from 'next/server';
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId") || '';



    // Check if we have messages to process
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1]


    // Send the message to the API and stream the response
    const stream = await apiClient.sendMessage(lastMessage.content, sessionId)
    // Return the stream as a response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[CHAT ERROR]", error)
    return new Response(`Error processing your request: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500,
    })
  }
}
