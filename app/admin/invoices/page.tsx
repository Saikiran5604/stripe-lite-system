import { getAllInvoices } from "@/app/actions/invoices"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { InvoiceActions } from "@/components/invoice-actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default async function AdminInvoicesPage() {
  const result = await getAllInvoices()
  const invoices = result.invoices || []

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    paid: "default",
    pending: "secondary",
    failed: "destructive",
    refunded: "outline",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">View and manage all invoices</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>
              {invoices.length} total invoice{invoices.length !== 1 && "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.user_name}</div>
                            <div className="text-sm text-muted-foreground">{invoice.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{invoice.plan_name}</TableCell>
                        <TableCell className="font-semibold">${Number.parseFloat(invoice.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[invoice.status]}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(invoice.due_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon-sm" asChild>
                              <Link href={`/admin/invoices/${invoice.id}`}>
                                <Eye className="size-4" />
                              </Link>
                            </Button>
                            <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No invoices found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
