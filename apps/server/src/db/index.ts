import { createDb } from '@repo/db'
import type { D1Database } from '@cloudflare/workers-types'
import { env } from 'cloudflare:workers'

export function getDb(env: D1Database) {
  return createDb(env)
}

export const db = getDb(env.DB)
