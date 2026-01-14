/**
 * Database helper functions using Supabase
 * Replaces Drizzle ORM queries with Supabase client
 */

import { createClient } from './server';
import { createServiceRoleClient } from './server';

/**
 * Get authenticated Supabase client for database operations
 */
export async function getDb() {
  return await createClient();
}

/**
 * Get service role client for admin operations (bypasses RLS)
 */
export function getAdminDb() {
  return createServiceRoleClient();
}
