'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import supabase from '@/lib/supabase'

export default function HomePage() {
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchName = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error('Error fetching user:', userError.message)
          setName(null)
          setLoading(false)
          return
        }

        if (user) {
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
        } else {
          setName(null)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setName(null)
      } finally {
        setLoading(false)
      }
    }

    fetchName()
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
          <Link href="/chat">
            <button className="w-full px-6 py-4 bg-indigo-600 hover:bg-opacity-100 text-white text-lg rounded-2xl shadow-lg transition duration-300">
              🚀 Start Chatting
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
