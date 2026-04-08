import { NewPortfolioForm } from "@/components/features/NewPortfolioForm";

export const metadata = {
  title: "新しいポートフォリオの作成 | たくらむ",
};

export default function NewPortfolioPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-light mb-2">新しいリストを作る</h2>
        <p className="text-muted-foreground font-sans font-light text-sm">
          テーマを決めて、お気に入りのお店をまとめましょう。
        </p>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border/50 shadow-sm">
        <NewPortfolioForm />
      </div>
    </div>
  );
}
