'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // ✅ Supabase sends confirmation email
    router.push('/auth/verify-email')
  }

  const signUpWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-xl backdrop-blur-xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center">Create Account</h2>

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
            placeholder="Password (min 6 chars)"
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
        {loading && <p className="text-white text-sm">Signing up...</p>}

        <button
          onClick={handleSignUp}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold text-white"
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Sign Up'}
        </button>

        <button
          onClick={signUpWithGoogle}
          className="w-full py-3 border border-white/30 hover:bg-white/10 rounded-lg text-white"
        >
          Sign up with Google
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <a href="/auth/sign-in" className="text-cyan-400 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
