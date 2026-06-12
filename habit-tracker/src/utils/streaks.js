import { localDateStr } from './dates'

export function calculateStreak(logs, habitId) {
  const now = new Date()
  const todayStr = localDateStr(now)

  // If today isn't logged, start counting from yesterday
  if (!logs[todayStr]?.[habitId]) {
    now.setDate(now.getDate() - 1)
  }

  let streak = 0
  while (true) {
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
