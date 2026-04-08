'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortfolio } from '@/app/actions/portfolios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function NewPortfolioForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const result = await createPortfolio(formData)

        if (result.success && result.data) {
          router.push(`/dashboard/p/${result.data.id}`)
          router.refresh()
        } else {
          setError(result.error || '作成に失敗しました')
        }
      } catch (err) {
        setError('予期しないエラーが発生しました')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-light">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Label htmlFor="title" className="font-serif">タイトル <span className="text-destructive">*</span></Label>
        <Input
          id="title"
          name="title"
          placeholder="例: 横浜の美味しい中華"
          required
          maxLength={100}
          disabled={isPending}
          className="font-sans font-light rounded-xl h-12 px-4"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full px-8 font-sans font-light tracking-wide shadow-none"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? '作成中...' : '作成する'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="rounded-full px-8 font-sans font-light tracking-wide shadow-none"
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}
