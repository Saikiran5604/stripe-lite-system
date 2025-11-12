import { getAllSubscriptions } from "@/app/actions/subscriptions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { SubscriptionActions } from "@/components/subscription-actions"

export default async function AdminSubscriptionsPage() {
  const result = await getAllSubscriptions()
  const subscriptions = result.subscriptions || []

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    paused: "secondary",
    canceled: "destructive",
    past_due: "destructive",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">View and manage all user subscriptions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>
              {subscriptions.length} total subscription{subscriptions.length !== 1 && "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub: any) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sub.user_name}</div>
                            <div className="text-sm text-muted-foreground">{sub.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{sub.plan_name}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[sub.status]}>{sub.status}</Badge>
                        </TableCell>
                        <TableCell>
                          ${Number.parseFloat(sub.plan_price).toFixed(2)}/
                          {sub.billing_cycle === "monthly" ? "mo" : "yr"}
                        </TableCell>
                        <TableCell>
                          {sub.next_billing_date ? format(new Date(sub.next_billing_date), "MMM dd, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <SubscriptionActions subscriptionId={sub.id} status={sub.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No subscriptions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
