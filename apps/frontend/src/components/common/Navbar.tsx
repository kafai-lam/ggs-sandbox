import { trpc } from "@/lib/trpc"
import { Building2, Users } from "lucide-react"
import { Link } from "react-router-dom"

export default function Navbar() {
  const meQuery = trpc.auth.me.useQuery()
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link className="flex items-center space-x-2" to="/">
            <span className="font-bold text-xl">GGS</span>
          </Link>
          {meQuery.data?.isLoggedIn && (
            <>
              <Link className="flex items-center" to="/customers">
                <Users className="mr-2 h-4 w-4" />
                Customers
              </Link>
              <Link className="flex items-center" to="/companies">
                <Building2 className="mr-2 h-4 w-4" />
                Companies
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
