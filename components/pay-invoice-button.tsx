"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { payInvoice } from "@/app/actions/invoices"
import { useToast } from "@/hooks/use-toast"

interface PayInvoiceButtonProps {
  invoiceId: string
  amount: number
}

export function PayInvoiceButton({ invoiceId, amount }: PayInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    if (!confirm(`Pay $${amount.toFixed(2)}? This will process the payment immediately.`)) {
      return
    }

    setIsLoading(true)
    const result = await payInvoice(invoiceId)
    setIsLoading(false)

    if (result.error) {
      toast({
        title: "Payment Failed",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Payment Successful",
        description: "Your invoice has been paid successfully!",
      })
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} size="sm">
      <CreditCard className="size-4" />
      {isLoading ? "Processing..." : "Pay Now"}
    </Button>
  )
}
