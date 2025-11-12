import type React from "react"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin-nav"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { LogOut, Home } from "lucide-react"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Stripe-Lite Admin</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <Home className="size-4" />
                  User Dashboard
                </Link>
              </Button>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
