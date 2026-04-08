import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getPortfolios } from "../actions/portfolios";

export default async function DashboardPage() {
  const result = await getPortfolios();
  const portfolios = result.success ? result.data || [] : [];

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-light mb-2">あなたのたくらみ</h2>
          <p className="text-muted-foreground font-serif font-light text-sm mb-1">
            記憶を編んで、次を企む。
          </p>
          <p className="text-muted-foreground font-sans font-light text-xs opacity-70">
            記録したプランや場所のリスト
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button className="rounded-full px-6 font-sans font-light tracking-wide shadow-none">
            <Plus className="w-4 h-4 mr-2" />
            新規作成
          </Button>
        </Link>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border/50 flex flex-col items-center gap-4">
          <p className="text-muted-foreground font-light">まだ記録がありません。</p>
          <Link href="/dashboard/new">
            <Button variant="outline" className="rounded-full px-6 font-sans font-light tracking-wide shadow-none">
              最初のリストを作成する
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Link key={portfolio.id} href={`/dashboard/p/${portfolio.id}`}>
              <Card className="h-full hover:bg-muted/30 transition-colors border-border/50 shadow-none cursor-pointer flex flex-col justify-between group">
                <CardHeader className="pb-4">
                  <CardTitle className="font-serif font-normal text-xl group-hover:text-primary transition-colors">
                    {portfolio.title}
                  </CardTitle>
                  <CardDescription className="font-light mt-2">
                    {portfolio.place_count || 0} 件のお店
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-4 text-xs text-muted-foreground font-light border-t border-border/30 mx-6 mb-6 pb-0">
                  作成日: {new Date(portfolio.created_at).toLocaleDateString("ja-JP")}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}