import { useState, useRef, useEffect } from 'react';
import { useMoonsAssistant, MoonsAssistantMessage } from '@/hooks/use-moons-assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, X, Moon, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function MoonsAssistantDialog() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage, clearMessages, isLoading } = useMoonsAssistant();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      await sendMessage(input);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="fixed bottom-20 right-6 rounded-full shadow-lg h-14 flex items-center gap-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Moon className="h-5 w-5" />
          <span>Moon's Assistant</span>
          <Sparkles className="h-4 w-4 ml-1 text-yellow-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl lg:max-w-2xl h-[80vh] p-0 gap-0">
        <DialogHeader className="px-4 py-2 border-b bg-indigo-50 dark:bg-indigo-950/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
              <Moon className="h-5 w-5" />
              Moon's Assistant
              <Badge variant="outline" className="ml-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                GPT-4o Powered
              </Badge>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="h-8 px-2 text-muted-foreground"
                title="Clear conversation"
              >
                Clear
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 130px)' }}>
            <div className="space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                  <p className="text-lg font-medium mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to Moon's Assistant
                  </p>
                  <Badge variant="outline" className="mb-4 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                    <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                    Voice-Enabled AI Assistant
                  </Badge>
                  <p className="text-sm mt-2">
                    I'm your enhanced AI assistant powered by OpenAI's GPT-4o model. I can answer questions about instructors, 
                    courses, test scores, attendance, and more with improved context understanding.
                  </p>
                  <p className="text-sm mt-4 font-medium">Try asking:</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      className="text-xs border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      onClick={() => sendMessage("Tell me about instructor evaluation procedures")}
                    >
                      Tell me about instructor evaluation procedures
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-xs border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      onClick={() => sendMessage("What's the passing score for ECL tests?")}
                    >
                      What's the passing score for ECL tests?
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-xs border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      onClick={() => sendMessage("How many instructors are there in KFNA?")}
                    >
                      How many instructors are there in KFNA?
                    </Button>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))
              )}
              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 w-fit">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">Moon's Assistant is thinking...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
          
          {/* Scroll to bottom button */}
          {messages.length > 3 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute bottom-[80px] right-4 rounded-full p-2 bg-background shadow-md"
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Button>
          )}

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Moon's Assistant anything..."
                className="flex-1 border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Message({ message }: { message: MoonsAssistantMessage }) {
  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg w-full',
        message.role === 'assistant' ? 'bg-indigo-50 dark:bg-indigo-950/30' : 'bg-primary/5'
      )}
    >
      {message.role === 'assistant' && (
        <Avatar className="h-8 w-8 rounded-md flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center bg-indigo-600 dark:bg-indigo-700 text-white">
            <Moon className="h-5 w-5" />
          </div>
        </Avatar>
      )}

      <div className={cn(
        'flex flex-col flex-grow', 
        message.role === 'user' ? 'items-end' : 'items-start'
      )}>
        <div
          className={cn(
            'px-4 py-3 rounded-lg',
            message.role === 'assistant' 
              ? 'bg-background w-full' 
              : 'bg-primary text-primary-foreground max-w-[90%]'
          )}
        >
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>

      {message.role === 'user' && (
        <Avatar className="h-8 w-8 rounded-md flex-shrink-0">
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </Avatar>
      )}
    </div>
  );
}