import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Minimize2, Maximize2, Trash } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/use-ai-chat";
import { useSchool } from "@/hooks/useSchool";

export function AIChatbot() {
  const { messages, isTyping, sendMessage, clearChat } = useAIChat();
  const { selectedSchool } = useSchool();
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (isMinimized) {
    return (
      <Button
        className="fixed bottom-4 right-4 flex gap-2 items-center shadow-lg"
        onClick={toggleMinimize}
      >
        <span>AI Assistant</span>
        <Maximize2 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card 
      className={`fixed bottom-4 right-4 shadow-lg z-50 transition-all duration-300 ${
        isExpanded 
          ? "w-full md:w-3/4 h-[80vh] bottom-0 right-0" 
          : "w-full sm:w-96 h-[500px]"
      }`}
    >
      <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          {selectedSchool && (
            <Badge variant="outline" className="ml-2">
              {typeof selectedSchool === 'string' ? selectedSchool : selectedSchool.name}
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={clearChat} title="Clear chat">
            <Trash className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleExpand} title={isExpanded ? "Minimize" : "Expand"}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleMinimize} title="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden" style={{ height: "calc(100% - 135px)" }}>
        <ScrollArea ref={scrollAreaRef} className="h-full p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-2">Welcome to the AI Assistant!</p>
              <p className="text-sm">
                Ask me about test scores, evaluations, or other data from the system.
                For example:
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => sendMessage("What is the book test average for the month of March?")}
                >
                  What is the book test average for the month of March?
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => sendMessage("Summarize the instructor evaluation scores")}
                >
                  Summarize the instructor evaluation scores
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => sendMessage("Which school has the highest ALCPT scores?")}
                >
                  Which school has the highest ALCPT scores?
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content.split("\n").map((text, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about test scores, evaluations, or other data..."
            className="flex-1"
            disabled={isTyping}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}