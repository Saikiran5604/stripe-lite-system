import { getPlanById } from "@/app/actions/plans"
import { PlanForm } from "@/components/plan-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const plan = await getPlanById(id)

  if (!plan) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-2xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/admin/plans">
            <ArrowLeft className="size-4" />
            Back to Plans
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Plan</h1>
          <p className="text-muted-foreground mt-1">Update the subscription plan details</p>
        </div>

        <PlanForm plan={plan} />
      </div>
    </div>
  )
}
