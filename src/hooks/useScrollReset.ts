import { useEffect, useRef } from 'react'

export function useScrollReset(key: string) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0
  }, [key])

  return ref
}
