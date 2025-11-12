"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { format, subMonths } from "date-fns"
import { TrendingUp, DollarSign } from "lucide-react"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function RevenueChart({ data }: { data: any[] }) {
  const formattedData = data
    .filter((item) => item.month && item.revenue != null)
    .map((item) => ({
      month: format(new Date(item.month), "MMM yyyy"),
      shortMonth: format(new Date(item.month), "MMM"),
      fullDate: new Date(item.month),
      revenue: Number.parseFloat(item.revenue) || 0,
      formatted: `$${Number.parseFloat(item.revenue || "0").toFixed(2)}`,
    }))
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

  if (formattedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] border rounded-lg bg-muted/20">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold mb-1">No revenue data available yet</p>
            <p className="text-sm text-muted-foreground">Revenue will appear here once users pay their invoices</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = [...formattedData]

  // If we have less than 3 data points, add empty months before and after for context
  if (formattedData.length < 3) {
    const firstDate = formattedData[0].fullDate
    const lastDate = formattedData[formattedData.length - 1].fullDate

    // Add 2 months before
    for (let i = 2; i > 0; i--) {
      const prevMonth = subMonths(firstDate, i)
      chartData.unshift({
        month: format(prevMonth, "MMM yyyy"),
        shortMonth: format(prevMonth, "MMM"),
        fullDate: prevMonth,
        revenue: 0,
        formatted: "$0.00",
      })
    }

    // Add 2 months after
    for (let i = 1; i <= 2; i++) {
      const nextMonth = new Date(lastDate)
      nextMonth.setMonth(lastDate.getMonth() + i)
      chartData.push({
        month: format(nextMonth, "MMM yyyy"),
        shortMonth: format(nextMonth, "MMM"),
        fullDate: nextMonth,
        revenue: 0,
        formatted: "$0.00",
      })
    }
  }

  chartData.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

  const revenues = formattedData.map((d) => d.revenue)
  const maxRevenue = Math.max(...revenues)
  const totalRevenue = revenues.reduce((sum, val) => sum + val, 0)
  const avgRevenue = totalRevenue / revenues.length

  const useBarChart = formattedData.length === 1

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">
            Total: <span className="font-semibold text-foreground">${totalRevenue.toFixed(2)}</span>
          </span>
        </div>
        <div className="text-muted-foreground">
          Avg: <span className="font-semibold text-foreground">${avgRevenue.toFixed(2)}</span>
        </div>
        <div className="text-muted-foreground">
          Peak: <span className="font-semibold text-foreground">${maxRevenue.toFixed(2)}</span>
        </div>
        <div className="text-muted-foreground text-xs">
          {formattedData.length} {formattedData.length === 1 ? "month" : "months"} of data
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {useBarChart ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="shortMonth"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                domain={[0, Math.ceil(maxRevenue * 1.2)]}
              />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length && payload[0].payload.revenue > 0) {
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
                        <p className="text-sm font-semibold">{payload[0].payload.month}</p>
                        <p className="text-sm text-muted-foreground">
                          Revenue: <span className="font-bold text-foreground">{payload[0].payload.formatted}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[8, 8, 0, 0]} maxBarSize={80} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="shortMonth"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                domain={[0, Math.ceil(maxRevenue * 1.2)]}
              />
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1, strokeDasharray: "5 5" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length && payload[0].payload.revenue > 0) {
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
                        <p className="text-sm font-semibold">{payload[0].payload.month}</p>
                        <p className="text-sm text-muted-foreground">
                          Revenue: <span className="font-bold text-foreground">{payload[0].payload.formatted}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="url(#fillRevenue)"
                fillOpacity={1}
                stroke="var(--color-revenue)"
                strokeWidth={3}
                dot={(props: any) => {
                  // Only show dots for actual data points (non-zero revenue)
                  if (props.payload.revenue > 0) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={5}
                        fill="var(--color-revenue)"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                      />
                    )
                  }
                  return null
                }}
                activeDot={{
                  fill: "var(--color-revenue)",
                  strokeWidth: 2,
                  r: 7,
                  stroke: "hsl(var(--background))",
                }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
