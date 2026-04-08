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
          記憶を編んで、
          <br className="md:hidden" />
          次を企む。
        </h2>
        <div className="font-sans text-muted-foreground text-sm md:text-base lg:text-lg mb-12 max-w-2xl font-light leading-relaxed space-y-6">
          <p>
            ふと訪れた街の匂い、心動かされた瞬間の熱量。
            <br className="hidden md:inline" />
            あなたの声で残された何気ない日常の記憶は、やがて美しいひとつの物語として編み込まれます。
          </p>
          <p>
            そして、共有されたページは誰かの心を揺さぶり、
            <br className="hidden md:inline" />
            「自分もそこへ行きたい」「体験をつくりたい」という次なる企みの連鎖を生み出していく。
          </p>
          <p>
            他者の記憶を旅して、あなただけの新たな物語を紡ぎ出す場所です。
          </p>
        </div>

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