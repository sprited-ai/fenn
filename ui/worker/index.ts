import { Hono } from 'hono'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.text(`Fenn: Hello! I'm healthy and ready to serve your requests.`)
})

export default app
