import { z } from "zod"
import { login, register } from "../services/authService"
import { publicProcedure, router } from "./trpc"

export const SignUpRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const SignUpResponseSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
})

export const LoginRequestSchema = SignUpRequestSchema

export const LoginResponseSchema = SignUpResponseSchema

export const authRouter = router({
  register: publicProcedure
    .input(LoginRequestSchema)
    .output(SignUpResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await register({ ...input })
      const session = ctx.req.session
      if (session) session.user = { id: user.id, email: user.email }
      return { id: user.id, email: user.email }
    }),
  login: publicProcedure
    .input(LoginRequestSchema)
    .output(LoginResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await login({ ...input })
      const session = ctx.req.session
      if (session) session.user = { id: user.id, email: user.email }
      return { id: user.id, email: user.email }
    }),
  me: publicProcedure.query(({ ctx }) => {
    const user = ctx.user
    return {
      id: user?.id,
      email: user?.email,
      isLoggedIn: !!ctx.user,
    }
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.req.session = null
  }),
})
