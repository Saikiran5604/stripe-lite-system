"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function DashboardLiveRefresh() {
  const router = useRouter()

  useEffect(() => {
    const refresh = () => router.refresh()
    const interval = window.setInterval(refresh, 30_000)
    window.addEventListener("focus", refresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", refresh)
    }
  }, [router])

  return null
}
