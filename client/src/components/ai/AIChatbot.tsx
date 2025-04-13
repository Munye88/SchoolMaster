import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Send, X, Minimize2, Maximize2, 
  MessageSquare, Trash, Brain, Search, Database,
  BarChart, ArrowRight
} from "lucide-react";
import { useAIChat } from "@/hooks/use-ai-chat";
import { useSchool } from "@/hooks/useSchool";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AIChatbot() {
  const [minimized, setMinimized] = useState(true);  // Start with the chat window minimized
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { selectedSchool } = useSchool();
  const { messages, isTyping, sendMessage, clearChat } = useAIChat();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Focus input field when chat is opened
  useEffect(() => {
    if (!minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [minimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const toggleMinimize = () => {
    setMinimized(prev => !prev);
    if (isExpanded && !minimized) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  if (minimized) {
    return (
      <Button
        onClick={toggleMinimize}
        className="fixed bottom-4 right-4 rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg z-50 border-2 border-primary/50 bg-gradient-to-r from-primary to-primary/80"
      >
        <MessageSquare className="h-6 w-6 mb-1" />
        <span className="text-xs">AI Chat</span>
      </Button>
    );
  }

  return (
    <Card
      className={`fixed transition-all duration-300 shadow-lg ${
        isExpanded
          ? "inset-4 z-50"
          : "bottom-4 right-4 w-80 h-96 z-40"
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
              <p className="mb-2 font-bold text-lg bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Enhanced AI Assistant
              </p>
              <div className="flex gap-1 justify-center mb-3">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-xs flex items-center gap-1">
                  <BarChart className="w-3 h-3" />
                  <span>GPT-4o Analysis</span>
                </Badge>
                <Badge className="bg-purple-500 hover:bg-purple-600 text-xs flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span>GPT-4o</span>
                </Badge>
                <Badge className="bg-green-500 hover:bg-green-600 text-xs flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  <span>Perplexity</span>
                </Badge>
              </div>
              <p className="text-sm">
                Powered by multiple AI models, I can now answer complex questions about data, explain trends, 
                perform analyses, and provide deeper insights about the GOVCIO/SAMS ELT Program.
              </p>
              <p className="text-sm mt-2 font-medium">Try asking:</p>
              <div className="mt-3 flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => sendMessage("Analyze the instructor evaluation scores across all schools")}
                >
                  <BarChart className="w-3 h-3 mr-1" /> Analyze the instructor evaluation scores across all schools
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => sendMessage("Explain why NFS East has higher test results than other schools")}
                >
                  <Brain className="w-3 h-3 mr-1" /> Explain why NFS East has higher test results than other schools
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => sendMessage("What are current best practices for aviation English training?")}
                >
                  <Search className="w-3 h-3 mr-1" /> What are current best practices for aviation English training?
                </Button>
                <Button 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => sendMessage("How many instructors are there in each school?")}
                >
                  <Database className="w-3 h-3 mr-1" /> How many instructors are there in each school?
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
                    className={`max-w-[80%] rounded-lg p-3 relative ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {/* AI model badge for assistant messages */}
                    {message.role === "assistant" && message.content && (
                      <div className="absolute -top-3 -right-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {message.content.includes("OpenAI analysis") ? (
                                  <Badge className="bg-blue-500 hover:bg-blue-600 text-xs flex items-center gap-1">
                                    <BarChart className="w-3 h-3" />
                                    <span>GPT-4o Analysis</span>
                                  </Badge>
                                ) : message.content.includes("OpenAI") ? (
                                  <Badge className="bg-purple-500 hover:bg-purple-600 text-xs flex items-center gap-1">
                                    <Brain className="w-3 h-3" />
                                    <span>GPT-4o</span>
                                  </Badge>
                                ) : message.content.includes("Perplexity") ? (
                                  <Badge className="bg-green-500 hover:bg-green-600 text-xs flex items-center gap-1">
                                    <Search className="w-3 h-3" />
                                    <span>Perplexity</span>
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-500 hover:bg-gray-600 text-xs flex items-center gap-1">
                                    <Database className="w-3 h-3" />
                                    <span>Database</span>
                                  </Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {message.content.includes("OpenAI analysis")
                                ? "Advanced data analysis powered by OpenAI's GPT-4o model"
                                : message.content.includes("OpenAI")
                                ? "Response generated by OpenAI's GPT-4o model"
                                : message.content.includes("Perplexity")
                                ? "Response with web search from Perplexity API"
                                : "Response from local database information"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                    
                    {/* Message content */}
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