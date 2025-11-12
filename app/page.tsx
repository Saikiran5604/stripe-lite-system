import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, ArrowRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

async function checkDatabaseSetup() {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription_plans'
      ) as table_exists
    `
    return result[0]?.table_exists || false
  } catch (error) {
    return false
  }
}

export default async function HomePage() {
  const user = await verifyAuth()

  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    if (user.role === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  }

  const isSetup = await checkDatabaseSetup()

  // If database not set up, redirect to setup page
  if (!isSetup) {
    redirect("/setup")
  }

  // Database is set up, show login/signup options
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Stripe Lite</CardTitle>
          <CardDescription>Subscription and billing management system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Get started by creating an account or logging in to manage your subscriptions.
          </p>
          <Button asChild className="w-full" size="lg">
            <Link href="/signup">
              Create an Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/login">Log In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
