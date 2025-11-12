import { getInvoiceById } from "@/app/actions/invoices"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { notFound } from "next/navigation"

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getInvoiceById(id)

  if (result.error || !result.invoice) {
    notFound()
  }

  const invoice = result.invoice

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    paid: "default",
    pending: "secondary",
    failed: "destructive",
    refunded: "outline",
  }

  const subtotal = Number.parseFloat(invoice.amount)
  const taxRate = 0.1 // 10% tax
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/admin/invoices">
            <ArrowLeft className="size-4" />
            Back to Invoices
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Invoice Details</CardTitle>
                <p className="text-muted-foreground mt-1 font-mono">{invoice.invoice_number}</p>
              </div>
              <Badge variant={statusColors[invoice.status]} className="text-base px-3 py-1">
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{invoice.user_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{invoice.user_email}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Invoice Dates</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">{format(new Date(invoice.created_at), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>
                    <p className="font-medium">{format(new Date(invoice.due_date), "MMM dd, yyyy")}</p>
                  </div>
                  {invoice.paid_date && (
                    <div>
                      <span className="text-muted-foreground">Paid:</span>
                      <p className="font-medium">{format(new Date(invoice.paid_date), "MMM dd, yyyy")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Line Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 font-medium text-sm">
                  <div>Description</div>
                  <div className="text-center">Billing Cycle</div>
                  <div className="text-right">Amount</div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4">
                  <div>{invoice.plan_name}</div>
                  <div className="text-center capitalize">{invoice.billing_cycle}</div>
                  <div className="text-right">${subtotal.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
