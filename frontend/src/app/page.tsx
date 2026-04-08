import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-8 md:px-12 md:py-12 flex justify-between items-center">
        <h1 className="font-serif text-xl md:text-2xl tracking-widest font-light">
          たくらむ
        </h1>
        <nav>
          {/* For now, just a direct link to dashboard. In the future, this will be Clerk's SignIn/SignUp */}
          <Link href="/dashboard">
            <Button variant="ghost" className="font-sans text-sm tracking-wide">
              ログイン
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto w-full">
        <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight font-light mb-8 text-balance">
          ひとつの記憶が、
          <br className="md:hidden" />
          次の「たくらみ」へ。
        </h2>
        <p className="font-sans text-muted-foreground text-sm md:text-base lg:text-lg mb-12 max-w-2xl font-light leading-relaxed">
          誰かの熱量ある体験は、誰かの心を動かし、新しい物語の始まりになります。
          <br className="hidden md:inline" />
          あなたの声で紡がれた記憶が、洗練された一つの作品となり、
          <br className="hidden md:inline" />
          また別の誰かの「たくらみ」へと繋がっていく場所です。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-full px-8 font-sans tracking-wide">
              たくらみをはじめる
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 md:px-12 md:py-12 text-center md:text-left text-xs text-muted-foreground font-light">
        <p>&copy; {new Date().getFullYear()} たくらむ</p>
      </footer>
    </div>
  );
}