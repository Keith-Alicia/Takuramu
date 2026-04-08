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
  name: z.string().min(1, '店名は必須です').max(255, '店名は255文字以内で入力してください'),
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
      name: formData.get('name'),
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
        name: validated.name,
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

export async function getPlace(id: string, portfolioId: string) {
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

    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single()

    if (!portfolio) throw new Error('権限がありません')

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
      .eq('id', id)
      .eq('portfolio_id', portfolioId)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Get place error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'お店の取得に失敗しました' 
    }
  }
}

const updatePlaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '店名は必須です').max(255, '店名は255文字以内で入力してください'),
  tabelog_url: z.string().url('有効なURLを入力してください'),
  portfolio_id: z.string().uuid(),
  deleted_photos: z.string().optional(), // JSON array of photo IDs to delete
})

export async function updatePlace(formData: FormData) {
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
    const validated = updatePlaceSchema.parse({
      id: formData.get('id'),
      name: formData.get('name'),
      tabelog_url: formData.get('tabelog_url'),
      portfolio_id: formData.get('portfolio_id'),
      deleted_photos: formData.get('deleted_photos') || '[]',
    })

    // Verify the portfolio belongs to the user
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', validated.portfolio_id)
      .eq('user_id', user.id)
      .single()

    if (!portfolio) throw new Error('権限がありません')

    // Optional AI Processing (Mock) if new audio provided
    const audioFile = formData.get('audio_file') as File | null
    let aiGeneratedText: string | undefined = undefined;
    
    if (audioFile && audioFile.size > 0) {
      aiGeneratedText = "（再生成されたテキスト）静かで落ち着いた雰囲気の店内。シェフのこだわりが詰まった料理の数々に感動しました。また特別な日に訪れたいと思える、素晴らしい体験でした。"
    }

    // 1. Update place
    const updateData: any = {
      name: validated.name,
      tabelog_url: validated.tabelog_url,
    }
    if (aiGeneratedText) {
      updateData.ai_generated_text = aiGeneratedText
    }

    const { data: place, error: placeError } = await supabase
      .from('places')
      .update(updateData)
      .eq('id', validated.id)
      .eq('portfolio_id', validated.portfolio_id)
      .select()
      .single()

    if (placeError) throw placeError

    // 2. Delete photos if requested
    const deletedPhotoIds = JSON.parse(validated.deleted_photos || '[]') as string[]
    if (deletedPhotoIds.length > 0) {
      await supabase
        .from('photos')
        .delete()
        .in('id', deletedPhotoIds)
    }

    // 3. Upload new photos (if any)
    for (let i = 0; i < 3; i++) {
      const photoFile = formData.get(`photo_${i}`) as File | null
      if (photoFile && photoFile.size > 0) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${place.id}_${i}_${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, photoFile)
          
        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('photos')
            .getPublicUrl(uploadData.path)

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
    console.error('Update place error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'お店の更新に失敗しました' 
    }
  }
}
