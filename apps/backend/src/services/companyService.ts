import { Prisma } from ".prisma/client"
import { prisma } from "../prisma"
import {
  createShopifyCompany,
  deleteShopifyCompanies,
  searchShopifyCompanies,
  ShopifyCompany,
  updateShopifyCompany,
} from "./shopifyService"

export async function findCompanies(search?: string, skip = 0, take = 20) {
  return await prisma.company.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : {},
    skip,
    take,
  })
}

export async function updateExistingCompanies(
  shopifyCompanies: ShopifyCompany[]
) {
  const companies = await prisma.company.findMany({
    where: {
      shopifyId: {
        in: shopifyCompanies.map((c) => c.id),
      },
    },
  })
  const transactions = []

  for (const company of companies) {
    const shopifyCompany = shopifyCompanies.find(
      (c) => c.id === company.shopifyId
    )
    if (
      !shopifyCompany ||
      company.updatedAt > new Date(shopifyCompany.updatedAt)
    )
      return
    const transaction = prisma.company.update({
      where: {
        shopifyId: shopifyCompany.id,
      },
      data: {
        name: shopifyCompany.name,
      },
    })
    transactions.push(transaction)
  }
  await prisma.$transaction(transactions)
}

export async function importShopifyCompanies(
  shopifyCompanies: ShopifyCompany[]
) {
  const companies = await prisma.company.findMany({
    where: {
      shopifyId: {
        in: shopifyCompanies.map((c) => c.id),
      },
    },
  })
  const existingShopifyIds = new Set(companies.map((c) => c.shopifyId))
  const newCompanies = shopifyCompanies
    .filter((shopify) => !existingShopifyIds.has(shopify.id))
    .map((shopify) => ({
      shopifyId: shopify.id,
      name: shopify.name,
    }))

  if (newCompanies.length > 0) {
    await prisma.company.createMany({
      data: newCompanies,
    })
  }
}

export async function pullCompanyFromShopifySince(date: Date, cursor?: string) {
  const query = `updated_at:>"${date.toISOString()}"`
  const data = await searchShopifyCompanies(query, 50, cursor)
  if (!data?.companies) return
  await updateExistingCompanies(data.companies.nodes)
  await importShopifyCompanies(data?.companies.nodes)
  if (data.companies.pageInfo.hasNextPage) {
    return await pullCompanyFromShopifySince(
      date,
      data.companies.pageInfo.endCursor
    )
  }
}

export async function getCompanyById(id: number) {
  return await prisma.company.findUniqueOrThrow({ where: { id } })
}

export async function getCompanyByShopifyId(shopifyId: string) {
  return await prisma.company.findUniqueOrThrow({ where: { shopifyId } })
}

export async function createCompany(data: Prisma.CompanyCreateInput) {
  const company = await prisma.company.create({ data })
  const shopifyCompany = await createShopifyCompany({
    name: company.name,
    externalId: String(company.id),
  })

  return await prisma.company.update({
    where: { id: company.id },
    data: { shopifyId: shopifyCompany.id },
  })
}

export async function updateCompany(
  id: number,
  data: Prisma.CompanyUpdateInput
) {
  const company = await prisma.company.update({
    where: { id },
    data: data,
  })
  if (company && company.shopifyId) {
    await updateShopifyCompany(company.shopifyId, {
      externalId: String(company.id),
      name: company.name,
    })
  }

  return company
}

export async function deleteCompany(id: number) {
  const company = await prisma.company.delete({ where: { id } })
  if (company.shopifyId) {
    await deleteShopifyCompanies([company.shopifyId])
  }
  return company
}
