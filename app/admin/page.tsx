import { getRevenueMetrics, getMonthlyRevenueChart } from "@/app/actions/invoices"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Clock, Users } from "lucide-react"
import { RevenueChart } from "@/components/revenue-chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const metrics = await getRevenueMetrics()
  const chartData = await getMonthlyRevenueChart()

  const stats = [
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toFixed(2)}`,
      description: "All-time revenue from paid invoices",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics.monthlyRevenue.toFixed(2)}`,
      description: "Revenue this month",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Pending Revenue",
      value: `$${metrics.pendingRevenue.toFixed(2)}`,
      description: "Outstanding invoices",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Active Subscriptions",
      value: metrics.activeSubscriptions,
      description: "Currently active customers",
      icon: Users,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your subscription revenue and metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`size-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={chartData.data || []} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Manage Plans</CardTitle>
              <CardDescription>Create and edit subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/plans">Go to Plans</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Subscriptions</CardTitle>
              <CardDescription>Manage all user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/subscriptions">Go to Subscriptions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>View Invoices</CardTitle>
              <CardDescription>Manage invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/invoices">Go to Invoices</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
