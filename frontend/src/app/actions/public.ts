'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSharedPortfolioData(shareId: string) {
  try {
    const supabase = await createClient()

    // Fetch portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('share_id', shareId)
      .eq('is_public', true)
      .single()

    if (portfolioError || !portfolio) {
      throw new Error('ポートフォリオが見つからないか、公開されていません')
    }

    // Fetch places with photos
    const { data: places, error: placesError } = await supabase
      .from('places')
      .select(`
        *,
        photos (
          id,
          storage_url,
          order_index
        )
      `)
      .eq('portfolio_id', portfolio.id)
      .order('created_at', { ascending: true })

    if (placesError) {
      throw new Error('お店のデータの取得に失敗しました')
    }

    return { 
      success: true, 
      data: {
        portfolio,
        places: places || []
      }
    }
  } catch (error) {
    console.error('Get shared portfolio error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'データの取得に失敗しました' 
    }
  }
}
