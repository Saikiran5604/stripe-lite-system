"use client"

import { Button } from "@/components/ui/button"
import { createSubscription } from "@/app/actions/subscriptions"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

export function SubscribePlanButton({
  planId,
  userId,
}: {
  planId: string
  userId: string
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [state, formAction, isPending] = useActionState(async () => {
    const result = await createSubscription(userId, planId)
    if (result.success) {
      toast({
        title: "Success",
        description: "Subscription created successfully!",
      })
      router.push("/dashboard")
    }
    return result
  }, null)

  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, toast])

  return (
    <form action={formAction} className="w-full">
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner className="size-4" />
            Subscribing...
          </>
        ) : (
          "Subscribe"
        )}
      </Button>
    </form>
  )
}
