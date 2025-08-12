'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface AchievementItem {
  id: number;
  title: string;
  description: string;
  achieved: boolean;
  icon?: string;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const achievementMetadata: Record<number, { title: string; description: string; icon: string }> = {
  1: {
    title: 'First Message',
    description: 'Send your first message to Nyra.',
    icon: '📨',
  },
  2: {
    title: 'Getting Started',
    description: 'Send at least 10 messages.',
    icon: '🚀',
  },
  3: {
    title: 'Chat Enthusiast',
    description: 'Send at least 20 messages.',
    icon: '💬',
  },
  4: {
    title: 'Active Speaker',
    description: 'Send at least 30 messages.',
    icon: '🗣️',
  },
  5: {
    title: 'Conversationalist',
    description: 'Send at least 40 messages.',
    icon: '🗨️',
  },
  6: {
    title: 'Regular Messenger',
    description: 'Send at least 50 messages.',
    icon: '✉️',
  },
  7: {
    title: 'Chatterbox',
    description: 'Send at least 60 messages.',
    icon: '🗯️',
  },
  8: {
    title: 'Talkative',
    description: 'Send at least 70 messages.',
    icon: '📢',
  },
  9: {
    title: 'Daily Check-In',
    description: 'Check in with Nyra today.',
    icon: '📅',
  },
  10: {
    title: 'Weekly Visitor',
    description: 'Check in with Nyra 5 days in total.',
    icon: '🗓️',
  },
  11: {
    title: 'Committed User',
    description: 'Check in with Nyra 10 days in total.',
    icon: '🤝',
  },
  12: {
    title: 'Habit Builder',
    description: 'Check in with Nyra 20 days in total.',
    icon: '🏗️',
  },
  13: {
    title: 'Dedicated',
    description: 'Check in with Nyra 30 days in total.',
    icon: '🎯',
  },
  14: {
    title: 'Fuel Novice',
    description: 'Use 10 fuel points.',
    icon: '⛽',
  },
  15: {
    title: 'Fuel Apprentice',
    description: 'Use 20 fuel points.',
    icon: '🔥',
  },
  16: {
    title: 'Fuel Expert',
    description: 'Use 50 fuel points.',
    icon: '🚒',
  },
  17: {
    title: 'One Week Member',
    description: 'Be a registered user for 7 days.',
    icon: '🗓️',
  },
  18: {
    title: 'One Month Member',
    description: 'Be a registered user for 30 days.',
    icon: '📆',
  },
  19: {
    title: 'Two Months Member',
    description: 'Be a registered user for 60 days.',
    icon: '📅',
  },
  20: {
    title: 'Three Months Member',
    description: 'Be a registered user for 90 days.',
    icon: '📅',
  },
  21: {
    title: 'Half Year Member',
    description: 'Be a registered user for 180 days.',
    icon: '⏳',
  },
  22: {
    title: 'One Year Member',
    description: 'Be a registered user for 365 days.',
    icon: '🎉',
  },
  23: {
    title: 'Combo Starter',
    description: 'Send 150 messages and check in 10 days.',
    icon: '🥇',
  },
  24: {
    title: 'Combo Builder',
    description: 'Send 300 messages and check in 20 days.',
    icon: '🥈',
  },
  25: {
    title: 'Combo Master',
    description: 'Send 600 messages and check in 30 days.',
    icon: '🥉',
  },
  26: {
    title: 'Fuel Champion',
    description: 'Send 1000 messages and use 100 fuel points.',
    icon: '🏆',
  },
  27: {
    title: 'Three Day Streak',
    description: 'Be active for 3 days in a row.',
    icon: '🔥',
  },
  28: {
    title: 'One Week Streak',
    description: 'Be active for 7 days in a row.',
    icon: '💪',
  },
  29: {
    title: 'Two Week Streak',
    description: 'Be active for 14 days in a row.',
    icon: '🏅',
  },
  30: {
    title: 'One Month Streak',
    description: 'Be active for 30 days in a row.',
    icon: '🎖️',
  },
  31: {
    title: 'Two Month Streak',
    description: 'Be active for 60 days in a row.',
    icon: '🏵️',
  },
  32: {
    title: 'Three Month Streak',
    description: 'Be active for 90 days in a row.',
    icon: '🎗️',
  },
  33: {
    title: 'Half Year Streak',
    description: 'Be active for 180 days in a row.',
    icon: '🏆',
  },
  34: {
    title: 'One Year Streak',
    description: 'Be active for 365 days in a row.',
    icon: '🌟',
  },
  35: {
    title: 'Milestone 750',
    description: 'Send 750 messages.',
    icon: '💯',
  },
  36: {
    title: 'Milestone 1250',
    description: 'Send 1250 messages.',
    icon: '💯',
  },
  37: {
    title: 'Milestone 1750',
    description: 'Send 1750 messages.',
    icon: '💯',
  },
  38: {
    title: 'Milestone 2250',
    description: 'Send 2250 messages.',
    icon: '💯',
  },
  39: {
    title: 'Milestone 2750',
    description: 'Send 2750 messages.',
    icon: '💯',
  },
  40: {
    title: 'Milestone 3250',
    description: 'Send 3250 messages.',
    icon: '💯',
  },
  41: {
    title: 'Milestone 3750',
    description: 'Send 3750 messages.',
    icon: '💯',
  },
  42: {
    title: 'Long Term User 400d',
    description: 'Be a registered user for 400 days.',
    icon: '⏰',
  },
  43: {
    title: 'Long Term User 450d',
    description: 'Be a registered user for 450 days.',
    icon: '⏰',
  },
  44: {
    title: 'Long Term User 500d',
    description: 'Be a registered user for 500 days.',
    icon: '⏰',
  },
  45: {
    title: 'Long Term User 550d',
    description: 'Be a registered user for 550 days.',
    icon: '⏰',
  },
  46: {
    title: 'Long Term User 600d',
    description: 'Be a registered user for 600 days.',
    icon: '⏰',
  },
  47: {
    title: 'Extra Mile 1',
    description: 'Keep engaging and unlocking achievements!',
    icon: '💫',
  },
  48: {
    title: 'Extra Mile 2',
    description: 'Keep engaging and unlocking achievements!',
    icon: '✨',
  },
  49: {
    title: 'Extra Mile 3',
    description: 'Keep engaging and unlocking achievements!',
    icon: '🌠',
  },
  50: {
    title: 'Extra Mile 4',
    description: 'Keep engaging and unlocking achievements!',
    icon: '🌟',
  },
}
  // Generate 50 achievements dynamically using metadata
  const generateAchievementsList = (
    unlockedMap: Record<number, boolean>
  ): AchievementItem[] => {
    const list: AchievementItem[] = [];
    for (let i = 1; i <= 50; i++) {
      const meta = achievementMetadata[i];
      list.push({
        id: i,
        title: meta?.title || `Achievement #${i}`,
        description: meta?.description || `Complete task number ${i} to unlock this achievement.`,
        achieved: unlockedMap[i] || false,
        icon: meta?.icon || '🏆',
      });
    }
    return list;
  };

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
        .select('achievements, messages')
        .eq('id', user.id)
        .single();

      if (fetchError || !data) {
        console.error('Error fetching user_data:', fetchError?.message);
        return;
      }

      const userAchievementsObj: Record<string, boolean> = data.achievements || {};

      const unlockedMap: Record<number, boolean> = {};
      for (const key in userAchievementsObj) {
        unlockedMap[parseInt(key, 10)] = userAchievementsObj[key];
      }

      setAchievements(generateAchievementsList(unlockedMap));

      let updatedAchievements = { ...userAchievementsObj };
      let newlyUnlockedId: number | null = null;

      // Unlock logic example (expand as needed)
      if (!userAchievementsObj['1'] && data.messages?.length > 0) {
        updatedAchievements['1'] = true;
        newlyUnlockedId = 1;
      }
      if (!userAchievementsObj['2'] && data.messages?.length >= 10) {
        updatedAchievements['2'] = true;
        newlyUnlockedId = 2;
      }
      if (!userAchievementsObj['3'] && data.messages?.length >= 20) {
        updatedAchievements['3'] = true;
        newlyUnlockedId = 3;
      }
      if (!userAchievementsObj['4'] && data.messages?.length >= 30) {
        updatedAchievements['4'] = true;
        newlyUnlockedId = 4;
      }
      if (!userAchievementsObj['5'] && data.messages?.length >= 40) {
        updatedAchievements['5'] = true;
        newlyUnlockedId = 5;
      }
      if (!userAchievementsObj['6'] && data.messages?.length >= 50) {
        updatedAchievements['6'] = true;
        newlyUnlockedId = 6;
      }

      if (
        JSON.stringify(updatedAchievements) !== JSON.stringify(userAchievementsObj) &&
        newlyUnlockedId !== null
      ) {
        await supabase
          .from('user_data')
          .update({ achievements: updatedAchievements })
          .eq('id', user.id);

        setNewlyUnlocked(newlyUnlockedId);
        setShowConfetti(true);

        // Play unlock sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {}); // avoid unhandled promise
        }

        setTimeout(() => setShowConfetti(false), 5000);
        setTimeout(() => setNewlyUnlocked(null), 5000);

        setAchievements(generateAchievementsList(updatedAchievements));
      }
    };

    checkAndUpdateAchievements();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 relative">
      {/* Confetti */}
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={250} />}

      {/* Sound for unlock */}
      <audio
        ref={audioRef}
        src="/sounds/unlock-sound.mp3" // You must add your unlock sound mp3 here in public/sounds folder
        preload="auto"
      />

      {/* Achievement Toast */}
      <AnimatePresence>
        {newlyUnlocked !== null && (
          <motion.div
            key="achievement-toast"
            initial={{ opacity: 0, y: -50, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1.1 }}
            exit={{ opacity: 0, y: -50, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600
              text-white px-8 py-4 rounded-3xl shadow-2xl z-50 text-center max-w-sm select-none"
          >
            <div className="text-3xl mb-2 animate-pulse">🎉</div>
            <h2 className="text-xl font-extrabold drop-shadow-lg">You unlocked:</h2>
            <p className="text-2xl font-bold tracking-wide drop-shadow-lg">
              {achievementMetadata[newlyUnlocked]?.title || 'Achievement'}
            </p>
            <p className="mt-2 text-pink-200 italic font-semibold">
              Awesome! Keep going to unlock more achievements!
            </p>
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
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-6xl overflow-y-auto"
        style={{ maxHeight: '70vh' }}
      >
        {achievements.map((ach) => (
          <AchievementCard key={ach.id} {...ach} />
        ))}
      </div>

      {/* Back to Home */}
      <Link href="/home" className="mt-6 text-sm text-pink-500 underline hover:text-pink-400">
        ← Back to Home
      </Link>
    </div>
  );
}

function AchievementCard({ id, title, description, achieved, icon }: AchievementItem) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0.7, scale: achieved ? 1 : 0.95 }}
      animate={{ opacity: achieved ? 1 : 0.7, scale: achieved ? 1.05 : 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`p-4 rounded-xl border cursor-default select-none shadow-md transition duration-300
        ${achieved ? 'bg-zinc-900 border-pink-600 shadow-pink-600/60' : 'bg-zinc-800 border-zinc-800 opacity-40'}
      `}
      title={achieved ? 'Achievement unlocked!' : 'Locked achievement'}
    >
      <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
        <span className="text-2xl select-none">{icon}</span> {title}
      </h2>
      <p className="text-sm text-gray-400">{description}</p>
    </motion.div>
  );
}