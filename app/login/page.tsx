"use client"

import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (_prevState: any, formData: FormData) => {
    const result = await login(formData)
    if (result.success) {
      router.push("/dashboard")
    }
    return result
  }, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {state.error}
                  {state.error.includes("Database not set up") && (
                    <Link href="/setup" className="block mt-2 underline font-medium">
                      Go to setup page →
                    </Link>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
