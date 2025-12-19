import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, ArrowRight } from "lucide-react"
import Link from "next/link"
import { verifyAuth } from "@/lib/auth"

export default async function HomePage() {
  let user = null
  let isAdmin = false

  try {
    user = await verifyAuth()
    isAdmin = user?.role === "admin"
  } catch (error) {}

  if (user) {
    const dashboardUrl = isAdmin ? "/admin" : "/dashboard"
    const dashboardLabel = isAdmin ? "Admin Dashboard" : "User Dashboard"

    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-black">Welcome Back!</CardTitle>
            <CardDescription className="text-gray-600">Logged in as {user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href={dashboardUrl}>
                Go to {dashboardLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show login/signup options for guests
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-black">Welcome to Stripe Lite</CardTitle>
          <CardDescription className="text-gray-600">Subscription and billing management system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 text-center mb-4">
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
