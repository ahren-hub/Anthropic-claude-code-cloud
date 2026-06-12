import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return initialValue
      const parsed = JSON.parse(item)
      // Guard against persisted wrong types (e.g., number where array expected)
      if (Array.isArray(initialValue) && !Array.isArray(parsed)) return initialValue
      if (typeof initialValue === 'object' && initialValue !== null && typeof parsed !== 'object') return initialValue
      return parsed
    } catch {
      return initialValue
    }
  })

  const [storageError, setStorageError] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      setStorageError(null)
    } catch (err) {
      console.error(`[useLocalStorage] Failed to write "${key}":`, err)
      setStorageError(err)
    }
  }, [key, value])

  return [value, setValue, storageError]
}
