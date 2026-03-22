import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useChat, useConversations } from '../hooks/useAI';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  fileId?: string;
}

export function AIChat({ fileId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = useChat();
  const { data: conversations } = useConversations();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || chat.isPending) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const result = await chat.mutateAsync({
        message: userMessage,
        conversationId: activeConversationId,
        fileId,
      });

      setActiveConversationId(result.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.response },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, something went wrong: ${err.message}`,
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex h-[500px] flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          AI Assistant
        </CardTitle>
        {conversations && conversations.length > 0 && (
          <select
            className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs"
            value={activeConversationId || ''}
            onChange={(e) => setActiveConversationId(e.target.value || undefined)}
          >
            <option value="">New conversation</option>
            {conversations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title.slice(0, 40)}
              </option>
            ))}
          </select>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="mb-3 h-10 w-10 text-[hsl(var(--muted-foreground))]/40" />
              <p className="text-sm font-medium">Ask me anything about your data</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                I can analyze trends, find anomalies, answer questions, and suggest charts
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
                      <Bot className="h-4 w-4 text-[hsl(var(--primary-foreground))]" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                      <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    </div>
                  )}
                </div>
              ))}
              {chat.isPending && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
                    <Bot className="h-4 w-4 text-[hsl(var(--primary-foreground))]" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--muted))] px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[hsl(var(--border))] p-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your data..."
              disabled={chat.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chat.isPending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
