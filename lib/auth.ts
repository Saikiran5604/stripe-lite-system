import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface User {
  id: string
  email: string
  name: string | null
  role?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(user: User): Promise<string> {
  return new SignJWT({ userId: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return {
      id: verified.payload.userId as string,
      email: verified.payload.email as string,
      name: null,
      role: verified.payload.role as string,
    }
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export async function verifyAuth(): Promise<User | null> {
  return getSession()
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}
