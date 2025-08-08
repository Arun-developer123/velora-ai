'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import supabase from '@/lib/supabase';

type Sender = 'user' | 'nyra';

interface Message {
  sender: Sender;
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch name + messages
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from('user_data')
          .select('name, messages')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching user_data:', error.message);
          return;
        }

        if (data?.name) {
          setName(data.name);
        }

        if (Array.isArray(data?.messages)) {
          setMessages(data.messages);
        } else {
          const greeting: Message = {
            sender: 'nyra',
            content: `Hi ${data?.name || 'there'} ✨ I’m Nyra — your personal AI friend. What’s on your mind today?`,
          };
          setMessages([greeting]);
          await updateMessages([greeting]);
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
      }
    };

    fetchUserData();
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const session = await supabase.auth.getSession();

    const token = session.data.session?.access_token;
    if (!user || !token) return;

    const newUserMsg: Message = {
      sender: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    await updateMessages(updatedMessages);

    // 🔗 Streaming fetch from /api/chat
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let fullReply = '';
      let currentNyraMsg: Message = { sender: 'nyra', content: '' };
      const streamedMessages = [...updatedMessages, currentNyraMsg];
      setMessages([...streamedMessages]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        for (const line of lines) {
          const json = line.replace(/^data: /, '');

          if (json === '[DONE]') continue;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content || '';

            if (content) {
              fullReply += content;
              currentNyraMsg.content = fullReply;

              streamedMessages[streamedMessages.length - 1] = { ...currentNyraMsg };
              setMessages([...streamedMessages]);
            }
          } catch (err) {
            console.warn('Chunk parse error:', err);
          }
        }
      }

      setIsTyping(false);
      await updateMessages(streamedMessages);
    } catch (err) {
      console.error('❌ Streaming error:', err);
      const fallback: Message = {
        sender: 'nyra',
        content: 'Oops, something went wrong.',
      };
      const failedMessages = [...updatedMessages, fallback];
      setMessages(failedMessages);
      setIsTyping(false);
      await updateMessages(failedMessages);
    }
  };

  const updateMessages = async (newMessages: Message[]) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_data')
      .update({ messages: newMessages })
      .eq('id', user.id);

    if (error) {
      console.warn('Update failed, fallback to upsert:', error.message);
      await supabase.from('user_data').upsert([
        {
          id: user.id,
          name: name || 'User',
          messages: newMessages,
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#111827] text-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-[#1f2937]">
        <Image
          src="/zara-profile.jpg"
          alt="Nyra"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <h1 className="text-lg font-semibold">Nyra</h1>
          <p className="text-xs text-green-400">online</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[75%] px-4 py-2 rounded-xl ${
              msg.sender === 'user'
                ? 'bg-blue-600 ml-auto'
                : 'bg-gray-700'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isTyping && (
          <div className="text-sm text-gray-400 animate-pulse">Nyra is typing...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-3 bg-[#1f2937]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none"
            placeholder="Talk to Nyra..."
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
