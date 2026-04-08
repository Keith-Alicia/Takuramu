import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EditPlaceForm } from "@/components/features/EditPlaceForm";
import { getPortfolio } from "../../../../../actions/portfolios";
import { getPlace } from "../../../../../actions/places";

export default async function EditPlacePage({ params }: { params: Promise<{ id: string, placeId: string }> }) {
  const resolvedParams = await params;
  const portfolioId = resolvedParams.id;
  const placeId = resolvedParams.placeId;
  
  const [portfolioResult, placeResult] = await Promise.all([
    getPortfolio(portfolioId),
    getPlace(placeId, portfolioId)
  ]);

  const portfolio = portfolioResult.success ? portfolioResult.data : null;
  const place = placeResult.success ? placeResult.data : null;

  if (!portfolio || !place) {
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
          <h2 className="text-2xl md:text-3xl font-serif font-light mb-2">お店を編集</h2>
          <p className="text-muted-foreground font-sans font-light text-sm">
            {portfolio.title} に登録した {place.name || 'お店'} の情報を編集します。
          </p>
        </div>
      </div>

      <div className="bg-card p-6 md:p-10 rounded-3xl border border-border/50">
        <EditPlaceForm portfolioId={portfolioId} place={place} />
      </div>
    </div>
  );
}