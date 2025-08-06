'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'

type FuelInfo = {
  fuel: number
  plan: string
  updated_at?: string
  backend_cost?: number
}

export default function FuelPage() {
  const [loading, setLoading] = useState(true)
  const [fuelData, setFuelData] = useState<FuelInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchFuel = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth/sign-in')
        return
      }

      const { data, error } = await supabase
        .from('user_data')
        .select('fuel')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching fuel:', error)
        setErrorMsg('Failed to load fuel info. Please try again later.')
      } else {
        setFuelData(data?.fuel || { fuel: 0, plan: 'free' })
      }

      setLoading(false)
    }

    fetchFuel()
  }, [router])

  const handlePurchase = async (type: 'full' | 'refill') => {
    setLoading(true)
    setErrorMsg('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    const cost = 0.5
    const fuelValue = type === 'full' ? 13.0 : 5.0
    const plan = type === 'full' ? 'premium' : fuelData?.plan || 'free'

    const updatedFuel: FuelInfo = {
      fuel: fuelValue,
      plan,
      updated_at: new Date().toISOString(),
      backend_cost: cost,
    }

    const { error } = await supabase
      .from('user_data')
      .update({ fuel: updatedFuel })
      .eq('id', session.user.id)

    if (error) {
      console.error('Fuel update failed:', error)
      setErrorMsg('Failed to update fuel. Try again.')
    } else {
      setFuelData(updatedFuel)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700 animate-pulse">⏳ Loading your fuel...</p>
      </div>
    )
  }

  const isFirstTime = fuelData?.plan === 'free'
  const fuelLabel = fuelData?.plan === 'premium' ? "Nyra's Energy" : 'Current Fuel'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 px-4 py-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">🛢️ Fuel Tube</h1>

        {errorMsg && (
          <p className="text-red-600 text-sm mb-4 text-center">{errorMsg}</p>
        )}

        <div className="mb-4 space-y-2 text-center">
          <p className="text-lg text-gray-700">{fuelLabel}: <strong>{fuelData?.fuel}</strong></p>
          <p className="text-gray-600">Plan: <strong className="capitalize">{fuelData?.plan}</strong></p>
        </div>

        <div className="space-y-3">
          {isFirstTime ? (
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-xl transition"
              onClick={() => handlePurchase('full')}
            >
              🚀 Buy One-Time Plan ($13)
            </button>
          ) : (
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition"
              onClick={() => handlePurchase('refill')}
            >
              🔄 Refill Nyra's Energy ($5)
            </button>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Fuel helps you chat more with your AI companion. Plans reset monthly.
        </p>
      </div>
    </div>
  )
}
