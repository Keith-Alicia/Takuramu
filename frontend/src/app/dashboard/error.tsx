'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="py-16 px-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-light text-foreground">
            エラーが発生しました
          </h2>
          <p className="text-muted-foreground font-light text-sm">
            {error.message || '予期しないエラーが発生しました。'}
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={reset} variant="default" className="rounded-full">
            再試行
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="rounded-full">
            ホームへ戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
