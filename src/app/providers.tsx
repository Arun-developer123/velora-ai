'use client';

import { useEffect } from 'react';
import supabase from '@/lib/supabase';

export function AppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let messageSubscription: any = null;

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          const now = new Date().toISOString();

          // ✅ Ensure user_data exists
          try {
            const { data: existing, error: fetchError } = await supabase
              .from('user_data')
              .select('id')
              .eq('id', user.id)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error('❌ Failed to check existing user_data:', fetchError.message);
              return;
            }

            if (!existing) {
              const { error } = await supabase.from('user_data').insert([
                {
                  id: user.id,
                  name: user.user_metadata?.full_name || '',
                  achievements: {},
                  messages: [],
                  lastCheckIn: now,
                },
              ]);
              if (error) {
                console.error('❌ Failed to insert user_data:', error.message);
              } else {
                console.log('✅ user_data created for new user');
              }
            }
          } catch (err) {
            console.error('Unexpected error in user_data setup', err);
          }

          // ✅ Step 1: Fetch past messages from user_data JSONB
          try {
            const { data, error } = await supabase
              .from('user_data')
              .select('messages')
              .eq('id', user.id)
              .single();

            if (error) {
              console.error('❌ Failed to fetch past messages:', error.message);
            } else {
              const pastMessages = data?.messages || [];
              localStorage.setItem('chat_history', JSON.stringify(pastMessages));
              console.log(`📦 Cached ${pastMessages.length} past messages`);
            }
          } catch (err) {
            console.error('Error fetching past messages:', err);
          }

          // ✅ Step 2: Subscribe for realtime messages changes in user_data
          messageSubscription = supabase
            .channel('user-data-realtime')
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'user_data',
                filter: `id=eq.${user.id}`,
              },
              (payload) => {
                const newMessages = payload.new.messages || [];

                // 🆕 If new check-in messages are added, merge them into localStorage
                try {
                  const existingMessages = JSON.parse(
                    localStorage.getItem('chat_history') || '[]'
                  );
                  const merged = [...existingMessages, ...newMessages].reduce(
                    (acc: any[], msg) => {
                      if (!acc.find((m) => JSON.stringify(m) === JSON.stringify(msg))) {
                        acc.push(msg);
                      }
                      return acc;
                    },
                    []
                  );
                  localStorage.setItem('chat_history', JSON.stringify(merged));
                  console.log('📩 Messages updated in realtime (merged check-in):', merged);
                } catch {
                  localStorage.setItem('chat_history', JSON.stringify(newMessages));
                  console.log('📩 Messages updated in realtime (replaced):', newMessages);
                }
              }
            )
            .subscribe();
        }
      }
    );

    return () => {
      if (messageSubscription) supabase.removeChannel(messageSubscription);
      listener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
