import { z } from "zod"
import {
  createCompany,
  deleteCompany,
  findCompanies,
  getCompanyById,
  pullCompanyFromShopifySince,
  updateCompany,
} from "../services/companyService"
import { privateProcedure, router } from "./trpc"

export const SearchCompanySchema = z.object({
  search: z.string().optional(),
  skip: z.number().int().nonnegative(),
  take: z.number().int().positive(),
})

export const companiesRouter = router({
  findCompanies: privateProcedure
    .input(SearchCompanySchema)
    .query(async ({ input }) => {
      const companies = await findCompanies(
        input.search,
        input.skip,
        input.take
      )
      return companies
    }),
  pullCompanyFromShopifySince: privateProcedure
    .input(
      z.object({
        date: z.string().datetime(),
      })
    )
    .mutation(async ({ input }) => {
      await pullCompanyFromShopifySince(new Date(input.date))
    }),

  getCompanyById: privateProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await getCompanyById(input)
    }),
  createCompany: privateProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await createCompany(input)
    }),
  updateCompany: privateProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          name: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return await updateCompany(input.id, input.data)
    }),
  deleteCompany: privateProcedure
    .input(z.number().int().positive())
    .mutation(async ({ input }) => {
      return await deleteCompany(input)
    }),
})
