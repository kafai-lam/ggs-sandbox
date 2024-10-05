import { authRouter } from "./authRouter"
import { companiesRouter } from "./companyRouter"
import { customersRouter } from "./customerRouter"
import { router } from "./trpc"

export { createContext } from "./trpc"

export const appRouter = router({
  auth: authRouter,
  customers: customersRouter,
  companies: companiesRouter,
})

export type AppRouter = typeof appRouter
