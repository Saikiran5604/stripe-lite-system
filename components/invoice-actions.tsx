"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, XCircle, RotateCcw } from "lucide-react"
import { markInvoiceAsPaid, markInvoiceAsFailed, refundInvoice } from "@/app/actions/invoices"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

export function InvoiceActions({
  invoiceId,
  status,
}: {
  invoiceId: string
  status: string
}) {
  const [paidState, paidAction, isMarkingPaid] = useActionState(async () => {
    const result = await markInvoiceAsPaid(invoiceId)
    return result
  }, null)

  const [failedState, failedAction, isMarkingFailed] = useActionState(async () => {
    const result = await markInvoiceAsFailed(invoiceId)
    return result
  }, null)

  const [refundState, refundAction, isRefunding] = useActionState(async () => {
    const result = await refundInvoice(invoiceId)
    return result
  }, null)

  useEffect(() => {
    if (paidState?.success) {
      toast.success("Invoice marked as paid")
    } else if (paidState?.error) {
      toast.error(paidState.error)
    }
  }, [paidState])

  useEffect(() => {
    if (failedState?.success) {
      toast.success("Invoice marked as failed")
    } else if (failedState?.error) {
      toast.error(failedState.error)
    }
  }, [failedState])

  useEffect(() => {
    if (refundState?.success) {
      toast.success("Invoice refunded")
    } else if (refundState?.error) {
      toast.error(refundState.error)
    }
  }, [refundState])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status === "pending" && (
          <>
            <form action={paidAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full" disabled={isMarkingPaid}>
                  <Check className="size-4" />
                  Mark as Paid
                </button>
              </DropdownMenuItem>
            </form>
            <form action={failedAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full" disabled={isMarkingFailed}>
                  <XCircle className="size-4" />
                  Mark as Failed
                </button>
              </DropdownMenuItem>
            </form>
          </>
        )}
        {status === "paid" && (
          <form action={refundAction}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full" disabled={isRefunding}>
                <RotateCcw className="size-4" />
                Refund
              </button>
            </DropdownMenuItem>
          </form>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
