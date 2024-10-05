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
import { Check, ChevronsUpDown } from "lucide-react"
import { useEffect } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import { cn } from "../../lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/Command"
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/Form"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover"

type Inputs = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  companyId?: number
}

export default function CustomerEditForm() {
  const navigate = useNavigate()
  const params = useParams<{ customerId: string }>()
  const customerId = Number(params.customerId)
  const { data: customer, isSuccess } =
    trpc.customers.getCustomerById.useQuery(customerId)
  const { data: companies } = trpc.companies.findCompanies.useQuery({
    search: "",
    skip: 0,
    take: 10,
  })
  const companiesOptions = companies?.map((company) => ({
    label: company.name,
    value: company.id,
  }))
  const utils = trpc.useUtils()
  const updateCustomerMutation = trpc.customers.updateCustomer.useMutation({
    onSuccess() {
      utils.customers.getCustomerById.invalidate(customerId)
      utils.customers.findCustomers.invalidate()
    },
  })
  const form = useForm<Inputs>()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = form

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!customerId) return
    await updateCustomerMutation.mutateAsync({
      id: customerId,
      data,
    })
    navigate("/customers")
  }

  useEffect(() => {
    if (isSuccess) {
      customer?.firstName && setValue("firstName", customer.firstName)
      customer?.lastName && setValue("lastName", customer.lastName)
      customer?.email && setValue("email", customer.email)
      customer?.phone && setValue("phone", customer.phone)
      customer?.companyId && setValue("companyId", customer.companyId)
    }
  }, [isSuccess])

  return (
    customer && (
      <Card className="w-full max-w-md mx-auto mt-4">
        <CardHeader>
          <CardTitle>Edit Customer {customerId}</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {customer.shopifyId && (
                <div className="space-y-2">
                  <Label>Shopify ID</Label>
                  <Input id="shopifyId" disabled value={customer.shopifyId} />
                </div>
              )}

              <div className="space-y-2">
                <FormLabel>First Name</FormLabel>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  aria-invalid={errors.firstName ? "true" : "false"}
                />
              </div>

              <div>
                <FormLabel>Last Name</FormLabel>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  aria-invalid={errors.lastName ? "true" : "false"}
                />
              </div>

              <div>
                <FormLabel>Email</FormLabel>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </div>

              <div>
                <FormLabel>Phone</FormLabel>
                <Input
                  id="phone"
                  {...register("phone")}
                  aria-invalid={errors.phone ? "true" : "false"}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Company</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? companiesOptions?.find(
                                    (c) => c.value === field.value
                                  )?.label
                                : "Select"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Company..." />
                            <CommandList>
                              <CommandEmpty>No Company found.</CommandEmpty>
                              <CommandGroup>
                                {companiesOptions?.map((c) => (
                                  <CommandItem
                                    value={c.label}
                                    key={c.value}
                                    onSelect={() => {
                                      setValue("companyId", c.value)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        c.value === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {c.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full">
                Update
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    )
  )
}
