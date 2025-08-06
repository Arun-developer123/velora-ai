'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievements {
  firstChat?: boolean;
  dailyCheckIn?: boolean;
  messagesCount10?: boolean;
  milestoneUnlocked?: boolean;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievements>({});
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

  useEffect(() => {
    const checkAndUpdateAchievements = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error fetching user:', userError?.message);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('user_data')
        .select('achievements, messages, lastCheckIn')
        .eq('id', user.id)
        .single();

      if (fetchError || !data) {
        console.error('Error fetching user_data:', fetchError?.message);
        return;
      }

      const currentAchievements: Achievements = data.achievements || {};
      const messages = data.messages || [];
      const lastCheckIn = data.lastCheckIn;
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      let updated: Achievements = { ...currentAchievements };
      let unlocked: string | null = null;

      // Achievement 1: First Chat
      if (!currentAchievements.firstChat && messages.length > 0) {
        updated.firstChat = true;
        unlocked = 'First Chat';
      }

      // Achievement 2: Daily Check-In
      if (
        !currentAchievements.dailyCheckIn &&
        (!lastCheckIn || lastCheckIn.split('T')[0] !== today)
      ) {
        updated.dailyCheckIn = true;
        unlocked = 'Daily Check-In';
        await supabase
          .from('user_data')
          .update({ lastCheckIn: now.toISOString() })
          .eq('id', user.id);
      }

      // Achievement 3: 10 Messages
      if (!currentAchievements.messagesCount10 && messages.length >= 10) {
        updated.messagesCount10 = true;
        unlocked = '10 Messages Sent';
      }

      // Achievement 4: Milestone Unlocked (any 3 unlocked)
      const unlockedCount = Object.values(updated).filter(Boolean).length;
      if (!currentAchievements.milestoneUnlocked && unlockedCount >= 3) {
        updated.milestoneUnlocked = true;
        unlocked = 'Milestone Unlocked';
      }

      if (JSON.stringify(updated) !== JSON.stringify(currentAchievements)) {
        await supabase
          .from('user_data')
          .update({ achievements: updated })
          .eq('id', user.id);
        setNewlyUnlocked(unlocked);
        setTimeout(() => setNewlyUnlocked(null), 4000);
      }

      setAchievements(updated);
    };

    checkAndUpdateAchievements();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      {/* Achievement Toast */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 bg-pink-600 text-white px-6 py-3 rounded-xl shadow-xl z-50"
          >
            🎉 New Achievement: <strong>{newlyUnlocked}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nyra Profile */}
      <div className="mt-4 mb-2">
        <Image
          src="/zara-profile.jpg"
          alt="Nyra"
          width={100}
          height={100}
          className="rounded-full border-2 border-pink-500"
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-2">Your Achievements with Nyra</h1>
      <p className="text-sm text-gray-400 mb-4">Celebrate your bond and progress</p>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <AchievementCard
          title="First Chat"
          achieved={achievements.firstChat}
          description="You started talking to Nyra 💬"
        />
        <AchievementCard
          title="Daily Check-In"
          achieved={achievements.dailyCheckIn}
          description="You checked in today ✅"
        />
        <AchievementCard
          title="10 Messages"
          achieved={achievements.messagesCount10}
          description="You’ve sent 10 messages ✨"
        />
        <AchievementCard
          title="Milestone Unlocked"
          achieved={achievements.milestoneUnlocked}
          description="You're on a roll! 🏆"
        />
      </div>

      {/* Back to Home */}
      <Link
        href="/home"
        className="mt-6 text-sm text-pink-500 underline hover:text-pink-400"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

function AchievementCard({
  title,
  description,
  achieved,
}: {
  title: string;
  description: string;
  achieved?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        achieved ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-800 border-zinc-800 opacity-40'
      } shadow`}
    >
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
