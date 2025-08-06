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

  // Fetch name and existing messages
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
          console.error('Error fetching user data:', error.message);
          return;
        }

        if (data?.name) {
          setName(data.name);
        }

        if (data?.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          const greeting: Message = {
            sender: 'nyra',
            content: `Hi ${data?.name || 'there'} ✨ I’m Nyra — your personal AI friend. What’s on your mind today?`,
          };
          setMessages([greeting]);
          await updateMessagesOnServer([greeting], user.id, data?.name || '');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserData();
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message and update Supabase
  const handleSend = async () => {
    if (!input.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const userMessage: Message = {
      sender: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    await updateMessagesOnServer(updatedMessages, user.id, name || '');

    // Simulate Nyra's reply
    setTimeout(async () => {
      const nyraMessage: Message = {
        sender: 'nyra',
        content: `That's really interesting. Tell me more about it${name ? `, ${name}` : ''}.`,
      };

      const finalMessages = [...updatedMessages, nyraMessage];
      setMessages(finalMessages);
      setIsTyping(false);
      await updateMessagesOnServer(finalMessages, user.id, name || '');
    }, 1200);
  };

  // Save messages to Supabase, fallback to upsert if update fails
  const updateMessagesOnServer = async (
    newMessages: Message[],
    userId: string,
    userName: string
  ) => {
    const { error } = await supabase
      .from('user_data')
      .update({ messages: newMessages })
      .eq('id', userId);

    if (error) {
      console.warn('Update failed, trying upsert:', error.message);
      const { error: upsertError } = await supabase.from('user_data').upsert([
        {
          id: userId,
          name: userName,
          messages: newMessages,
        },
      ]);
      if (upsertError) {
        console.error('Upsert also failed:', upsertError.message);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#111827] text-white">
      {/* Nyra Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[75%] px-4 py-2 rounded-xl ${
              msg.sender === 'user'
                ? 'bg-blue-600 ml-auto text-white'
                : 'bg-gray-700 text-white'
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

      {/* Input box */}
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
