"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Database, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "setting-up" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSetup = async () => {
    setStatus("setting-up")
    setMessage("")

    try {
      const response = await fetch("/api/setup-db", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Database setup completed! All tables created and sample plans added.")
      } else {
        setStatus("error")
        setMessage(data.error || "Setup failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Setup failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Database Setup Required</CardTitle>
          <CardDescription>First-time setup for Stripe Lite</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Click the button below to initialize the database with all required tables and sample subscription
                plans. This only needs to be done once.
              </p>
              <Button onClick={handleSetup} className="w-full" size="lg">
                <Database className="mr-2 h-4 w-4" />
                Setup Database
              </Button>
            </>
          )}

          {status === "setting-up" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Setting up database...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
              </div>
              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/signup">Create an Account</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
              </div>
              <Button onClick={handleSetup} variant="outline" className="w-full bg-transparent">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
