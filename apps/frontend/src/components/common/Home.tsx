import { Button } from "@/components/ui/Button"
import { CardHeader, CardTitle } from "@/components/ui/Card"
import { trpc } from "@/lib/trpc"
import { Link } from "react-router-dom"

const Header = () => (
  <CardHeader>
    <CardTitle>GGS Sandbox Dashboard</CardTitle>
  </CardHeader>
)

export default function Home() {
  const meQuery = trpc.auth.me.useQuery()
  const utils = trpc.useUtils()
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess() {
      utils.auth.me.invalidate()
    },
  })
  if (meQuery.data?.isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-2 space-y-4">
        <Header />
        <div>You are logged in with email {meQuery.data.email}</div>
        <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
          Log Out
        </Button>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-2 space-y-4">
      <Header />
      <div className="flex items-center space-x-4">
        <Button variant="secondary">
          <Link to="/register">Register</Link>
        </Button>
        <Button variant="default">
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </div>
  )
}
