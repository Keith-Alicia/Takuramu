'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
export function useSupabaseQuery<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: (client: ReturnType<typeof createClient>) => Promise<{ data: T[] | null; error: any }>
) {
  const [data, setData] = useState<T[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await query(supabase)

        if (error) throw error
        setData(data)
      } catch (err) {
        console.error('Query error:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query])

  const refetch = () => {
    setLoading(true)
  }

  return { data, loading, error, refetch }
}
