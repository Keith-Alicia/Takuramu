import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddPlaceForm } from "@/components/features/AddPlaceForm";
import { getPortfolio } from "../../../../actions/portfolios";

export default async function AddPlacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const portfolioId = resolvedParams.id;
  
  const result = await getPortfolio(portfolioId);
  const portfolio = result.success ? result.data : null;

  if (!portfolio) {
    return <div className="text-center py-12">データが見つかりません。</div>;
  }

  return (
    <div className="space-y-12 max-w-2xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <Link href={`/dashboard/p/${portfolioId}`} className="text-muted-foreground flex items-center text-sm font-light hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-light mb-2">お店を追加</h2>
          <p className="text-muted-foreground font-sans font-light text-sm">
            {portfolio.title} に新しい思い出を記録しましょう。
          </p>
        </div>
      </div>

      <div className="bg-card p-6 md:p-10 rounded-3xl border border-border/50">
        <AddPlaceForm portfolioId={portfolioId} />
      </div>
    </div>
  );
}