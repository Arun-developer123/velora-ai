'use client'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-xl backdrop-blur-xl shadow-lg space-y-6 text-center">
        <h2 className="text-3xl font-bold">Verify Your Email</h2>
        <p className="text-gray-300">
          We’ve sent a confirmation link to your email. Please check your inbox (and spam folder).
        </p>
        <p className="text-sm text-gray-400 mt-4">After verifying, you’ll be logged in automatically.</p>
      </div>
    </div>
  )
}
