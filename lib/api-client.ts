// API client for interacting with the Lucident Agent API

// Constants
const APP_NAME = "lucident_agent"
const USER_ID = "user"

// Types
export interface Message {
  role: "user" | "assistant" | "system"
  content: string
  id?: string
}

export interface Session {
  id: string
  app_name: string
  user_id: string
  state: Record<string, any>
  events: Event[]
  last_update_time: number
}

export interface Event {
  content: {
    parts: Array<{
      text?: string;
      functionCall?: {
        id: string;
        args: Record<string, any>;
        name: string;
      };
      functionResponse?: {
        id: string;
        name: string;
        response: Record<string, any>;
      };
    }>;
    role: "user" | "model" | "clickup_agent" | "lucident_agent";
  };
  invocation_id: string;
  author: string;
  actions: {
    state_delta: Record<string, any>;
    artifact_delta: Record<string, any>;
    requested_auth_configs?: Record<string, any>;
    transfer_to_agent?: string;
  };
  id: string;
  timestamp: number;
  partial?: boolean;
  long_running_tool_ids?: string[];
}

export interface AgentRunRequest {
  app_name: string
  user_id: string
  session_id: string
  new_message: {
    role: string
    content: {
      parts: {
        text: string
      }[]
    }
  }
  streaming: boolean
}

// API Client
class ApiClient {
  private baseUrl: string
  private sessionId: string | null = null

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  // Helper method to handle API responses
  private async handleResponse<T>(response: Response, errorMessage: string): Promise<T> {
    if (!response.ok) {
      // Try to get error details from the response
      let errorDetails = ""
      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorJson = await response.json()
          errorDetails = JSON.stringify(errorJson)
        } else {
          errorDetails = await response.text()
          // Truncate long error messages
          if (errorDetails.length > 100) {
            errorDetails = errorDetails.substring(0, 100) + "..."
          }
        }
      } catch (e) {
        errorDetails = `Could not parse error response: ${e}`
      }

      throw new Error(`${errorMessage}: ${response.status} ${response.statusText}. Details: ${errorDetails}`)
    }

    // Check if the response is JSON
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T
    }

    // If not JSON, return the response itself
    return response as unknown as T
  }

  async debugTrace(traceId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/debug/trace/${traceId}`, {
        headers: {
          Accept: "application/json",
        },
      })

      return this.handleResponse<any>(response, "Failed to fetch debug trace")
    } catch (error) {
      console.error("Error fetching debug trace:", error)
      return null
    }
  }

  // Session management
  async createSession(): Promise<Session> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${APP_NAME}/users/${USER_ID}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      return this.handleResponse<Session>(response, "Failed to create session")
    } catch (error) {
      console.error("Error creating session:", error)
      // Create a mock session as fallback
      const mockSessionId = `mock-${Date.now()}`
      this.sessionId = mockSessionId
      return {
        id: mockSessionId,
        app_name: APP_NAME,
        user_id: USER_ID,
        state: {},
        events: [],
        last_update_time: Date.now(),
      }
    }
  }

  async getSession(sessionId: string): Promise<Session> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`)
      return this.handleResponse<Session>(response, "Failed to get session")
    } catch (error) {
      console.error("Error getting session:", error)
      // Return a mock session as fallback
      return {
        id: sessionId,
        app_name: APP_NAME,
        user_id: USER_ID,
        state: {},
        events: [],
        last_update_time: Date.now(),
      }
    }
  }

  async listSessions(): Promise<Session[]> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${APP_NAME}/users/${USER_ID}/sessions`)

      // Log the response for debugging
      if (!response.ok) {
        const text = await response.text()
        console.error("Failed to list sessions. Response:", text)
        return []
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON. Content-Type:", contentType)
        return []
      }

      return await response.json()
    } catch (error) {
      console.error("Error listing sessions:", error)
      return []
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`, {
        method: "DELETE",
      })

      await this.handleResponse<void>(response, "Failed to delete session")
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  // Chat functionality
  async sendMessage(message: string, sessionId?: string): Promise<ReadableStream> {
    const targetSessionId = sessionId || this.sessionId

    // If no session ID is available, create a new session
    if (!targetSessionId) {
      const session = await this.createSession()
      this.sessionId = session.id
    }

    const payload = {
      app_name: APP_NAME,
      user_id: USER_ID,
      session_id: this.sessionId!,
      new_message: {
        role: "user",
        parts: [
          {
            text: message
          }
        ]
      },
      streaming: true,
    }

    try {
      const response = await fetch(`${this.baseUrl}/run_sse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to send message: ${response.status}. Details: ${errorText}`)
      }

      const textDecoder = new TextDecoder()
      const textEncoder = new TextEncoder()
      const reader = response.body!.getReader()
      const sseStream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            try {
              const chunk = textDecoder.decode(value, { stream: true })
              const parsed = JSON.parse(chunk?.split('data: ')?.[1] || '{}')
              if (parsed.content?.parts?.[0]?.text) {
                controller.enqueue(textEncoder.encode(`${parsed.content?.parts?.[0]?.text}`))
              }
            } catch (err) {

            }
          }
          controller.close()
        },
      })

      return sseStream
    } catch (error) {
      console.error("Error sending message:", error)

      // Create a mock response stream as fallback
      const encoder = new TextEncoder()
      return new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode("Sorry, I couldn't connect to the server. Please try again later."),
          )
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        },
      })
    }
  }

  // Utility methods
  setSessionId(sessionId: string) {
    this.sessionId = sessionId
  }

  getSessionId(): string | null {
    return this.sessionId
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL || "/api")

export default apiClient
