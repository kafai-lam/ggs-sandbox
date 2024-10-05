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
  email: string
  password: string
}

export default function RegisterForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<Inputs>()

  const registerMutation = trpc.auth.register.useMutation({
    onError(error) {
      Object.entries(error?.data?.zodError.fieldErrors).forEach(
        ([key, value]) => {
          setError(key, {
            type: "custom",
            message: value[0],
          })
        }
      )
    },
    // setError(e, {
    //   type: "custom",
    //   message: "This email is already in use",
    // })
  })
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const user = await registerMutation.mutateAsync({ ...data })
    if (user) {
      navigate("/")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Registration</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: true })}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: true })}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Register
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
