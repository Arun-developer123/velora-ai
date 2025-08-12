import supabaseAdmin from './supabaseAdmin'

export async function unlockAchievementsForUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_data')
    .select('messages, achievements, checkin, lastCheckIn, fuel, last_checkin, created_at')
    .eq('id', userId)
    .single()

  if (error || !data) {
    throw new Error('User data not found')
  }

  const messages = data.messages || []
  const achievements: Record<string, boolean> = data.achievements || {}
  const lastCheckIn = data.lastCheckIn
  const lastCheckinTime = data.last_checkin
  const fuel = data.fuel || {}
  const createdAt = data.created_at ? new Date(data.created_at) : new Date()

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  let updatedAchievements = { ...achievements }
  let unlockedAchievementsList: string[] = []

  function unlock(id: string) {
    if (!updatedAchievements[id]) {
      updatedAchievements[id] = true
      unlockedAchievementsList.push(id)
    }
  }

  // Simple helper to get days since user signed up
  const daysSinceSignup = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  // Helper: count of daily checkins stored in achievements or in fuel (mock logic)
  // Assuming fuel.dailyCheckIns count stored, else fallback to achievements
  const dailyCheckInsCount = fuel.dailyCheckIns || 0

  // Unlock conditions progressively increasing in difficulty

  // 1. Sent at least 1 message
  if (!achievements['1'] && messages.length >= 1) unlock('1')

  // 2. Sent 10 messages
  if (!achievements['2'] && messages.length >= 10) unlock('2')

  // 3. Sent 25 messages
  if (!achievements['3'] && messages.length >= 25) unlock('3')

  // 4. Sent 50 messages
  if (!achievements['4'] && messages.length >= 50) unlock('4')

  // 5. Sent 100 messages
  if (!achievements['5'] && messages.length >= 100) unlock('5')

  // 6. Sent 200 messages
  if (!achievements['6'] && messages.length >= 200) unlock('6')

  // 7. Sent 500 messages
  if (!achievements['7'] && messages.length >= 500) unlock('7')

  // 8. Sent 1000 messages
  if (!achievements['8'] && messages.length >= 1000) unlock('8')

  // 9. Checked in today (last_checkin date matches today)
  if (
    !achievements['9'] &&
    lastCheckinTime &&
    lastCheckinTime.toISOString().split('T')[0] === today
  )
    unlock('9')

  // 10. Checked in for 5 days total (simulate with fuel.dailyCheckIns)
  if (!achievements['10'] && dailyCheckInsCount >= 5) unlock('10')

  // 11. Checked in for 10 days total
  if (!achievements['11'] && dailyCheckInsCount >= 10) unlock('11')

  // 12. Checked in for 20 days total
  if (!achievements['12'] && dailyCheckInsCount >= 20) unlock('12')

  // 13. Checked in for 30 days total
  if (!achievements['13'] && dailyCheckInsCount >= 30) unlock('13')

  // 14. Used 10 fuel points (simulate with fuel.usedFuel)
  if (!achievements['14'] && fuel.usedFuel >= 10) unlock('14')

  // 15. Used 50 fuel points
  if (!achievements['15'] && fuel.usedFuel >= 50) unlock('15')

  // 16. Used 100 fuel points
  if (!achievements['16'] && fuel.usedFuel >= 100) unlock('16')

  // 17. User has been registered for 7 days
  if (!achievements['17'] && daysSinceSignup >= 7) unlock('17')

  // 18. User has been registered for 30 days
  if (!achievements['18'] && daysSinceSignup >= 30) unlock('18')

  // 19. User has been registered for 60 days
  if (!achievements['19'] && daysSinceSignup >= 60) unlock('19')

  // 20. User has been registered for 90 days
  if (!achievements['20'] && daysSinceSignup >= 90) unlock('20')

  // 21. User has been registered for 180 days (~6 months)
  if (!achievements['21'] && daysSinceSignup >= 180) unlock('21')

  // 22. User has been registered for 365 days (1 year)
  if (!achievements['22'] && daysSinceSignup >= 365) unlock('22')

  // 23-30. Combination achievements for sustained use:

  // Sent 150 messages AND checked in at least 10 days
  if (
    !achievements['23'] &&
    messages.length >= 150 &&
    dailyCheckInsCount >= 10
  )
    unlock('23')

  // Sent 300 messages AND checked in at least 20 days
  if (
    !achievements['24'] &&
    messages.length >= 300 &&
    dailyCheckInsCount >= 20
  )
    unlock('24')

  // Sent 600 messages AND checked in at least 30 days
  if (
    !achievements['25'] &&
    messages.length >= 600 &&
    dailyCheckInsCount >= 30
  )
    unlock('25')

  // Sent 1000 messages AND used fuel >= 100
  if (
    !achievements['26'] &&
    messages.length >= 1000 &&
    fuel.usedFuel >= 100
  )
    unlock('26')

  // 31-40: Milestone achievements based on streaks and time

  // Logged in for 3 consecutive days (you need to implement a way to track this)
  // We'll just simulate unlocking achievement #31 after 3 days since signup for demo
  if (!achievements['31'] && daysSinceSignup >= 3) unlock('31')

  // Logged in for 7 consecutive days (simulate with 7 days since signup)
  if (!achievements['32'] && daysSinceSignup >= 7) unlock('32')

  // Logged in for 14 consecutive days
  if (!achievements['33'] && daysSinceSignup >= 14) unlock('33')

  // Logged in for 30 consecutive days
  if (!achievements['34'] && daysSinceSignup >= 30) unlock('34')

  // Logged in for 60 consecutive days
  if (!achievements['35'] && daysSinceSignup >= 60) unlock('35')

  // Logged in for 90 consecutive days
  if (!achievements['36'] && daysSinceSignup >= 90) unlock('36')

  // Logged in for 180 consecutive days
  if (!achievements['37'] && daysSinceSignup >= 180) unlock('37')

  // Logged in for 365 consecutive days
  if (!achievements['38'] && daysSinceSignup >= 365) unlock('38')

  // 39-45: Special task-based achievements (simulate with message counts)

  if (!achievements['39'] && messages.length >= 750) unlock('39')
  if (!achievements['40'] && messages.length >= 1250) unlock('40')
  if (!achievements['41'] && messages.length >= 1750) unlock('41')
  if (!achievements['42'] && messages.length >= 2250) unlock('42')
  if (!achievements['43'] && messages.length >= 2750) unlock('43')
  if (!achievements['44'] && messages.length >= 3250) unlock('44')
  if (!achievements['45'] && messages.length >= 3750) unlock('45')

  // 46-50: Big milestone achievements for very consistent users

  if (!achievements['46'] && daysSinceSignup >= 400) unlock('46')
  if (!achievements['47'] && daysSinceSignup >= 450) unlock('47')
  if (!achievements['48'] && daysSinceSignup >= 500) unlock('48')
  if (!achievements['49'] && daysSinceSignup >= 550) unlock('49')
  if (!achievements['50'] && daysSinceSignup >= 600) unlock('50')

  // You can add more as needed...

  if (unlockedAchievementsList.length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from('user_data')
      .update({ achievements: updatedAchievements })
      .eq('id', userId)

    if (updateError) throw new Error('Failed to update achievements')
  }

  return unlockedAchievementsList
}
