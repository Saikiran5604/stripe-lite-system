"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  billing_cycle: z.enum(["monthly", "yearly"]),
  features: z.array(z.string()).optional(),
})

export async function getPlans() {
  try {
    const plans = await sql`
      SELECT * FROM subscription_plans 
      WHERE is_active = true 
      ORDER BY price ASC
    `
    return plans
  } catch (error) {
    console.error("[v0] Get plans error:", error)
    return []
  }
}

export async function getPlanById(id: string) {
  try {
    const result = await sql`
      SELECT * FROM subscription_plans WHERE id = ${id}
    `
    return result[0] || null
  } catch (error) {
    console.error("[v0] Get plan by id error:", error)
    return null
  }
}

export async function createPlan(formData: FormData) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const featuresString = formData.get("features") as string
    const features = featuresString ? featuresString.split("\n").filter((f) => f.trim()) : []

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number.parseFloat(formData.get("price") as string),
      billing_cycle: formData.get("billing_cycle") as "monthly" | "yearly",
      features,
    }

    const validated = planSchema.parse(data)

    await sql`
      INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
      VALUES (
        ${validated.name},
        ${validated.description || null},
        ${validated.price},
        ${validated.billing_cycle},
        ${JSON.stringify({ features: validated.features })}
      )
    `

    revalidatePath("/admin/plans")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("[v0] Create plan error:", error)
    return { error: "Failed to create plan" }
  }
}

export async function updatePlan(id: string, formData: FormData) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const featuresString = formData.get("features") as string
    const features = featuresString ? featuresString.split("\n").filter((f) => f.trim()) : []

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number.parseFloat(formData.get("price") as string),
      billing_cycle: formData.get("billing_cycle") as "monthly" | "yearly",
      features,
    }

    const validated = planSchema.parse(data)

    await sql`
      UPDATE subscription_plans 
      SET 
        name = ${validated.name},
        description = ${validated.description || null},
        price = ${validated.price},
        billing_cycle = ${validated.billing_cycle},
        features = ${JSON.stringify({ features: validated.features })},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    revalidatePath("/admin/plans")
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    console.error("[v0] Update plan error:", error)
    return { error: "Failed to update plan" }
  }
}

export async function togglePlanStatus(id: string, isActive: boolean) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    await sql`
      UPDATE subscription_plans 
      SET is_active = ${isActive}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    revalidatePath("/admin/plans")
    return { success: true }
  } catch (error) {
    console.error("[v0] Toggle plan status error:", error)
    return { error: "Failed to toggle plan status" }
  }
}

export async function deletePlan(id: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await sql`
      SELECT COUNT(*) as count 
      FROM user_subscriptions 
      WHERE plan_id = ${id} AND status = 'active'
    `

    if (Number.parseInt(activeSubscriptions[0].count) > 0) {
      return { error: "Cannot delete plan with active subscriptions" }
    }

    await sql`DELETE FROM subscription_plans WHERE id = ${id}`

    revalidatePath("/admin/plans")
    return { success: true }
  } catch (error) {
    console.error("[v0] Delete plan error:", error)
    return { error: "Failed to delete plan" }
  }
}
