import { z } from "zod"
import {
  createCustomer,
  deleteCustomer,
  findCustomers,
  getCustomerById,
  pullCustomerFromShopifySince,
  updateCustomer,
} from "../services/customerService"
import { privateProcedure, router } from "./trpc"

export const SearchCustomerSchema = z.object({
  search: z.string().optional(),
  skip: z.number().int().nonnegative(),
  take: z.number().int().positive(),
})

export const customersRouter = router({
  findCustomers: privateProcedure
    .input(SearchCustomerSchema)
    .query(async ({ input }) => {
      const customers = await findCustomers(
        input.search,
        input.skip,
        input.take
      )
      return customers
    }),
  pullCustomerFromShopifySince: privateProcedure
    .input(
      z.object({
        date: z.string().datetime(),
      })
    )
    .mutation(async ({ input }) => {
      await pullCustomerFromShopifySince(new Date(input.date))
    }),

  getCustomerById: privateProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await getCustomerById(input)
    }),
  createCustomer: privateProcedure
    .input(
      z.object({
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        companyId: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await createCustomer(input)
    }),
  updateCustomer: privateProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          firstName: z.string().nullable().optional(),
          lastName: z.string().nullable().optional(),
          email: z.string().nullable().optional(),
          phone: z.string().nullable().optional(),
          companyId: z.number().nullable().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await updateCustomer(input.id, input.data)
    }),
  deleteCustomer: privateProcedure
    .input(z.number().int().positive())
    .mutation(async ({ input }) => {
      return await deleteCustomer(input)
    }),
})
