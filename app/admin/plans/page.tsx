import { getPlans } from "@/app/actions/plans"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { PlanActions } from "@/components/plan-actions"

export default async function AdminPlansPage() {
  const plans = await getPlans()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground mt-1">Manage your subscription plans and pricing</p>
          </div>
          <Button asChild>
            <Link href="/admin/plans/new">
              <Plus className="size-4" />
              Add Plan
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: any) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  <Badge variant={plan.is_active ? "default" : "secondary"}>
                    {plan.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-4">
                  <div className="text-3xl font-bold">${Number.parseFloat(plan.price).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    per {plan.billing_cycle === "monthly" ? "month" : "year"}
                  </div>
                </div>
                {plan.features && (
                  <ul className="space-y-2 text-sm">
                    {plan.features.features?.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                  <Link href={`/admin/plans/${plan.id}/edit`}>
                    <Edit className="size-4" />
                    Edit
                  </Link>
                </Button>
                <PlanActions planId={plan.id} isActive={plan.is_active} />
              </CardFooter>
            </Card>
          ))}
        </div>

        {plans.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No plans found</p>
              <Button asChild>
                <Link href="/admin/plans/new">
                  <Plus className="size-4" />
                  Create your first plan
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
