import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSharedPortfolioData } from "@/app/actions/public";

export default async function SharedPortfolioPage({ params }: { params: Promise<{ shareId: string }> }) {
  const resolvedParams = await params;
  const shareId = resolvedParams.shareId;
  
  const result = await getSharedPortfolioData(shareId);
  
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground font-light">
        このページは公開されていないか、存在しません。
      </div>
    );
  }

  const { portfolio, places } = result.data;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Header */}
      <header className="w-full py-8 text-center bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/30">
        <h1 className="font-serif text-2xl md:text-3xl font-light tracking-wide">{portfolio.title}</h1>
        <p className="text-muted-foreground font-sans font-light text-xs mt-2">
          {places.length} 件の記録
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-2xl px-4 py-12 space-y-24">
        {places.map((place, index) => (
          <article key={place.id} className="w-full flex flex-col">
            {/* Photos Carousel Area */}
            <div className="w-full aspect-[4/3] md:aspect-[16/9] relative bg-muted rounded-2xl overflow-hidden shadow-sm">
              {place.photos[0] ? (
                <Image 
                  src={place.photos[0].storage_url} 
                  alt={`Photo for place ${index + 1}`} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-light text-sm">
                  No Photo
                </div>
              )}
              {/* Optional: Add indicators if multiple photos exist */}
              {place.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {place.photos.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Content Area - Overlapping slightly with the image for a modern look */}
            <div className="bg-card w-[95%] md:w-[90%] mx-auto -mt-12 md:-mt-16 rounded-2xl p-6 md:p-10 shadow-xl border border-border/30 z-10 relative">
              <p className="font-serif text-base md:text-lg lg:text-xl leading-loose md:leading-loose text-card-foreground text-justify">
                {place.ai_generated_text}
              </p>
              
              <div className="mt-8 pt-6 border-t border-border/40 flex justify-center">
                <a 
                  href={place.tabelog_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border/50 text-sm font-sans font-light hover:bg-muted/30 transition-colors"
                >
                  食べログで詳細を見る
                  <ExternalLink className="w-3.5 h-3.5 ml-2 text-muted-foreground" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* Sticky CTA Footer */}
      <div className="fixed bottom-0 w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent flex justify-center z-50 pb-8 pointer-events-none">
        <Link href="/">
          <Button size="lg" className="rounded-full shadow-2xl px-8 font-sans font-light tracking-wide pointer-events-auto hover:scale-105 transition-transform">
            自分も「たくらむ」をはじめる
          </Button>
        </Link>
      </div>
    </div>
  );
}