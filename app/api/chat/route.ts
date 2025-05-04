export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Check if we have messages to process
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("No messages provided", { status: 400 })
    }

    // Mock response for now - will be replaced with actual API call
    return new Response(
      new ReadableStream({
        async start(controller) {
          // Send a simple response
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                text: "This is a placeholder response. The actual API integration will be implemented soon.",
              })}\n\n`,
            ),
          )

          // End the stream
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"))
          controller.close()
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    )
  } catch (error) {
    console.error("[CHAT ERROR]", error)
    return new Response(`Error processing your request: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500,
    })
  }
}
