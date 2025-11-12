import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

const publicRoutes = ["/login", "/signup", "/setup"]
const protectedRoutes = ["/dashboard", "/plans"]
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  const token = request.cookies.get("auth_token")?.value

  if (isAdminRoute) {
    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    const user = await verifyToken(token)
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // If logged in and accessing public route, redirect to dashboard
  if (isPublicRoute && token) {
    const user = await verifyToken(token)
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/plans/:path*", "/login", "/signup", "/setup"],
}
