import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.NEON_POSTGRES_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  console.warn("[v0] Warning: Database URL environment variable is not set. Database operations will fail.")
}

const sql = databaseUrl ? neon(databaseUrl) : null

export async function sqlWithUser(userId: number) {
  if (!sql) {
    throw new Error("Database connection not available")
  }
  
  return async (query: TemplateStringsArray, ...values: any[]) => {
    // Set the user context for RLS policies
    await sql`SELECT set_config('app.current_user_id', ${userId.toString()}, FALSE)`
    // Execute the actual query
    return sql(query, ...values)
  }
}

export { sql }
