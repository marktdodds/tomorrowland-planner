import { useCallback, useEffect, useState } from 'react'

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (value: string) => T = JSON.parse,
): [T, (value: T | ((prev: T) => T)) => void] {
  const readValue = useCallback((): T => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored === null) return initialValue
      return deserialize(stored)
    } catch {
      return initialValue
    }
  }, [deserialize, initialValue, key])

  const [state, setState] = useState<T>(readValue)

  useEffect(() => {
    setState(readValue())
  }, [readValue])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
        try {
          window.localStorage.setItem(key, serialize(next))
        } catch {
          // ignore quota errors
        }
        return next
      })
    },
    [key, serialize],
  )

  return [state, setValue]
}

export function useSetLocalStorage(key: string, initialValue: string[] = []) {
  const deserialize = useCallback((value: string) => new Set<string>(JSON.parse(value) as string[]), [])
  const serialize = useCallback((value: Set<string>) => JSON.stringify(Array.from(value)), [])

  const [stored, setStored] = useLocalStorageState<Set<string>>(
    key,
    new Set(initialValue),
    serialize,
    deserialize,
  )

  const toggle = useCallback(
    (id: string) => {
      setStored((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    },
    [setStored],
  )

  const clear = useCallback(() => setStored(new Set()), [setStored])

  return { selected: stored, toggle, clear, setSelected: setStored }
}
