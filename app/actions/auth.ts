"use server"

import { sql } from "@/lib/db"
import { hashPassword, verifyPassword, createToken, setAuthCookie, clearAuthCookie } from "@/lib/auth"
import { redirect } from 'next/navigation'
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  adminSecretKey: z.string().optional().nullable().transform(val => val || undefined),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key)
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

export async function signup(formData: FormData) {
  try {
    console.log("[v0] Starting signup process")
    
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      adminSecretKey: formData.get("adminSecretKey"),
    }
    
    console.log("[v0] Raw form data:", data)

    const validationResult = signupSchema.safeParse(data)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      console.log("[v0] Validation failed:", firstError)
      return { error: firstError.message }
    }
    
    const validated = validationResult.data
    console.log("[v0] Validation passed for email:", validated.email)

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

    console.log("[v0] Creating user with role:", userRole)

    let result
    try {
      result = await sql`
        INSERT INTO users (email, password_hash, name, role)
        VALUES (${validated.email}, ${passwordHash}, ${validated.name}, ${userRole})
        RETURNING id, email, name, role
      `
    } catch (error: any) {
      if (error.message?.includes('column "role" of relation "users" does not exist')) {
        console.log("[v0] Role column doesn't exist, inserting without it")
        result = await sql`
          INSERT INTO users (email, password_hash, name)
          VALUES (${validated.email}, ${passwordHash}, ${validated.name})
          RETURNING id, email, name
        `
        result[0].role = 'user'
      } else {
        throw error
      }
    }

    const user = result[0]

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    })

    await setAuthCookie(token)

    console.log("[v0] User created successfully:", user.email)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("[v0] Signup error:", error)
    const errorMessage = (error as any)?.message || ""
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch failed")) {
      return { error: "Database connection failed. Please check your database configuration." }
    }
    if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
      return { error: "Database not set up. Please visit /setup to initialize the database." }
    }
    return { error: "Failed to create account: " + errorMessage }
  }
}

export async function login(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    }
    
    console.log("[v0] Raw login data:", rawData)
    
    const data = {
      email: rawData.email ? String(rawData.email).trim() : "",
      password: rawData.password ? String(rawData.password).trim() : "",
    }

    console.log("[v0] Login attempt for email:", data.email)

    const validationResult = loginSchema.safeParse(data)
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      console.log("[v0] Login validation failed:", firstError)
      return { error: firstError.message }
    }
    
    const validated = validationResult.data

    let result
    try {
      result = await sql`
        SELECT id, email, name, password_hash, role
        FROM users 
        WHERE email = ${validated.email}
      `
    } catch (error: any) {
      if (error.message?.includes('column "role"')) {
        result = await sql`
          SELECT id, email, name, password_hash
          FROM users 
          WHERE email = ${validated.email}
        `
        if (result.length > 0) {
          result[0].role = 'user'
        }
      } else {
        throw error
      }
    }

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
      role: user.role || 'user',
    })

    await setAuthCookie(token)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("[v0] Login error:", error)
    const errorMessage = (error as any)?.message || ""
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch failed")) {
      return { error: "Database connection failed. Please check your database configuration." }
    }
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
