'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/lib/supabase/client'

// TODO: Replace with generated types from Supabase
type User = {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export function useSupabaseUser() {
  const { user: clerkUser, isLoaded } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!clerkUser) {
      setUser(null)
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_user_id', clerkUser.id)
          .single()

        if (error) throw error
        setUser(data as User)
      } catch (err) {
        console.error('Error fetching Supabase user:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [clerkUser, isLoaded])

  return { user, loading, error, refetch: () => setLoading(true) }
}
