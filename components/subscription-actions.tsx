"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pause, Play, XCircle } from "lucide-react"
import { cancelSubscription, pauseSubscription, resumeSubscription } from "@/app/actions/subscriptions"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

export function SubscriptionActions({
  subscriptionId,
  status,
}: {
  subscriptionId: string
  status: string
}) {
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
      toast.success("Subscription canceled")
    } else if (cancelState?.error) {
      toast.error(cancelState.error)
    }
  }, [cancelState])

  useEffect(() => {
    if (pauseState?.success) {
      toast.success("Subscription paused")
    } else if (pauseState?.error) {
      toast.error(pauseState.error)
    }
  }, [pauseState])

  useEffect(() => {
    if (resumeState?.success) {
      toast.success("Subscription resumed")
    } else if (resumeState?.error) {
      toast.error(resumeState.error)
    }
  }, [resumeState])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status === "active" && (
          <>
            <form action={pauseAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full" disabled={isPausing}>
                  <Pause className="size-4" />
                  Pause
                </button>
              </DropdownMenuItem>
            </form>
            <form action={cancelAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full" disabled={isCanceling}>
                  <XCircle className="size-4" />
                  Cancel
                </button>
              </DropdownMenuItem>
            </form>
          </>
        )}
        {status === "paused" && (
          <form action={resumeAction}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full" disabled={isResuming}>
                <Play className="size-4" />
                Resume
              </button>
            </DropdownMenuItem>
          </form>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
