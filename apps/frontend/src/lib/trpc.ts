// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from "@ggs-sandbox/backend"
import { createTRPCReact } from "@trpc/react-query"

export const trpc = createTRPCReact<AppRouter>()
