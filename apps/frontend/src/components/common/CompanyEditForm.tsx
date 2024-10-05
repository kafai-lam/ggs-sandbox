import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { trpc } from "@/lib/trpc"
import { useEffect } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"

type Inputs = {
  name: string
}

export default function CompanyEditForm() {
  const navigate = useNavigate()
  const params = useParams<{ companyId: string }>()
  const companyId = Number(params.companyId)
  const { data: company, isSuccess } =
    trpc.companies.getCompanyById.useQuery(companyId)
  const utils = trpc.useUtils()
  const updatecompanyMutation = trpc.companies.updateCompany.useMutation({
    onSuccess() {
      utils.companies.getCompanyById.invalidate(companyId)
      utils.companies.findCompanies.invalidate()
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!companyId) return
    await updatecompanyMutation.mutateAsync({
      id: companyId,
      data,
    })
    navigate("/Companies")
  }

  useEffect(() => {
    if (isSuccess) {
      company?.name && setValue("name", company.name)
    }
  }, [isSuccess])

  return (
    company && (
      <Card className="w-full max-w-md mx-auto mt-4">
        <CardHeader>
          <CardTitle>Edit company {companyId}</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {company.shopifyId && (
              <div className="space-y-2">
                <Label>Shopify ID</Label>
                <Input id="shopifyId" disabled value={company.shopifyId} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                aria-invalid={errors.name ? "true" : "false"}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full">
              Update
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  )
}
