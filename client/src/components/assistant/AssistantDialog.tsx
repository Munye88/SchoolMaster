import { useState, useRef, useEffect } from 'react';
import { useAssistant, AssistantMessage } from '@/hooks/use-assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, X } from 'lucide-react';
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

export function AssistantDialog() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage, clearMessages, isLoading } = useAssistant();
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
        <Button variant="default" className="fixed bottom-20 right-6 rounded-full shadow-lg h-14 flex items-center gap-2 px-4 bg-blue-600 hover:bg-blue-700 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <span>AI Assistant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl lg:max-w-2xl h-[80vh] p-0 gap-0">
        <DialogHeader className="px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                <path d="M12 9h.01"></path>
                <path d="M12 12v4"></path>
              </svg>
              Personal Assistant
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
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground p-8">
                  <p className="text-lg font-medium">How can I help you today?</p>
                  <p className="text-sm mt-2">
                    You can ask me about instructors, courses, test scores, or use me to update attendance, 
                    schedule meetings, and more.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))
              )}
              {isTyping && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted w-fit">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Message({ message }: { message: AssistantMessage }) {
  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg',
        message.role === 'assistant' ? 'bg-muted' : 'bg-primary/5',
        message.role === 'user' ? 'ml-auto' : 'mr-auto'
      )}
    >
      {message.role === 'assistant' && (
        <Avatar className="h-8 w-8 rounded-md">
          <div className="flex h-full w-full items-center justify-center bg-primary text-white">
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
              <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
              <path d="M12 9h.01"></path>
              <path d="M12 12v4"></path>
            </svg>
          </div>
        </Avatar>
      )}

      <div className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-3 py-2 rounded-lg max-w-[80%]',
            message.role === 'assistant' ? 'bg-background' : 'bg-primary text-primary-foreground'
          )}
        >
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {format(message.timestamp, 'HH:mm')}
        </span>
      </div>

      {message.role === 'user' && (
        <Avatar className="h-8 w-8 rounded-md">
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