import { apiClient } from "@/lib/api-client"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Check if we have messages to process
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }

    // Get the last message from the user
    const lastMessage = messages[messages.length - 1]

    if (lastMessage.role !== "user") {
      return new Response("Last message must be from user", { status: 400 })
    }

    // Create a session if one doesn't exist
    let sessionId = apiClient.getSessionId()

    if (!sessionId) {
      console.log("No session ID found, creating a new session")
      try {
        const newSession = await apiClient.createSession()
        if (!newSession || !newSession.id) {
          throw new Error("Invalid session response")
        }
        sessionId = newSession.id
        apiClient.setSessionId(sessionId)
      } catch (error) {
        console.error("Failed to create session:", error)
        return new Response(JSON.stringify({ error: "Failed to create session" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      }
    } else {
      // Verify the session exists
      try {
        const session = await apiClient.getSession(sessionId)
        if (!session) {
          console.log("Session not found, creating a new one")
          const newSession = await apiClient.createSession()
          sessionId = newSession.id
          apiClient.setSessionId(sessionId)
        }
      } catch (error) {
        console.error("Error verifying session:", error)
        // Create a new session as fallback
        try {
          const newSession = await apiClient.createSession()
          sessionId = newSession.id
          apiClient.setSessionId(sessionId)
        } catch (e) {
          console.error("Failed to create fallback session:", e)
          return new Response(JSON.stringify({ error: "Failed to create session" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
        }
      }
    }

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
