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
  state: {
    session_name?: string
    [key: string]: any
  }
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

  constructor(baseUrl = "https://api.lucident.ai/") {
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

    // If not JSON, return a default object for the expected type
    console.warn("Response is not JSON. Content-Type:", contentType)
    return {} as T
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
  async createSession(sessionName = "New session"): Promise<Session> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${APP_NAME}/users/${USER_ID}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          session_name: sessionName,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Create session response is not JSON. Content-Type:", contentType)
        // Return a mock session as fallback
        const mockSessionId = `mock-${Date.now()}`
        this.sessionId = mockSessionId
        return {
          id: mockSessionId,
          app_name: APP_NAME,
          user_id: USER_ID,
          state: {
            session_name: sessionName,
          },
          events: [],
          last_update_time: Date.now(),
        }
      }

      const session = await response.json()
      this.sessionId = session.id
      return session
    } catch (error) {
      console.error("Error creating session:", error)
      // Create a mock session as fallback
      const mockSessionId = `mock-${Date.now()}`
      this.sessionId = mockSessionId
      return {
        id: mockSessionId,
        app_name: APP_NAME,
        user_id: USER_ID,
        state: {
          session_name: sessionName,
        },
        events: [],
        last_update_time: Date.now(),
      }
    }
  }

  async getSession(sessionId: string): Promise<Session | null> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`, {
        headers: {
          Accept: "application/json",
        },
      })

      // If session not found (404), return null instead of throwing
      if (response.status === 404) {
        console.warn(`Session not found: ${sessionId}`)
        return null
      }

      if (!response.ok) {
        throw new Error(`Failed to get session: ${response.status} ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Get session response is not JSON. Content-Type:", contentType)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  }

  async listSessions(): Promise<Session[]> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${APP_NAME}/users/${USER_ID}/sessions`, {
        headers: {
          Accept: "application/json",
        },
      })

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

      const sessions = await response.json()
      return Array.isArray(sessions) ? sessions : []
    } catch (error) {
      console.error("Error listing sessions:", error)
      return []
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${APP_NAME}/users/${USER_ID}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.status} ${response.statusText}`)
      }
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

    const payload: AgentRunRequest = {
      app_name: APP_NAME,
      user_id: USER_ID,
      session_id: this.sessionId!,
      new_message: {
        role: "user",
        content: {
          parts: [
            {
              text: message,
            },
          ],
        },
      },
      streaming: true,
    }

    try {
      const response = await fetch(`${this.baseUrl}/run_sse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to send message: ${response.status}. Details: ${errorText}`)
      }

      return response.body!
    } catch (error) {
      console.error("Error sending message:", error)

      // Create a mock response stream as fallback
      const encoder = new TextEncoder()
      return new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: "Sorry, I couldn't connect to the server. Please try again later." })}\n\n`,
            ),
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
