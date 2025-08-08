'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import supabase from '@/lib/supabase'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const analyzeMessagesAndGetQuestion = (messages: string[]): string => {
  const keywords: Record<string, string> = {
    overwhelmed: 'stress',
    meditation: 'routine',
    family: 'relationships',
    breakup: 'recovery',
    journaling: 'journaling',
    anxious: 'anxiety',
    friend: 'support',
    exercising: 'exercise',
    career: 'career',
    sleeping: 'sleep'
  }

  const questionBank: Record<string, string> = {
    stress: "What’s something you can do today to ease your stress?",
    routine: "What’s one small habit that’s helping you feel balanced lately?",
    relationships: "Who’s someone in your life you’re especially grateful for today?",
    recovery: "What’s something you’re doing to take care of your heart right now?",
    journaling: "What’s one thing you’d like to write about in your journal today?",
    anxiety: "What’s one thing you can let go of today to feel calmer?",
    support: "How did someone support you recently, and how did it feel?",
    exercise: "How does your body feel after moving it recently?",
    career: "What excites you about the idea of change in your work?",
    sleep: "What’s one thing you can do tonight to improve your rest?"
  }

  const matchedTopics = new Set<string>()

  messages.forEach(msg => {
    const lower = msg.toLowerCase()
    for (const keyword in keywords) {
      if (lower.includes(keyword)) {
        matchedTopics.add(keywords[keyword])
      }
    }
  })

  const questions = Array.from(matchedTopics).map(topic => questionBank[topic])
  return questions.length > 0
    ? questions[Math.floor(Math.random() * questions.length)]
    : "What's one thing you're grateful for today?"
}

export default function DailyCheckInPage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [response, setResponse] = useState('')
  const [name, setName] = useState<string | null>('there')
  const [lastCheckInTime, setLastCheckInTime] = useState<string | null>(null)
  const [question, setQuestion] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
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
        .select('name, last_checkin, messages')
        .eq('id', user.id)
        .single()

      if (dataError) {
        console.error('Error fetching user data:', dataError.message)
      } else {
        setName(data?.name || 'there')
        setLastCheckInTime(data?.last_checkin || null)

        const hoursSince = data?.last_checkin
          ? dayjs().diff(dayjs(data.last_checkin), 'hour')
          : 25

        if (hoursSince < 24) {
          setIsCheckedIn(true)
        }

        const userMessages = data?.messages || []
        setQuestion(analyzeMessagesAndGetQuestion(userMessages))
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    if (isCheckedIn && response !== '') {
      const timer = setTimeout(() => {
        router.push('/home')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCheckedIn, router])

  const handleCheckIn = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('Error getting user:', error?.message)
      return
    }

    const { error: updateError } = await supabase
      .from('user_data')
      .update({
        checkin: response,
        last_checkin: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating check-in:', updateError.message)
      return
    }

    setIsCheckedIn(true)
  }

  const hoursLeft = lastCheckInTime
    ? 24 - dayjs().diff(dayjs(lastCheckInTime), 'hour')
    : 0

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
          <p className="text-gray-300 mb-4">Here's your check-in for today:</p>
          <p className="text-lg font-semibold mb-6">{question}</p>

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
          <h2 className="text-2xl font-bold mb-2">
            {hoursLeft > 0 ? 'Already checked in!' : 'Check-in complete'}
          </h2>
          <p className="text-gray-300 mb-4">
            {hoursLeft > 0
              ? `You can check in again in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.`
              : 'Great job! You’re all set for today.'}
          </p>
          {response && <p className="text-indigo-400 italic mb-6">“{response}”</p>}
          <p className="text-sm text-gray-400">Redirecting to home...</p>
        </div>
      )}
    </main>
  )
}
