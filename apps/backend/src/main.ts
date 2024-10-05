import { createExpressMiddleware } from "@trpc/server/adapters/express"
import cookieSession from "cookie-session"
import cors from "cors"
import express from "express"
import { appRouter, createContext } from "./routers"

const host = process.env.HOST ?? "localhost"

const port = process.env.PORT ? Number(process.env.PORT) : 3333

const app = express()

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
)
app.use(
  cookieSession({
    name: "session",
    keys: ["secret"],
    maxAge: 24 * 60 * 60 * 1000,
    domain: "localhost",
  })
)

app.get("/", (req, res) => {
  res.send({ message: "Ready" })
})

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`)
})
