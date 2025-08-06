'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import supabase from '@/lib/supabase'

export default function DailyCheckInPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [response, setResponse] = useState('')
  const [name, setName] = useState<string | null>('there')
  const router = useRouter()

  const dailyQuestion = "What's one thing you're grateful for today?"

  useEffect(() => {
    const fetchUserName = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        console.error('User fetch error:', error?.message)
        return
      }

      const { data, error: dataError } = await supabase
        .from('user_data')
        .select('name')
        .eq('id', user.id)
        .single()

      if (dataError) {
        console.error('Error fetching name:', dataError.message)
      } else {
        setName(data?.name || 'there')
      }
    }

    fetchUserName()
  }, [])

  useEffect(() => {
    if (isCheckedIn) {
      const timer = setTimeout(() => {
        router.push('/home')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isCheckedIn, router])

  const handleCheckIn = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error('Error getting user:', userError?.message)
        return
      }

      const { error: updateError } = await supabase
        .from('user_data')
        .update({ checkin: response })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating checkin:', updateError.message)
        return
      }

      setIsCheckedIn(true)
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-10">
      {!isCheckedIn ? (
        <div className="bg-[#1F1B2E] p-6 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/zara-profile.jpg"
              alt="Nyra"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold mb-1">Hi {name}!</h2>
          <p className="text-gray-300 mb-4">Here’s your check-in for today:</p>
          <p className="text-lg font-semibold mb-6">{dailyQuestion}</p>

          <input
            type="text"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your answer..."
            className="w-full p-3 mb-4 rounded-xl bg-gray-800 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleCheckIn}
            disabled={!response.trim()}
            className={`w-full font-semibold py-3 rounded-xl transition ${
              response.trim()
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            SUBMIT
          </button>
        </div>
      ) : (
        <div className="bg-[#1F1B2E] p-6 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-200 p-4 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check-in complete</h2>
          <p className="text-gray-300 mb-4">Great job! You’re all set for today.</p>
          <p className="text-indigo-400 italic mb-6">“{response}”</p>
          <p className="text-sm text-gray-400">Redirecting to home...</p>
        </div>
      )}
    </main>
  )
}
