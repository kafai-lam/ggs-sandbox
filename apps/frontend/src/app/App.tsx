import CompanyCreateForm from "@/components/common/CompanyCreateForm"
import CompanyTable from "@/components/common/CompanyTable"
import CustomerCreateForm from "@/components/common/CustomerCreateForm"
import CustomerEditForm from "@/components/common/CustomerEditForm"
import CustomerTable from "@/components/common/CustomerTable"
import Home from "@/components/common/Home"
import LoginForm from "@/components/common/LoginForm"
import Navbar from "@/components/common/Navbar"
import RegisterForm from "@/components/common/RegisterForm"
import { trpc } from "@/lib/trpc"
import { useEffect } from "react"
import { Route, Routes, useNavigate } from "react-router-dom"
import CompanyEditForm from "../components/common/CompanyEditForm"

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const me = trpc.auth.me.useQuery()
  const navigate = useNavigate()

  useEffect(() => {
    if (me.data && !me.data.isLoggedIn) {
      navigate("/")
    }
  }, [me.data, navigate])

  return children
}

export function App() {
  return (
    <div className="flex-col">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <CustomerTable />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/new"
          element={
            <PrivateRoute>
              <CustomerCreateForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:customerId"
          element={
            <PrivateRoute>
              <CustomerEditForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <PrivateRoute>
              <CompanyTable />
            </PrivateRoute>
          }
        />
        <Route
          path="/companies/new"
          element={
            <PrivateRoute>
              <CompanyCreateForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/companies/:companyId"
          element={
            <PrivateRoute>
              <CompanyEditForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
