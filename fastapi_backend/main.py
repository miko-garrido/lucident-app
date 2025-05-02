from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import openai
import os
import json
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="AI Chat API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str
    id: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

async def generate_stream_response(messages, temperature, max_tokens):
    try:
        # Convert messages to the format expected by OpenAI
        openai_messages = [{"role": msg.role, "content": msg.content} for msg in messages]
        
        # Create a streaming response
        response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=openai_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True
        )
        
        # Stream the response
        async for chunk in response:
            if chunk.choices and len(chunk.choices) > 0:
                content = chunk.choices[0].delta.get("content", "")
                if content:
                    yield f"data: {json.dumps({'text': content})}\n\n"
        
        yield "data: [DONE]\n\n"
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        return StreamingResponse(
            generate_stream_response(
                request.messages, 
                request.temperature, 
                request.max_tokens
            ),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
