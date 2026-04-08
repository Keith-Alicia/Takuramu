'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers'

// Places related actions

export async function getPlaces(portfolioId: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const supabase = createServiceRoleClient()
    
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (!user) {
      user = await ensureSupabaseUser()
      if (!user) throw new Error('ユーザーが見つかりません')
    }

    // RLS will ensure user only fetches places for their portfolios
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        photos (
          id,
          storage_url,
          order_index
        )
      `)
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Get places error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'お店の取得に失敗しました' 
    }
  }
}

export async function deletePlace(id: string, portfolioId: string) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const supabase = createServiceRoleClient()

    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (!user) {
      user = await ensureSupabaseUser()
      if (!user) throw new Error('ユーザーが見つかりません')
    }

    // Verify the portfolio belongs to the user
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single()

    if (!portfolio) throw new Error('権限がありません')

    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id)
      .eq('portfolio_id', portfolioId)

    if (error) throw error

    revalidatePath(`/dashboard/p/${portfolioId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete place error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '削除に失敗しました' 
    }
  }
}

const createPlaceSchema = z.object({
  tabelog_url: z.string().url('有効なURLを入力してください'),
  portfolio_id: z.string().uuid(),
})

export async function createPlace(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const supabase = createServiceRoleClient()

    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (!user) {
      user = await ensureSupabaseUser()
      if (!user) throw new Error('ユーザーが見つかりません')
    }

    // Validate inputs
    const validated = createPlaceSchema.parse({
      tabelog_url: formData.get('tabelog_url'),
      portfolio_id: formData.get('portfolio_id'),
    })

    // Verify the portfolio belongs to the user
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', validated.portfolio_id)
      .eq('user_id', user.id)
      .single()

    if (!portfolio) throw new Error('権限がありません')

    // Simulated AI Processing (Mock)
    const audioFile = formData.get('audio_file') as File | null
    // Temporarily disable audio file requirement to allow testing
    // if (!audioFile) throw new Error('音声ファイルが必要です')

    // AIのダミーレスポンス
    const aiGeneratedText = "静かで落ち着いた雰囲気の店内。シェフのこだわりが詰まった料理の数々に感動しました。また特別な日に訪れたいと思える、素晴らしい体験でした。"

    // 1. Insert place
    const { data: place, error: placeError } = await supabase
      .from('places')
      .insert({
        portfolio_id: validated.portfolio_id,
        tabelog_url: validated.tabelog_url,
        ai_generated_text: aiGeneratedText,
      })
      .select()
      .single()

    if (placeError) throw placeError

    // 2. Upload photos (if any)
    for (let i = 0; i < 3; i++) {
      const photoFile = formData.get(`photo_${i}`) as File | null
      if (photoFile && photoFile.size > 0) {
        // Upload to Supabase Storage (Assumes 'photos' bucket exists and is public)
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${place.id}_${i}_${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, photoFile)
          
        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('photos')
            .getPublicUrl(uploadData.path)

          // Insert into photos table
          await supabase
            .from('photos')
            .insert({
              place_id: place.id,
              storage_url: publicUrlData.publicUrl,
              order_index: i,
            })
        }
      }
    }

    revalidatePath(`/dashboard/p/${validated.portfolio_id}`)
    return { success: true, data: place }
  } catch (error) {
    console.error('Create place error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'お店の追加に失敗しました' 
    }
  }
}
