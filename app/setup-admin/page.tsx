"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function SetupAdminPage() {
  const [email, setEmail] = useState("123456@gmail.com")
  const [password, setPassword] = useState("123456")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleMakeAdmin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/make-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, message: data.error || "Failed to update user" })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Setup Admin User</CardTitle>
          <CardDescription>Update an existing user to have admin access and set a new password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <Button onClick={handleMakeAdmin} disabled={loading || !email || !password} className="w-full">
            {loading ? "Updating..." : "Make Admin & Update Password"}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {result?.success && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-sm text-muted-foreground">You can now log in with:</p>
              <div className="bg-muted p-3 rounded-md text-sm font-mono">
                <div>Email: {email}</div>
                <div>Password: {password}</div>
              </div>
              <Button asChild variant="outline" className="w-full mt-2 bg-transparent">
                <a href="/login">Go to Login</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
