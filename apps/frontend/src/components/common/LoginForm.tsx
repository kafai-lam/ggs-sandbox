import { Button } from "@/components/ui/Button"
import {
  Card,
  CardContent,
  CardDescription,
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

export default function LoginForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()
  const loginMutation = trpc.auth.login.useMutation()
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const user = await loginMutation.mutateAsync({ ...data })
    if (user) {
      navigate("/")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email and password to access your account.
        </CardDescription>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: true })}
              aria-invalid={errors.password ? "true" : "false"}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
