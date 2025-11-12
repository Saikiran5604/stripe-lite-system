"use client"

import { Button } from "@/components/ui/button"
import { deletePlan } from "@/app/actions/plans"
import { Trash2 } from "lucide-react"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function PlanActions({
  planId,
  isActive,
}: {
  planId: string
  isActive: boolean
}) {
  const [deleteState, deleteAction, isDeleting] = useActionState(async () => {
    const result = await deletePlan(planId)
    return result
  }, null)

  useEffect(() => {
    if (deleteState?.success) {
      toast.success("Plan deleted successfully")
    } else if (deleteState?.error) {
      toast.error(deleteState.error)
    }
  }, [deleteState])

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="size-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this plan? This action cannot be undone. Plans with active subscriptions
            cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteAction}>
            <AlertDialogAction type="submit" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
