import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
  }
  isLoading?: boolean
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  return (
    <div className="flex flex-col space-y-1.5">
      {message.role === "user" ? (
        <div className="font-semibold">You</div>
      ) : (
        <div className="font-semibold">Assistant</div>
      )}
      <div
        className={cn(
          "prose dark:prose-invert max-w-none",
          isLoading && "animate-pulse",
          message.role === "assistant" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
