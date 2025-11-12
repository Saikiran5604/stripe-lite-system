"use client"

import { Button } from "@/components/ui/button"
import { cancelSubscription, pauseSubscription, resumeSubscription } from "@/app/actions/subscriptions"
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
import { Pause, Play, XCircle } from "lucide-react"
import { useActionState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function UserSubscriptionActions({
  subscriptionId,
  status,
}: {
  subscriptionId: string
  status: string
}) {
  const { toast } = useToast()

  const [cancelState, cancelAction, isCanceling] = useActionState(async () => {
    const result = await cancelSubscription(subscriptionId)
    return result
  }, null)

  const [pauseState, pauseAction, isPausing] = useActionState(async () => {
    const result = await pauseSubscription(subscriptionId)
    return result
  }, null)

  const [resumeState, resumeAction, isResuming] = useActionState(async () => {
    const result = await resumeSubscription(subscriptionId)
    return result
  }, null)

  useEffect(() => {
    if (cancelState?.success) {
      toast({ title: "Success", description: "Subscription canceled successfully" })
    } else if (cancelState?.error) {
      toast({ title: "Error", description: cancelState.error, variant: "destructive" })
    }
  }, [cancelState, toast])

  useEffect(() => {
    if (pauseState?.success) {
      toast({ title: "Success", description: "Subscription paused successfully" })
    } else if (pauseState?.error) {
      toast({ title: "Error", description: pauseState.error, variant: "destructive" })
    }
  }, [pauseState, toast])

  useEffect(() => {
    if (resumeState?.success) {
      toast({ title: "Success", description: "Subscription resumed successfully" })
    } else if (resumeState?.error) {
      toast({ title: "Error", description: resumeState.error, variant: "destructive" })
    }
  }, [resumeState, toast])

  if (status === "paused") {
    return (
      <div className="flex gap-3">
        <form action={resumeAction}>
          <Button type="submit" disabled={isResuming}>
            <Play className="size-4" />
            {isResuming ? "Resuming..." : "Resume Subscription"}
          </Button>
        </form>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <XCircle className="size-4" />
              Cancel Subscription
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this paused subscription? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
              <form action={cancelAction}>
                <AlertDialogAction type="submit" disabled={isCanceling}>
                  {isCanceling ? "Canceling..." : "Yes, Cancel"}
                </AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  if (status === "active") {
    return (
      <div className="flex gap-3">
        <form action={pauseAction}>
          <Button type="submit" variant="outline" disabled={isPausing}>
            <Pause className="size-4" />
            {isPausing ? "Pausing..." : "Pause Subscription"}
          </Button>
        </form>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <XCircle className="size-4" />
              Cancel Subscription
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your subscription? You will lose access to all premium features at the
                end of your billing period.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
              <form action={cancelAction}>
                <AlertDialogAction type="submit" disabled={isCanceling}>
                  {isCanceling ? "Canceling..." : "Yes, Cancel"}
                </AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return null
}
