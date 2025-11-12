import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user to admin and set new password
    const result = await sql`
      UPDATE users 
      SET role = 'admin', password_hash = ${hashedPassword}
      WHERE email = ${email}
      RETURNING id, email, role
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} is now an admin with updated password`,
      user: result[0],
    })
  } catch (error) {
    console.error("[v0] Make admin error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
