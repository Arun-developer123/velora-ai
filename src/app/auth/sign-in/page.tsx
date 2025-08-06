'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('') // NEW STATE
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async () => {
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError(signInError.message)
      return
    }

    const userId = data?.user?.id
    if (!userId) {
      setError('User ID not found after sign in.')
      return
    }

    // Save user's name in user_data table (upsert ensures insert or update)
    const { error: dbError } = await supabase
      .from('user_data')
      .upsert(
        { id: userId, name }, // Ensure `id` is primary key in your `user_data` table
        { onConflict: 'id' }
      )

    if (dbError) {
      setError('Signed in but failed to save name: ' + dbError.message)
      return
    }

    router.push('/home')
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-xl backdrop-blur-xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center">Sign In</h2>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-gray-400"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-gray-400"
        />

        <div className="relative w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder:text-gray-400"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-cyan-400"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleSignIn}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold text-white"
        >
          Sign In
        </button>

        <button
          onClick={signInWithGoogle}
          className="w-full py-3 border border-white/30 hover:bg-white/10 rounded-lg text-white"
        >
          Sign in with Google
        </button>

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{' '}
          <a href="/auth/sign-up" className="text-cyan-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
