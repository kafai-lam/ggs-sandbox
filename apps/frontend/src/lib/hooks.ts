import { trpc } from "./trpc"

export function useMe() {
  const meQuery = trpc.auth.me.useQuery()
  return meQuery.data
}
