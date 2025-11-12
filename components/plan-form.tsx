"use client"

import { createPlan, updatePlan } from "@/app/actions/plans"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

interface PlanFormProps {
  plan?: any
}

export function PlanForm({ plan }: PlanFormProps) {
  const router = useRouter()
  const isEditing = !!plan

  const [state, formAction, isPending] = useActionState(async (_prevState: any, formData: FormData) => {
    const result = isEditing ? await updatePlan(plan.id, formData) : await createPlan(formData)

    if (result.success) {
      toast.success(isEditing ? "Plan updated successfully" : "Plan created successfully")
      router.push("/admin/plans")
    }
    return result
  }, null)

  const featuresString = plan?.features?.features ? plan.features.features.join("\n") : ""

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Plan" : "New Plan"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {state?.error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" name="name" placeholder="e.g., Pro" required defaultValue={plan?.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of the plan"
              rows={3}
              defaultValue={plan?.description}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="29.99"
                required
                defaultValue={plan?.price}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle</Label>
              <Select name="billing_cycle" defaultValue={plan?.billing_cycle || "monthly"} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              name="features"
              placeholder="Unlimited projects&#10;10GB storage&#10;Priority support"
              rows={6}
              defaultValue={featuresString}
            />
            <p className="text-sm text-muted-foreground">Enter each feature on a new line</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/plans")} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Spinner className="size-4" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Plan"
            ) : (
              "Create Plan"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
