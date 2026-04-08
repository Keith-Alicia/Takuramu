import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="px-6 py-6 md:px-12 flex justify-between items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
          <h1 className="font-serif text-lg tracking-widest font-light">
            PORTFOLIO
          </h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Link href="/" className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="font-sans font-light">ログアウト</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Link href="/" className="flex items-center">
              <LogOut className="w-4 h-4" />
            </Link>
          </Button>
        </nav>
      </header>

      {/* Dashboard Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:px-12">
        {children}
      </main>
    </div>
  );
}