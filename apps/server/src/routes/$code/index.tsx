import {
  createFileRoute,
  notFound,
  redirect,
  rootRouteId,
} from '@tanstack/react-router'
import { env } from '@/env'
import { db } from '@/db'
import { createServerFn } from '@tanstack/react-start'

import { eq } from 'drizzle-orm'
import { urls } from '@repo/db/schema'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(1),
})
export const fetchData = createServerFn({ method: 'GET' })
  .inputValidator((data: string) => {
    return schema.parse({ code: data })
  })
  .handler(async ({ data }) => {
    const result = await db
      .select()
      .from(urls)
      .where(eq(urls.urlShort, data.code))
      .limit(1)
      .get()
    return result
  })
export const Route = createFileRoute('/$code/')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const result = await db
          .select()
          .from(urls)
          .where(eq(urls.urlShort, params.code))
          .limit(1)
          .get()
        if (result) {
          return redirect({
            href: result?.urlFull,
            statusCode: 307,
          })
        } else {
          // return redirect({
          //   href: `${env.VITE_LONG_URL}/link-removed`,
          //   statusCode: 307,
          // })
        }
      },
    },
  },
})
