'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers'

const createPortfolioSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),
})

export async function createPortfolio(formData: FormData) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('認証が必要です')

    const validated = createPortfolioSchema.parse({
      title: formData.get('title'),
    })

    const supabase = createServiceRoleClient()

    // 1. ユーザー情報の取得（Clerk ID から Supabase の users テーブルの ID を引く）
    const { data: initialUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    let user = initialUser

    if (userError || !user) {
      user = await ensureSupabaseUser()
      if (!user) throw new Error('ユーザーが見つかりません')
    }

    // 2. ポートフォリオの作成
    // share_id は推測不可能なランダム文字列として生成
    const shareId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        title: validated.title,
        share_id: shareId,
        is_public: true,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, data: portfolio }
  } catch (error) {
    console.error('Create portfolio error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'ポートフォリオの作成に失敗しました' 
    }
  }
}

export async function getPortfolios() {
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

    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        places (count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Formatted data
    const formattedData = data.map((portfolio) => ({
      ...portfolio,
      place_count: portfolio.places[0].count,
    }))

    return { success: true, data: formattedData }
  } catch (error) {
    console.error('Get portfolios error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'ポートフォリオの取得に失敗しました' 
    }
  }
}

export async function deletePortfolio(id: string) {
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

    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Delete portfolio error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '削除に失敗しました' 
    }
  }
}

export async function getPortfolio(id: string) {
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

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Get portfolio error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'ポートフォリオの取得に失敗しました' 
    }
  }
}
