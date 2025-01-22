import React, { useEffect, useState } from 'react';
import { useConversation } from '@11labs/react';
import { ScrollArea } from "./components/ui/scroll-area";

interface Message {
  text: string;
  source: 'user' | 'ai';
  timestamp: Date;
  displayedText?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    console.log('scrollToBottom called');
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      console.log('scrollElement found:', !!scrollElement);
      if (scrollElement) {
        requestAnimationFrame(() => {
          console.log('scrolling to:', scrollElement.scrollHeight);
          scrollElement.scrollTop = scrollElement.scrollHeight;
        });
      }
    } else {
      console.log('scrollAreaRef.current is null');
    }
  };

  // Add useEffect for scrolling on new messages
  useEffect(() => {
    console.log('messages changed, scheduling scroll');
    scrollToBottom();
  }, [messages]);

  const conversation = useConversation({
    agentId: "6ZrcbhlArCTqfkViQNwj",
    onMessage: (message) => {
      console.log("message", message);
      // Add AI message to history
      setMessages(prev => [...prev, {
        text: message.message,
        source: message.source,
        timestamp: new Date()
      }]);
    },
    clientTools: {
      displayMessage: (parameters: { text: string }) => {
        // Add user message to history
        setMessages(prev => [...prev, {
          text: parameters.text,
          source: 'user',
          timestamp: new Date()
        }]);
        return "Message displayed";
      }
    }
  });

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
      console.log("user media stream", stream);
    });
  }, []);

  useEffect(() => {
    console.log("conversation status", conversation.status);
  }, [conversation.status]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.source === 'ai' && (!lastMessage.displayedText || lastMessage.displayedText.length < lastMessage.text.length)) {
      const timer = setTimeout(() => {
        setMessages(prev => prev.map((msg, idx) => {
          if (idx === prev.length - 1) {
            return {
              ...msg,
              displayedText: msg.text.slice(0, (msg.displayedText?.length || 0) + 1)
            };
          }
          return msg;
        }));
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto p-4">
        <div className="flex flex-col h-[calc(100vh-2rem)] w-full">
          <ScrollArea ref={scrollAreaRef} type="always" className="flex-1 mb-20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.source === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${message.source === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                    }`}
                >
                  <p className="whitespace-pre-wrap">
                    {message.source === 'ai' ? message.displayedText || '' : message.text}
                  </p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </ScrollArea>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
            <div className="container mx-auto p-4 flex gap-2">
              <span className="mr-auto py-2">
                {conversation.status.toString()}
              </span>
              <button
                disabled={conversation.status === 'connected' || conversation.status === 'connecting'}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => conversation.startSession()}
              >
                Start
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => conversation.endSession()}
              >
                End
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
