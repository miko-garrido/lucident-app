import {Button} from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import {cn} from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism'
import {Components} from 'react-markdown'
import { Zap, Check } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
  }
  isLoading?: boolean
}

const components: Components = {
  // Style code blocks
  code({className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '')
    return match ? (
      <div className="relative my-4 rounded-lg overflow-hidden">
        <SyntaxHighlighter
          language={match[1]}
          PreTag="div"
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'hsl(var(--muted))',
            borderRadius: '0.5rem'
          }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
  // Style lists
  ul: ({children}) => (
    <ul className="list-disc pl-6 space-y-2 my-4 text-muted-foreground">{children}</ul>
  ),
  ol: ({children}) => (
    <ol className="list-decimal pl-6 space-y-2 my-4 text-muted-foreground">{children}</ol>
  ),
  // Style list items
  li: ({children}) => (
    <li className="leading-7">{children}</li>
  ),
  // Style blockquotes
  blockquote: ({children}) => (
    <blockquote className="border-l-4 border-muted-foreground pl-4 my-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  // Style paragraphs
  p: ({children}) => (
    <p className="my-3 leading-7 text-muted-foreground">{children}</p>
  ),
  // Style headings
  h1: ({children}) => (
    <h1 className="text-2xl font-bold my-4 text-foreground">{children}</h1>
  ),
  h2: ({children}) => (
    <h2 className="text-xl font-bold my-3 text-foreground">{children}</h2>
  ),
  h3: ({children}) => (
    <h3 className="text-lg font-bold my-2 text-foreground">{children}</h3>
  ),
  // Style links
  a: ({href, children}) => (
    <a
      href={href}
      className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  // Style horizontal rule
  hr: () => (
    <hr className="my-6 border-muted-foreground/20"/>
  ),
  // Style tables
  table: ({children}) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({children}) => (
    <th className="border border-muted-foreground/20 px-4 py-2 text-left font-medium bg-muted">
      {children}
    </th>
  ),
  td: ({children}) => (
    <td className="border border-muted-foreground/20 px-4 py-2">
      {children}
    </td>
  )
}

export function ChatMessage({message, isLoading = false}: ChatMessageProps) {
  const isUser = message.role === "user"
  const parsedMessage = JSON.parse(message.content);
  const isText = parsedMessage?.[0]?.text !== undefined;
  const isFunctionCall = parsedMessage?.[0]?.functionCall !== undefined;
  const isFunctionResponse = parsedMessage?.[0]?.functionResponse !== undefined;
  const textMessage = isText ? parsedMessage[0].text : "";

  const handleFunctionCall = async () => {
    try {
      await apiClient.debugTrace(message.id);
    } catch (error) {
      console.error("Error loading sessions:", error)
    }
  }

  // ToDo: remove this once we have UX ready for this
  if (isFunctionCall || isFunctionResponse) return <></>;

  if (isFunctionCall) {
    return (
      <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
        <Button
          variant="outline"
          className="h-auto justify-start p-4 text-left"
          onClick={() => handleFunctionCall()}
        >
          <Zap className="h-5 w-5" />
          <div className="font-medium">{parsedMessage[0].functionCall.name}</div>
        </Button>
      </div>
    )
  }

  if (isFunctionResponse) {

    if (Object.keys(parsedMessage?.[0]?.functionResponse?.response ?? {}).length) {
      return <></>;
    }

    return (
      <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
        <Button
          variant="outline"
          className="h-auto justify-start p-4 text-left"
          onClick={() => handleFunctionCall()}
        >
          <Check className="h-5 w-5" />
          <div className="font-medium">{parsedMessage[0].functionResponse.name}</div>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          isUser
            ? "max-w-[60%] w-fit bg-secondary text-secondary-foreground rounded-2xl px-4 py-3"
            : "max-w-[80%] text-foreground",
          isLoading && "animate-pulse"
        )}
      >
        <div className="prose dark:prose-invert max-w-none prose-pre:bg-transparent prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={components}
          >
            {textMessage}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
