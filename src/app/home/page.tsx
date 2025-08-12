'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import supabase from '@/lib/supabase'

export default function HomePage() {
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [unseenCount, setUnseenCount] = useState(0)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error('Error fetching user:', userError?.message)
          setName(null)
          setLoading(false)
          return
        }

        // Fetch user name
        const { data, error } = await supabase
          .from('user_data')
          .select('name')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching name:', error.message)
          setName(null)
        } else {
          setName(data?.name || null)
        }

        // Fetch unseen Nyra messages count
        const { count, error: countError } = await supabase
          .from('nyra_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('seen', false)

        if (!countError && typeof count === 'number') {
          setUnseenCount(count)
        }

      } catch (err) {
        console.error('Unexpected error:', err)
      } finally {
        setLoading(false) // ✅ Always stop loading after fetch
      }
    }

    fetchUserData()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">

        {/* Nyra's Profile Picture */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/zara-profile.jpg"
            alt="Nyra Profile Picture"
            width={120}
            height={120}
            className="rounded-full shadow-lg border-4 border-indigo-500"
          />
        </div>

        {/* Greeting */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {loading ? (
            <span className="text-gray-400">Loading...</span>
          ) : (
            <>Hi {name || 'there'}, I’m <span className="text-indigo-400">Nyra</span>.</>
          )}
        </h1>

        <p className="text-lg md:text-xl text-gray-400 mb-10">
          Your AI companion is here to guide, support and explore with you.
        </p>

        {/* Action Buttons */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <Link href="/chat" className="relative">
            <button className="w-full px-6 py-4 bg-indigo-600 hover:bg-opacity-100 text-white text-lg rounded-2xl shadow-lg transition duration-300 relative">
              🚀 Start Chatting
              {unseenCount > 0 && (
                <span className="absolute top-0 right-2 -mt-1 -mr-2 bg-red-600 text-xs font-bold rounded-full px-2 py-0.5 shadow-lg">
                  {unseenCount}
                </span>
              )}
            </button>
          </Link>

          <Link href="/fuel">
            <button className="w-full px-6 py-4 bg-purple-700 hover:bg-opacity-100 text-white text-lg rounded-2xl shadow-lg transition duration-300">
              ⚡ Check Nyra’s Energy
            </button>
          </Link>

          <Link href="/daily-checkin">
            <button className="w-full px-6 py-4 bg-emerald-600 hover:bg-opacity-100 text-white text-lg rounded-2xl shadow-lg transition duration-300">
              ☀️ Daily Check-In
            </button>
          </Link>

          <Link href="/achievements">
            <button className="w-full px-6 py-4 bg-pink-600 hover:bg-opacity-100 text-white text-lg rounded-2xl shadow-lg transition duration-300">
              🏆 Achievements
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
