import type React from "react"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/actions/auth"
import { LogOut, LayoutDashboard, Package, Shield } from "lucide-react"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Stripe-Lite</h2>
                <p className="text-sm text-muted-foreground">
                  {user.email}
                  {user.role === "admin" && (
                    <span className="ml-2 inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                      Admin
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/plans">
                    <Package className="size-4" />
                    Plans
                  </Link>
                </Button>
                {user.role === "admin" && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin">
                      <Shield className="size-4" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                <form action={logout}>
                  <Button variant="ghost" size="sm" type="submit">
                    <LogOut className="size-4" />
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </ThemeProvider>
  )
}
