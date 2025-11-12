"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Receipt, Users, Package } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Plans",
    href: "/admin/plans",
    icon: Package,
  },
  {
    title: "Subscriptions",
    href: "/admin/subscriptions",
    icon: Users,
  },
  {
    title: "Invoices",
    href: "/admin/invoices",
    icon: Receipt,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
