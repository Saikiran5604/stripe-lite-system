import { neon } from "@neondatabase/serverless"

if (!process.env.NEON_DATABASE_URL) {
  throw new Error("NEON_DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.NEON_DATABASE_URL)

export async function sqlWithUser(userId: number) {
  return async (query: TemplateStringsArray, ...values: any[]) => {
    // Set the user context for RLS policies
    await sql`SELECT set_config('app.current_user_id', ${userId.toString()}, FALSE)`
    // Execute the actual query
    return sql(query, ...values)
  }
}

export { sql }
