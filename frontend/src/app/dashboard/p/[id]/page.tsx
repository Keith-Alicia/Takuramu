import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockPortfolios, mockPlaces } from "@/lib/mock-data";
import { Plus, Share, ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";

export default async function PortfolioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const portfolioId = resolvedParams.id;
  const portfolio = mockPortfolios.find(p => p.id === portfolioId);
  const places = mockPlaces[portfolioId] || [];

  if (!portfolio) {
    return <div className="text-center py-12">ポートフォリオが見つかりません。</div>;
  }

  return (
    <div className="space-y-12">
      {/* Header Area */}
      <div className="flex flex-col gap-6">
        <Link href="/dashboard" className="text-muted-foreground flex items-center text-sm font-light hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-serif font-light mb-2">{portfolio.title}</h2>
            <p className="text-muted-foreground font-sans font-light text-sm">
              {places.length} 件のお店を記録
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/share/${portfolio.share_id}`} target="_blank">
              <Button variant="outline" className="rounded-full shadow-none font-light">
                <Share className="w-4 h-4 mr-2" />
                共有URL
              </Button>
            </Link>
            <Link href={`/dashboard/p/${portfolioId}/add`}>
              <Button className="rounded-full shadow-none font-light">
                <Plus className="w-4 h-4 mr-2" />
                お店を追加
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Places List */}
      {places.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border/50">
          <p className="text-muted-foreground font-light mb-6">まだお店が追加されていません。</p>
          <Link href={`/dashboard/p/${portfolioId}/add`}>
            <Button className="rounded-full shadow-none font-light" variant="outline">
              最初のお店を追加する
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {places.map((place) => (
            <div key={place.id} className="group relative border border-border/50 rounded-2xl overflow-hidden bg-card transition-colors hover:bg-muted/10">
              <div className="aspect-[4/3] w-full bg-muted relative overflow-hidden">
                {place.photos[0] ? (
                  <Image 
                    src={place.photos[0].storage_url} 
                    alt="お店の写真" 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground font-light text-sm">
                    No Photo
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8">
                <p className="font-serif leading-relaxed text-sm md:text-base text-card-foreground">
                  {place.ai_generated_text}
                </p>
                <div className="mt-6 pt-4 border-t border-border/30 flex justify-between items-center">
                  <a href={place.tabelog_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground font-light flex items-center transition-colors">
                    食べログを見る
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                  <span className="text-xs text-muted-foreground font-light">
                    {new Date(place.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}