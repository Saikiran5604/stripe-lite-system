"use server"

import { sql } from "@/lib/db"
import { hashPassword, verifyPassword, createToken, setAuthCookie, clearAuthCookie } from "@/lib/auth"
import { redirect } from "next/navigation"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  adminSecretKey: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function signup(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      adminSecretKey: formData.get("adminSecretKey") as string,
    }

    const validated = signupSchema.parse(data)

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${validated.email}
    `

    if (existingUser.length > 0) {
      return { error: "User already exists with this email" }
    }

    const passwordHash = await hashPassword(validated.password)

    const adminSecret = process.env.ADMIN_SECRET_KEY || "stripe-lite-admin-2024"
    const isAdminSignup = validated.adminSecretKey === adminSecret

    const userCount = await sql`SELECT COUNT(*) as count FROM users`
    const isFirstUser = Number.parseInt(userCount[0].count) === 0
    const userRole = isAdminSignup || isFirstUser ? "admin" : "user"

    const result = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${validated.email}, ${passwordHash}, ${validated.name}, ${userRole})
      RETURNING id, email, name, role
    `

    const user = result[0]

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    await setAuthCookie(token)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("[v0] Signup error:", error)
    const errorMessage = (error as any)?.message || ""
    if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
      return { error: "Database not set up. Please visit /setup to initialize the database." }
    }
    return { error: "Failed to create account" }
  }
}

export async function login(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validated = loginSchema.parse(data)

    const result = await sql`
      SELECT id, email, name, password_hash, role
      FROM users 
      WHERE email = ${validated.email}
    `

    if (result.length === 0) {
      return { error: "Invalid email or password" }
    }

    const user = result[0]

    const isValid = await verifyPassword(validated.password, user.password_hash)

    if (!isValid) {
      return { error: "Invalid email or password" }
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    await setAuthCookie(token)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("[v0] Login error:", error)
    const errorMessage = (error as any)?.message || ""
    if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
      return { error: "Database not set up. Please visit /setup to initialize the database." }
    }
    return { error: "Failed to log in" }
  }
}

export async function logout() {
  await clearAuthCookie()
  redirect("/login")
}
