import { TRPCError } from "@trpc/server"
import bcrypt from "bcrypt"
import { prisma } from "../prisma"

type UserCreateInput = { email: string; password: string }
type UserLoginInput = Pick<UserCreateInput, "email" | "password">

const SALT_ROUNDS = 10

export async function findExistingUser(email: string) {
  return await prisma.user.findUnique({ where: { email } })
}

export async function register(userCreateInput: UserCreateInput) {
  const existUser = await findExistingUser(userCreateInput.email)
  if (existUser) {
    throw new TRPCError({ code: "CONFLICT", message: "User already exists" })
  }
  const hashedPassword = await bcrypt.hash(
    userCreateInput.password,
    SALT_ROUNDS
  )
  const user = await prisma.user.create({
    data: {
      email: userCreateInput.email,
      hashedPassword,
    },
  })
  return { id: user.id, email: user.email }
}

export async function login(userLoginInput: UserLoginInput) {
  const existUser = await findExistingUser(userLoginInput.email)
  if (!existUser) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User does not exist",
    })
  }
  const isPasswordValid = await bcrypt.compare(
    userLoginInput.password,
    existUser.hashedPassword
  )
  if (!isPasswordValid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid password",
    })
  }
  return { id: existUser.id, email: existUser.email }
}
