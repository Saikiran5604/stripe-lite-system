"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getUserInvoices(userId?: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const targetUserId = userId || user.id

    const invoices = await sql`
      SELECT 
        i.*,
        sp.name as plan_name,
        us.status as subscription_status
      FROM invoices i
      JOIN user_subscriptions us ON i.subscription_id = us.id
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE i.user_id = ${targetUserId}
      ORDER BY i.created_at DESC
    `

    return { invoices }
  } catch (error) {
    console.error("[v0] Get user invoices error:", error)
    return { error: "Failed to fetch invoices" }
  }
}

export async function getAllInvoices() {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const invoices = await sql`
      SELECT 
        i.*,
        u.email as user_email,
        u.name as user_name,
        sp.name as plan_name
      FROM invoices i
      JOIN users u ON i.user_id = u.id
      JOIN user_subscriptions us ON i.subscription_id = us.id
      JOIN subscription_plans sp ON us.plan_id = sp.id
      ORDER BY i.created_at DESC
    `

    return { invoices }
  } catch (error) {
    console.error("[v0] Get all invoices error:", error)
    return { error: "Failed to fetch invoices" }
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const result = await sql`
      SELECT 
        i.*,
        u.email as user_email,
        u.name as user_name,
        sp.name as plan_name,
        sp.price as plan_price,
        sp.billing_cycle
      FROM invoices i
      JOIN users u ON i.user_id = u.id
      JOIN user_subscriptions us ON i.subscription_id = us.id
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE i.id = ${invoiceId}
    `

    if (result.length === 0) {
      return { error: "Invoice not found" }
    }

    return { invoice: result[0] }
  } catch (error) {
    console.error("[v0] Get invoice by id error:", error)
    return { error: "Failed to fetch invoice" }
  }
}

export async function markInvoiceAsPaid(invoiceId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Get invoice details
    const invoice = await sql`
      SELECT * FROM invoices WHERE id = ${invoiceId}
    `

    if (invoice.length === 0) {
      return { error: "Invoice not found" }
    }

    // Update invoice status
    await sql`
      UPDATE invoices 
      SET status = 'paid', paid_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${invoiceId}
    `

    // Create payment transaction
    await sql`
      INSERT INTO payment_transactions (
        invoice_id,
        amount,
        payment_method,
        status,
        transaction_id
      )
      VALUES (
        ${invoiceId},
        ${invoice[0].amount},
        'manual',
        'success',
        ${`TXN-${Date.now()}`}
      )
    `

    revalidatePath("/admin/invoices")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Mark invoice as paid error:", error)
    return { error: "Failed to mark invoice as paid" }
  }
}

export async function markInvoiceAsFailed(invoiceId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    await sql`
      UPDATE invoices 
      SET status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${invoiceId}
    `

    revalidatePath("/admin/invoices")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Mark invoice as failed error:", error)
    return { error: "Failed to mark invoice as failed" }
  }
}

export async function refundInvoice(invoiceId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const invoice = await sql`
      SELECT * FROM invoices WHERE id = ${invoiceId}
    `

    if (invoice.length === 0) {
      return { error: "Invoice not found" }
    }

    if (invoice[0].status !== "paid") {
      return { error: "Can only refund paid invoices" }
    }

    // Update invoice status
    await sql`
      UPDATE invoices 
      SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${invoiceId}
    `

    // Create refund transaction
    await sql`
      INSERT INTO payment_transactions (
        invoice_id,
        amount,
        payment_method,
        status,
        transaction_id
      )
      VALUES (
        ${invoiceId},
        ${-invoice[0].amount},
        'refund',
        'refunded',
        ${`REFUND-${Date.now()}`}
      )
    `

    revalidatePath("/admin/invoices")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Refund invoice error:", error)
    return { error: "Failed to refund invoice" }
  }
}

export async function getRevenueMetrics() {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Total revenue (paid invoices)
    const totalRevenue = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM invoices
      WHERE status = 'paid'
    `

    // Monthly revenue
    const monthlyRevenue = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM invoices
      WHERE status = 'paid' 
        AND DATE_TRUNC('month', paid_date) = DATE_TRUNC('month', CURRENT_DATE)
    `

    // Pending revenue
    const pendingRevenue = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM invoices
      WHERE status = 'pending'
    `

    // Active subscriptions count
    const activeSubscriptions = await sql`
      SELECT COUNT(*) as count
      FROM user_subscriptions
      WHERE status = 'active'
    `

    return {
      totalRevenue: Number.parseFloat(totalRevenue[0].total),
      monthlyRevenue: Number.parseFloat(monthlyRevenue[0].total),
      pendingRevenue: Number.parseFloat(pendingRevenue[0].total),
      activeSubscriptions: Number.parseInt(activeSubscriptions[0].count),
    }
  } catch (error) {
    console.error("[v0] Get revenue metrics error:", error)
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingRevenue: 0,
      activeSubscriptions: 0,
    }
  }
}

export async function getMonthlyRevenueChart() {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    const data = await sql`
      SELECT 
        DATE_TRUNC('month', paid_date) as month,
        SUM(amount) as revenue
      FROM invoices
      WHERE status = 'paid' 
        AND paid_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', paid_date)
      ORDER BY month ASC
    `

    return { data }
  } catch (error) {
    console.error("[v0] Get monthly revenue chart error:", error)
    return { data: [] }
  }
}

export async function payInvoice(invoiceId: string) {
  try {
    const user = await getSession()
    if (!user) {
      return { error: "Unauthorized" }
    }

    // Get invoice details and verify it belongs to the user
    const invoice = await sql`
      SELECT * FROM invoices WHERE id = ${invoiceId} AND user_id = ${user.id}
    `

    if (invoice.length === 0) {
      return { error: "Invoice not found" }
    }

    if (invoice[0].status === "paid") {
      return { error: "Invoice is already paid" }
    }

    if (invoice[0].status === "refunded") {
      return { error: "Cannot pay a refunded invoice" }
    }

    // Update invoice status to paid
    await sql`
      UPDATE invoices 
      SET status = 'paid', paid_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${invoiceId}
    `

    // Create payment transaction
    await sql`
      INSERT INTO payment_transactions (
        invoice_id,
        amount,
        payment_method,
        status,
        transaction_id
      )
      VALUES (
        ${invoiceId},
        ${invoice[0].amount},
        'card',
        'success',
        ${`PAY-${Date.now()}`}
      )
    `

    revalidatePath("/dashboard")
    revalidatePath("/admin")
    revalidatePath("/admin/invoices")
    return { success: true }
  } catch (error) {
    console.error("[v0] Pay invoice error:", error)
    return { error: "Failed to process payment" }
  }
}
