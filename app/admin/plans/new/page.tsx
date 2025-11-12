import { PlanForm } from "@/components/plan-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewPlanPage() {
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
          <h1 className="text-3xl font-bold">Create New Plan</h1>
          <p className="text-muted-foreground mt-1">Add a new subscription plan for your customers</p>
        </div>

        <PlanForm />
      </div>
    </div>
  )
}
