"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getUserSubscriptions(userId?: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const targetUserId = userId || user.id

    const subscriptions = await sql`
      SELECT 
        us.*,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.billing_cycle,
        sp.features
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ${targetUserId}
      ORDER BY us.created_at DESC
    `

    return { subscriptions }
  } catch (error) {
    console.error("[v0] Get user subscriptions error:", error)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return { error: "Database connection failed. Please check your database configuration." }
    }
    return { error: "Failed to fetch subscriptions" }
  }
}

export async function getAllSubscriptions() {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const subscriptions = await sql`
      SELECT 
        us.*,
        u.email as user_email,
        u.name as user_name,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.billing_cycle
      FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      JOIN subscription_plans sp ON us.plan_id = sp.id
      ORDER BY us.created_at DESC
    `

    return { subscriptions }
  } catch (error) {
    console.error("[v0] Get all subscriptions error:", error)
    return { error: "Failed to fetch subscriptions" }
  }
}

export async function createSubscription(userId: string, planId: string) {
  try {
    console.log("[v0] Starting subscription creation", { userId, planId })

    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const existing = await sql`
      SELECT id FROM user_subscriptions 
      WHERE user_id = ${userId} AND plan_id = ${planId} AND status = 'active'
    `

    if (existing.length > 0) {
      return { error: "You already have an active subscription to this plan" }
    }

    // Get plan details
    const plan = await sql`
      SELECT * FROM subscription_plans WHERE id = ${planId}
    `

    if (plan.length === 0) {
      return { error: "Plan not found" }
    }

    const startDate = new Date()
    const nextBillingDate = new Date(startDate)

    if (plan[0].billing_cycle === "monthly") {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
    }

    console.log("[v0] Creating subscription record")

    // Create subscription
    const subscription = await sql`
      INSERT INTO user_subscriptions (
        user_id, 
        plan_id, 
        status, 
        start_date, 
        next_billing_date
      )
      VALUES (
        ${userId},
        ${planId},
        'active',
        ${startDate.toISOString()},
        ${nextBillingDate.toISOString()}
      )
      RETURNING *
    `

    console.log("[v0] Subscription created", subscription[0].id)

    await sql`
      INSERT INTO subscription_history (
        subscription_id,
        action,
        new_status,
        notes
      )
      VALUES (
        ${subscription[0].id},
        'created',
        'active',
        ${JSON.stringify({ plan_id: planId, user_id: userId })}
      )
    `

    console.log("[v0] Creating invoice")

    // Create first invoice
    await createInvoiceForSubscription(subscription[0].id, userId, plan[0])

    console.log("[v0] Subscription process complete")

    revalidatePath("/dashboard")
    revalidatePath("/admin/subscriptions")
    revalidatePath("/plans")
    return { success: true, subscription: subscription[0] }
  } catch (error) {
    console.error("[v0] Create subscription error:", error)
    return { error: error instanceof Error ? error.message : "Failed to create subscription" }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Get subscription
    const subscription = await sql`
      SELECT * FROM user_subscriptions WHERE id = ${subscriptionId}
    `

    if (subscription.length === 0) {
      return { error: "Subscription not found" }
    }

    await sql`
      UPDATE user_subscriptions 
      SET status = 'canceled', end_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${subscriptionId}
    `

    await sql`
      INSERT INTO subscription_history (
        subscription_id,
        action,
        previous_status,
        new_status,
        changed_by
      )
      VALUES (
        ${subscriptionId},
        'canceled',
        ${subscription[0].status},
        'canceled',
        ${user.id}
      )
    `

    revalidatePath("/dashboard")
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (error) {
    console.error("[v0] Cancel subscription error:", error)
    return { error: "Failed to cancel subscription" }
  }
}

export async function pauseSubscription(subscriptionId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const subscription = await sql`
      SELECT * FROM user_subscriptions WHERE id = ${subscriptionId}
    `

    if (subscription.length === 0) {
      return { error: "Subscription not found" }
    }

    await sql`
      UPDATE user_subscriptions 
      SET status = 'paused', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${subscriptionId}
    `

    await sql`
      INSERT INTO subscription_history (
        subscription_id,
        action,
        previous_status,
        new_status,
        changed_by
      )
      VALUES (
        ${subscriptionId},
        'paused',
        ${subscription[0].status},
        'paused',
        ${user.id}
      )
    `

    revalidatePath("/dashboard")
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (error) {
    console.error("[v0] Pause subscription error:", error)
    return { error: "Failed to pause subscription" }
  }
}

export async function resumeSubscription(subscriptionId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const subscription = await sql`
      SELECT * FROM user_subscriptions WHERE id = ${subscriptionId}
    `

    if (subscription.length === 0) {
      return { error: "Subscription not found" }
    }

    await sql`
      UPDATE user_subscriptions 
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${subscriptionId}
    `

    await sql`
      INSERT INTO subscription_history (
        subscription_id,
        action,
        previous_status,
        new_status,
        changed_by
      )
      VALUES (
        ${subscriptionId},
        'resumed',
        ${subscription[0].status},
        'active',
        ${user.id}
      )
    `

    revalidatePath("/dashboard")
    revalidatePath("/admin/subscriptions")
    return { success: true }
  } catch (error) {
    console.error("[v0] Resume subscription error:", error)
    return { error: "Failed to resume subscription" }
  }
}

async function createInvoiceForSubscription(subscriptionId: string, userId: string, plan: any) {
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7)

  const amount = Number.parseFloat(plan.price)

  await sql`
    INSERT INTO invoices (
      subscription_id,
      user_id,
      amount,
      status,
      invoice_number,
      due_date
    )
    VALUES (
      ${subscriptionId},
      ${userId},
      ${amount},
      'pending',
      ${invoiceNumber},
      ${dueDate.toISOString()}
    )
  `
}

export async function getSubscriptionHistory(subscriptionId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const history = await sql`
      SELECT * FROM subscription_history 
      WHERE subscription_id = ${subscriptionId}
      ORDER BY created_at DESC
    `

    return { history }
  } catch (error) {
    console.error("[v0] Get subscription history error:", error)
    return { error: "Failed to fetch history" }
  }
}
