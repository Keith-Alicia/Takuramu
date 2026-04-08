'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export function useSupabaseQuery<T>(
  query: (client: ReturnType<typeof createClient>) => PostgrestFilterBuilder<any, any, T[]>
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
