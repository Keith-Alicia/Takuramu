import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await ensureSupabaseUser();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="px-6 py-6 md:px-12 flex justify-between items-center border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
          <h1 className="font-serif text-lg tracking-widest font-light">
            たくらむ
          </h1>
        </Link>
        <nav className="flex items-center gap-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-full"
              }
            }}
          />
        </nav>
      </header>

      {/* Dashboard Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:px-12">
        {children}
      </main>
    </div>
  );
}