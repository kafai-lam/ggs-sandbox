import { Button } from "@/components/ui/Button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { DateTimePicker } from "@/components/ui/DateTimePicker"
import { Input } from "@/components/ui/Input"
import { trpc } from "@/lib/trpc"
import { ColumnDef } from "@tanstack/react-table"
import { useDebounce } from "@uidotdev/usehooks"
import { PencilLine, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTable } from "./DateTable"

interface Customer {
  id: number
  shopifyId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  locale: string
  state: "DECLINED" | "DISABLED" | "ENABLED" | "INVITED"
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[10px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "shopifyId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shopify ID" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[400px] truncate font-medium">
            {row.getValue("shopifyId")}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("firstName")}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("lastName")}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("email")}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("phone")}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          <span>{row.getValue("state")}</span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customerId = Number(row.getValue("id"))
      const utils = trpc.useUtils()

      const deleteMutation = trpc.customers.deleteCustomer.useMutation({
        onSuccess() {
          utils.customers.getCustomerById.invalidate(customerId)
          utils.customers.findCustomers.invalidate()
        },
      })
      return (
        <div className="flex w-[100px] items-center">
          <Button variant="link" size="sm">
            <Link to={`/customers/${customerId}`}>
              <PencilLine className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => deleteMutation.mutate(customerId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

export default function CustomerTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const findCustomersQuery = trpc.customers.findCustomers.useQuery({
    search: debouncedSearchTerm,
    skip: 0,
    take: 20,
  })
  const [date, setDate] = useState<Date | undefined>(undefined)
  const utils = trpc.useUtils()
  const pullCustomerFromShopifySince =
    trpc.customers.pullCustomerFromShopifySince.useMutation({
      onSuccess() {
        utils.customers.findCustomers.invalidate()
      },
    })

  return (
    <>
      <CardHeader className="flex flex-row items-center">
        <CardTitle>Customers</CardTitle>
        <div className="ml-auto flex space-x-2">
          <DateTimePicker
            value={date}
            onChange={setDate}
            className="w-[350px]"
            placeholder="Pull Shopify customers since last updated at"
          />
          <Button
            variant="outline"
            disabled={!date}
            onClick={() =>
              date &&
              pullCustomerFromShopifySince.mutate({ date: date?.toISOString() })
            }
          >
            Pull
          </Button>
          <Button>
            <Link to="/customers/new">New</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {findCustomersQuery.data && (
          <DataTable data={findCustomersQuery.data} columns={columns} />
        )}
      </CardContent>
    </>
  )
}
