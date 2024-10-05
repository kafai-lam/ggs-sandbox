import { initTRPC, TRPCError } from "@trpc/server"
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express"
import { ZodError } from "zod"

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const session = req.session
  const user: { id: number; email: string } | undefined = session?.user
  return { req, res, user }
}

type Context = Awaited<ReturnType<typeof createContext>>

export const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    }
  },
})

export const router = t.router

export const publicProcedure = t.procedure

export const privateProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return opts.next({
    ctx: {
      user: ctx.user,
    },
  })
})
