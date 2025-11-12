import { getPlans } from "@/app/actions/plans"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, LayoutDashboard, LogOut } from "lucide-react"
import { redirect } from "next/navigation"
import { SubscribePlanButton } from "@/components/subscribe-plan-button"
import Link from "next/link"
import { logout } from "@/app/actions/auth"

export default async function PlansPage() {
  const user = await getSession()
  if (!user) {
    redirect("/login")
  }

  const plans = await getPlans()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="size-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h2 className="text-xl font-bold">Stripe-Lite</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Dashboard
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
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">Select the perfect plan for your needs</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: any) => {
            const isPopular = plan.name.toLowerCase().includes("pro")
            return (
              <Card key={plan.id} className={`flex flex-col ${isPopular ? "border-primary shadow-lg" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {isPopular && <Badge>Popular</Badge>}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${Number.parseFloat(plan.price).toFixed(0)}</span>
                      <span className="text-muted-foreground">
                        /{plan.billing_cycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                  </div>
                  {plan.features && (
                    <ul className="space-y-3">
                      {plan.features.features?.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="size-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter>
                  <SubscribePlanButton planId={plan.id} userId={user.id} />
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
