import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { trpc } from "@/lib/trpc"
import { Check, ChevronsUpDown } from "lucide-react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
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

export default function CustomerCreateForm() {
  const navigate = useNavigate()
  const form = useForm<Inputs>()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = form
  const utils = trpc.useUtils()
  const { data: companies } = trpc.companies.findCompanies.useQuery({
    search: "",
    skip: 0,
    take: 10,
  })
  const companiesOptions = companies?.map((company) => ({
    label: company.name,
    value: company.id,
  }))
  const createCustomerMutation = trpc.customers.createCustomer.useMutation({
    onSuccess() {
      utils.customers.findCustomers.invalidate()
    },
  })

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const customer = await createCustomerMutation.mutateAsync(data)
    navigate("/customers")
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>New Customer </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
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

            <div>
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
              Create
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
