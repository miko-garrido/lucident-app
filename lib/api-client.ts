type ApiClientConfig = {
  baseUrl: string
  userId?: string
  apiKey?: string
}

class ApiClient {
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
      userId: config.userId,
      apiKey: config.apiKey,
    }
  }

  setUserId(userId: string) {
    this.config.userId = userId
  }

  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey
  }

  async chat(messages: any[]) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.config.userId) {
      headers["X-User-ID"] = this.config.userId
    }

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`
    }

    const response = await fetch(`${this.config.baseUrl}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response
  }
}

// Create a singleton instance
export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
})

export default apiClient
