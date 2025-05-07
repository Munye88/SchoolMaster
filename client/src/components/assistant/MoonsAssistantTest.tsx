import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { useMoonsAssistant } from '@/hooks/use-moons-assistant';
import { Loader2, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export function MoonsAssistantTest() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'error'>('checking');
  const { messages, isTyping, sendMessage, isLoading } = useMoonsAssistant();

  // Check API status when component mounts
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiStatus('checking');
        const response = await fetch('/api/moons-assistant/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'test' }),
        });

        if (response.ok) {
          setApiStatus('available');
          setError(null);
        } else {
          console.error('API status check failed:', response.status, response.statusText);
          const text = await response.text();
          console.error('Response body:', text);
          setApiStatus('error');
          setError(`API status check failed: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error('API check error:', err);
        setApiStatus('error');
        setError(`API not available: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    checkApiStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setError(null);
    console.log('Submitting message to Moon\'s Assistant:', input);
    
    try {
      await sendMessage(input);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Moon's Assistant Test</CardTitle>
        <CardDescription>
          API Status: {
            apiStatus === 'checking' ? 'Checking connection...' :
            apiStatus === 'available' ? 'Connected and ready' :
            'Error connecting to API'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {apiStatus === 'checking' && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking API connection...</span>
          </div>
        )}
        
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
      <CardFooter className="flex-col gap-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading || apiStatus === 'checking' || apiStatus === 'error'}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim() || apiStatus === 'checking' || apiStatus === 'error'}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        
        {apiStatus === 'error' && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setApiStatus('checking');
              // Run API check again
              fetch('/api/moons-assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'test' }),
              })
              .then(response => {
                if (response.ok) {
                  setApiStatus('available');
                  setError(null);
                } else {
                  console.error('API retry failed:', response.status);
                  setApiStatus('error');
                }
              })
              .catch(err => {
                console.error('API retry error:', err);
                setApiStatus('error');
              });
            }}
          >
            Retry API Connection
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}