'use client';

import { useEffect } from 'react';
import supabase from '@/lib/supabase';

export function AppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          const now = new Date().toISOString();

          // ✅ Only insert if user_data doesn't exist
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

          // ✅ Start interval to update lastCheckIn every 2 seconds
          intervalId = setInterval(async () => {
            const current = new Date().toISOString();
            await supabase
              .from('user_data')
              .update({ lastCheckIn: current })
              .eq('id', user.id);
          }, 2000);
        }
      }
    );

    return () => {
      // Clean up on unmount
      if (intervalId) clearInterval(intervalId);
      listener.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
