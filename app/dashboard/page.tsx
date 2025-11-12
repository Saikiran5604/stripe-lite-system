import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserSubscriptions } from "@/app/actions/subscriptions"
import { getUserInvoices } from "@/app/actions/invoices"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Package, Receipt } from "lucide-react"
import Link from "next/link"
import { UserSubscriptionActions } from "@/components/user-subscription-actions"
import { PayInvoiceButton } from "@/components/pay-invoice-button"

export default async function DashboardPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  const subscriptionsResult = await getUserSubscriptions()
  const invoicesResult = await getUserInvoices()

  const subscriptions = subscriptionsResult.subscriptions || []
  const invoices = invoicesResult.invoices || []

  const currentSubscriptions = subscriptions.filter((sub: any) => sub.status === "active" || sub.status === "paused")

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    paused: "secondary",
    canceled: "destructive",
    past_due: "destructive",
    expired: "destructive",
    paid: "default",
    pending: "secondary",
    failed: "destructive",
    refunded: "outline",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and billing</p>
        </div>

        {currentSubscriptions.length > 0 ? (
          <div className="space-y-6 mb-8">
            {currentSubscriptions.map((subscription: any) => (
              <Card key={subscription.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{subscription.status === "active" ? "Current" : "Paused"} Subscription</CardTitle>
                      <CardDescription className="mt-1">
                        {subscription.status === "active"
                          ? "Your active plan and billing information"
                          : "This subscription is currently paused"}
                      </CardDescription>
                    </div>
                    <Badge variant={statusColors[subscription.status]}>{subscription.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Plan</div>
                      <div className="text-xl font-bold">{subscription.plan_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Price</div>
                      <div className="text-xl font-bold">
                        ${Number.parseFloat(subscription.plan_price).toFixed(2)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{subscription.billing_cycle === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Next Billing</div>
                      <div className="text-xl font-bold">
                        {subscription.next_billing_date
                          ? format(new Date(subscription.next_billing_date), "MMM dd, yyyy")
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {subscription.features && (
                    <div className="mt-6">
                      <div className="text-sm font-semibold mb-3">Plan Features</div>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {subscription.features.features?.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-3">
                  <UserSubscriptionActions subscriptionId={subscription.id} status={subscription.status} />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
              <CardDescription>You don't have an active subscription yet</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Choose a plan to get started with our services</p>
              <Button asChild>
                <Link href="/plans">
                  <Package className="size-4" />
                  Browse Plans
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your billing history and payments</CardDescription>
              </div>
              <Receipt className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.slice(0, 5).map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.plan_name}</TableCell>
                        <TableCell className="font-semibold">${Number.parseFloat(invoice.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[invoice.status]}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(invoice.created_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {invoice.status === "pending" && (
                            <PayInvoiceButton invoiceId={invoice.id} amount={Number.parseFloat(invoice.amount)} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="size-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No invoices yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
