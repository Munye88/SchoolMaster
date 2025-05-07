import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useMoonsAssistant } from '@/hooks/use-moons-assistant';
import { Loader2, Send } from 'lucide-react';

export function MoonsAssistantTest() {
  const [input, setInput] = useState('');
  const { messages, isTyping, sendMessage, isLoading } = useMoonsAssistant();

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
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Moon's Assistant Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-12' 
                  : 'bg-muted mr-12'
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted w-fit">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}