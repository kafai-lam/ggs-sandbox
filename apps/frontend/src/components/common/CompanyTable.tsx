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

interface Company {
  id: number
  shopifyId: string
  name: string
}

export const columns: ColumnDef<Company>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const companyId = Number(row.getValue("id"))
      const utils = trpc.useUtils()

      const deleteMutation = trpc.companies.deleteCompany.useMutation({
        onSuccess() {
          utils.companies.getCompanyById.invalidate(companyId)
          utils.companies.findCompanies.invalidate()
        },
      })
      return (
        <div className="flex w-[100px] items-center">
          <Button variant="link" size="sm">
            <Link to={`/companies/${companyId}`}>
              <PencilLine className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => deleteMutation.mutate(companyId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

export default function CompanyTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const findCompaniesQuery = trpc.companies.findCompanies.useQuery({
    search: debouncedSearchTerm,
    skip: 0,
    take: 20,
  })
  const [date, setDate] = useState<Date | undefined>(undefined)
  const utils = trpc.useUtils()
  const pullCompanyFromShopifySince =
    trpc.companies.pullCompanyFromShopifySince.useMutation({
      onSuccess() {
        utils.companies.findCompanies.invalidate()
      },
    })

  return (
    <>
      <CardHeader className="flex flex-row items-center">
        <CardTitle>Companies</CardTitle>
        <div className="ml-auto flex space-x-2">
          <DateTimePicker
            value={date}
            onChange={setDate}
            className="w-[350px]"
            placeholder="Pull Shopify companies since last updated at"
          />
          <Button
            variant="outline"
            disabled={!date}
            onClick={() =>
              date &&
              pullCompanyFromShopifySince.mutate({ date: date?.toISOString() })
            }
          >
            Pull
          </Button>
          <Button>
            <Link to="/companies/new">New</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {findCompaniesQuery.data && (
          <DataTable data={findCompaniesQuery.data} columns={columns} />
        )}
      </CardContent>
    </>
  )
}
