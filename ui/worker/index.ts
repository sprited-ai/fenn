import { Hono } from 'hono'
import type { JSONObject } from 'hono/utils/types'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.text(`Fenn: Hello! I'm healthy and ready to serve your requests.`)
})
