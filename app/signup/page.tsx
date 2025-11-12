"use client"

import { signup } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, Shield } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [showAdminKey, setShowAdminKey] = useState(false)

  const [state, formAction, isPending] = useActionState(async (_prevState: any, formData: FormData) => {
    const result = await signup(formData)
    if (result.success) {
      router.push("/dashboard")
    }
    return result
  }, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Get started with your subscription today</CardDescription>
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" />
            </div>
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
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAdminKey(!showAdminKey)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="h-4 w-4" />
                {showAdminKey ? "Hide" : "Have an"} admin access key?
              </button>

              {showAdminKey && (
                <div className="space-y-2 mt-3">
                  <Label htmlFor="adminSecretKey" className="text-sm">
                    Admin Secret Key
                  </Label>
                  <Input
                    id="adminSecretKey"
                    name="adminSecretKey"
                    type="password"
                    placeholder="Enter admin secret key"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    If you have an admin secret key, enter it here to get admin privileges
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
