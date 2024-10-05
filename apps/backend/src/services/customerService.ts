import { Prisma } from ".prisma/client"
import { prisma } from "../prisma"
import {
  companyAssignCustomerAsContact,
  createShopifyCustomer,
  deleteCompanyContacts,
  deleteShopifyCustomer,
  getShopifyCustomer,
  searchShopifyCustomers,
  ShopifyCustomer,
  updateShopifyCustomer,
} from "./shopifyService"

export async function findCustomers(search?: string, skip = 0, take = 20) {
  return await prisma.customer.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    skip,
    take,
  })
}

export async function updateExistingCustomers(
  shopifyCustomers: ShopifyCustomer[]
) {
  const customers = await prisma.customer.findMany({
    where: {
      shopifyId: {
        in: shopifyCustomers.map((c) => c.id),
      },
    },
  })
  const transactions = []

  for (const customer of customers) {
    const shopifyCustomer = shopifyCustomers.find(
      (c) => c.id === customer.shopifyId
    )
    if (
      !shopifyCustomer ||
      customer.updatedAt > new Date(shopifyCustomer.updatedAt)
    )
      return
    const transaction = prisma.customer.update({
      where: {
        shopifyId: shopifyCustomer.id,
      },
      data: {
        firstName: shopifyCustomer.firstName,
        lastName: shopifyCustomer.lastName,
        email: shopifyCustomer.email,
        phone: shopifyCustomer.phone,
        locale: shopifyCustomer.locale,
        state: shopifyCustomer.state,
      },
    })
    transactions.push(transaction)
  }
  await prisma.$transaction(transactions)
}

export async function importShopifyCustomers(
  shopifyCustomers: ShopifyCustomer[]
) {
  const customers = await prisma.customer.findMany({
    where: {
      shopifyId: {
        in: shopifyCustomers.map((c) => c.id),
      },
    },
  })
  const existingShopifyIds = new Set(customers.map((c) => c.shopifyId))
  const filteredShopifyCustomers = shopifyCustomers.filter(
    (shopify) => !existingShopifyIds.has(shopify.id)
  )
  const shopifyCompanies = filteredShopifyCustomers
    .map((c) => c?.companyContactProfiles?.[0]?.company.id)
    .filter(Boolean)
  const companies = await prisma.company.findMany({
    where: { shopifyId: { in: shopifyCompanies } },
  })
  const newCustomers = shopifyCustomers
    .filter((shopify) => !existingShopifyIds.has(shopify.id))
    .map((shopify) => {
      const shopifyCompanyContactId =
        shopify.companyContactProfiles.length > 0
          ? shopify.companyContactProfiles[0].id
          : null
      const company =
        shopify.companyContactProfiles.length > 0
          ? companies?.find(
              (c) =>
                c.shopifyId === shopify.companyContactProfiles[0].company.id
            )
          : null
      return {
        shopifyId: shopify.id,
        firstName: shopify.firstName,
        lastName: shopify.lastName,
        email: shopify.email,
        phone: shopify.phone,
        locale: shopify.locale,
        state: shopify.state,
        companyId: company?.id,
      }
    })

  if (newCustomers.length > 0) {
    await prisma.customer.createMany({
      data: newCustomers,
    })
  }
}

export async function pullCustomerFromShopifySince(
  date: Date,
  cursor?: string
) {
  const query = `updated_at:>"${date.toISOString()}"`
  const data = await searchShopifyCustomers(query, 50, cursor)
  if (!data?.customers) return
  await updateExistingCustomers(data.customers.nodes)
  await importShopifyCustomers(data?.customers.nodes)
  if (data.customers.pageInfo.hasNextPage) {
    return await pullCustomerFromShopifySince(
      date,
      data.customers.pageInfo.endCursor
    )
  }
}

export async function getCustomerById(id: number) {
  return await prisma.customer.findUniqueOrThrow({ where: { id } })
}

export async function getCustomerByShopifyId(shopifyId: string) {
  return await prisma.customer.findUniqueOrThrow({ where: { shopifyId } })
}

export async function createCustomer(data: Prisma.CustomerCreateInput) {
  const customer = await prisma.customer.create({
    data,
    include: { company: true },
  })
  const shopifyCustomer = await createShopifyCustomer({
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    email: customer.email,
  })

  if (customer.company && customer.company.shopifyId) {
    await companyAssignCustomerAsContact(
      customer.company.shopifyId,
      shopifyCustomer.id
    )
  }

  return await prisma.customer.update({
    where: { id: customer.id },
    data: { shopifyId: shopifyCustomer.id },
  })
}

export async function updateCustomer(
  id: number,
  data: Prisma.CustomerUpdateInput
) {
  const customer = await prisma.customer.update({
    where: { id },
    data: data,
    include: { company: true },
  })
  if (customer && customer.shopifyId) {
    await updateShopifyCustomer(customer.shopifyId, {
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
    })
  }
  if (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    data.companyId &&
    customer.shopifyId &&
    customer.company &&
    customer.company.shopifyId
  ) {
    const shopifyCustomer = await getShopifyCustomer(customer.shopifyId)
    if (shopifyCustomer?.customer.companyContactProfiles.length) {
      await deleteCompanyContacts([
        shopifyCustomer.customer.companyContactProfiles[0].id,
      ])
    }
    await companyAssignCustomerAsContact(
      customer.company.shopifyId,
      customer.shopifyId
    )
  }

  return customer
}
export async function deleteCustomer(id: number) {
  const customer = await prisma.customer.delete({ where: { id } })
  if (customer.shopifyId) {
    await deleteShopifyCustomer(customer.shopifyId)
  }
  return customer
}

// export async function erasureCustomerDataRequest() {}
