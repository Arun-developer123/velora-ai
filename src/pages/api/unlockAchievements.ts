import type { NextApiRequest, NextApiResponse } from 'next'
import { unlockAchievementsForUser } from '@/lib/achievementLogic'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  try {
    const unlocked = await unlockAchievementsForUser(userId)
    res.status(200).json({ unlocked })
  } catch (error) {
    console.error('Unlock achievement error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
