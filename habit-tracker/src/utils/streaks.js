import { localDateStr } from './dates'

export function calculateStreak(logs, habitId) {
  const now = new Date()
  const todayStr = localDateStr(now)

  // If today isn't logged, start counting from yesterday
  if (!logs[todayStr]?.[habitId]) {
    now.setDate(now.getDate() - 1)
  }

  let streak = 0
  const MAX_STREAK = 3650 // cap at 10 years to prevent runaway loop on corrupted data
  while (streak < MAX_STREAK) {
    const dateStr = localDateStr(now)
    if (logs[dateStr]?.[habitId]) {
      streak++
      now.setDate(now.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
