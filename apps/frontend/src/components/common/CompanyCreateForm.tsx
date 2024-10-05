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
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

type Inputs = {
  name: string
}

export default function CompanyCreateForm() {
  const navigate = useNavigate()
  const utils = trpc.useUtils()
  const createCompanyMutation = trpc.companies.createCompany.useMutation({
    onSuccess() {
      utils.companies.findCompanies.invalidate()
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await createCompanyMutation.mutateAsync(data)
    navigate("/companies")
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>New Company</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
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
            Create
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
