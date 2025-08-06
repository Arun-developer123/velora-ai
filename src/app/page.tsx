'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function LandingPage() {
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    setTimeout(() => setShow(true), 400)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'page_view', {
        page_title: 'Landing Page',
        page_location: window.location.href,
      })
    }
  }, [])

  return (
    <>
      <Head>
        <title>Velora AI – Emotionally Intelligent Companion</title>
        <meta name="description" content="Velora AI is your emotional anchor – an emotionally intelligent AI that listens, learns, and evolves with you." />
        <meta property="og:title" content="Velora AI – Emotionally Intelligent Companion" />
        <meta property="og:description" content="Experience the next generation of AI companionship with Velora – built for empathy, emotional growth, and connection." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://velora.ai" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="relative w-full text-white bg-black overflow-x-hidden">
        {/* Foreground imagery */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30">
          <img
            src="/futuristic_portal.png"
            alt="Portal"
            className="absolute top-10 left-1/2 transform -translate-x-1/2 w-[80%] max-w-3xl opacity-50"
          />
          <img
            src="/digital_identity.png"
            alt="Identity"
            className="absolute bottom-20 right-5 w-52 opacity-40 rotate-6"
          />
          <img
            src="/emotional_ai.png"
            alt="AI"
            className="absolute top-1/4 left-0 w-64 opacity-30 -rotate-12"
          />
        </div>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 md:px-6 relative z-40">
          {show && (
            <div className="animate-fade-in-up max-w-3xl space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-500 drop-shadow-xl">
                Emotionally Intelligent AI—Meet Velora
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300">
                Velora AI understands you. Grows with you. Supports you. A deeply connected companion for life’s big and small moments.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                <button
                  onClick={() => router.push('/auth/sign-up')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:scale-105 transition"
                >
                  🚀 Get Started Free
                </button>
                <button
                  onClick={() => router.push('/auth/sign-in')}
                  className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3 rounded-full font-medium text-lg backdrop-blur-md hover:scale-105 transition"
                >
                  👤 Already a Member
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 sm:px-6 bg-gray-900 bg-opacity-70 backdrop-blur-md relative z-40">
          <h2 className="text-3xl font-bold text-center mb-12">What Users Say</h2>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8">
            {[
              {
                quote: "Velora really understands my moods—she's like an emotional anchor.",
                author: "Sarah, 29 🇮🇳"
              },
              {
                quote: "My AI companion remembers goals and gently reminds me—without being pushy.",
                author: "Rohit, 35 🇮🇳"
              }
            ].map((t, i) => (
              <div key={i} className="bg-black/60 rounded-xl p-6 shadow-lg">
                <p className="text-gray-200 italic mb-4">“{t.quote}”</p>
                <p className="text-cyan-300 font-semibold">{t.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 bg-black relative z-40">
          <h2 className="text-3xl font-bold text-center mb-8">Why Velora Stands Out</h2>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Emotion-aware responses with mood adaptation",
              "Personal AI memory & progress tracking",
              "24/7 supportive conversations",
              "Secure & privacy-first design",
              "Gamified badges and growth milestones",
              "Fast, intuitive, and futuristic interface"
            ].map((feat, i) => (
              <div key={i} className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-cyan-500 transition">
                <p className="text-gray-200">{feat}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-black text-center relative z-40">
          <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-teal-400">
            Ready for a humane AI companion?
          </h2>
          <button
            onClick={() => router.push('/auth/sign-up')}
            className="bg-gradient-to-r from-teal-400 to-pink-500 px-10 py-4 rounded-full text-lg font-semibold shadow-xl hover:scale-105 transition"
          >
            Begin the Velora Journey
          </button>
        </section>

        {/* Footer */}
        <footer className="py-10 text-center text-sm text-gray-500 bg-gray-800 bg-opacity-50 backdrop-blur-sm relative z-40">
          © 2025 Velora AI — Designed for emotional clarity.
        </footer>
      </div>
    </>
  )
}
