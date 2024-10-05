import { createAdminApiClient } from "@shopify/admin-api-client"

export const client = createAdminApiClient({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
  accessToken: process.env.SHOPIFY_ADMIN_API_TOKEN,
  apiVersion: "2024-07",
})

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
  endCursor: string
}

export interface ShopifyCustomer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  locale: string
  state: "DECLINED" | "DISABLED" | "ENABLED" | "INVITED"
  createdAt: string
  updatedAt: string
  companyContactProfiles: {
    id: string
    company: { id: string; name: string }
  }[]
}

const customerQuery = `
query customerQuery($id: ID!){
  customer(id: $id) {
    id
    firstName
    lastName
    email
    phone
    locale
    state
    locale
    createdAt
    updatedAt
    companyContactProfiles {
      id
      company {
        id
        name
      }
    }
  }
}`

export async function getShopifyCustomer(id: string) {
  const { data, errors } = await client.request<{
    customer: ShopifyCustomer
  }>(customerQuery, { variables: { id } })
  if (errors) {
    throw new Error(errors.message)
  }
  return data
}

const customersQuery = `
query CustomersQuery($query: String!, $first: Int!, $cursor:String = null) {
  customers(query: $query, first: $first, after: $cursor) {
    nodes {
      id
      firstName
      lastName
      email
      phone
      locale
      state
      locale
      createdAt
      updatedAt
      companyContactProfiles {
        id
        company {
          id
          name
        }
      }
    }
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
  }
}
`
export async function searchShopifyCustomers(
  query: string,
  take = 20,
  cursor?: string
) {
  const { data, errors } = await client.request<{
    customers: {
      nodes: ShopifyCustomer[]
      pageInfo: PageInfo
    }
  }>(customersQuery, {
    variables: {
      query,
      first: take,
      cursor,
    },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data
}

export interface ShopifyCompany {
  id: string
  name: string
  externalId: string
  createAt: string
  updatedAt: string
}

const customerCreateMutation = `
mutation createCustomer($input: CustomerInput!) {
  customerCreate(input: $input) {
    customer {
      id
      firstName
      lastName
      email
      phone
      locale
      state
      locale
      createdAt
      updatedAt
    }
    userErrors {
      message
      field
    }
  }
}`

export async function createShopifyCustomer(body: {
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
}) {
  const { data, errors } = await client.request(customerCreateMutation, {
    variables: {
      input: body,
    },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data.customerCreate.customer
}

const customerUpdateMutation = `
mutation updateCustomer($input: CustomerInput!) {
  customerUpdate(input: $input) {
    customer {
      id
      firstName
      lastName
      email
      phone
      locale
      state
      locale
      createdAt
      updatedAt
    }
    userErrors {
      message
      field
    }
  }
}`

export async function updateShopifyCustomer(
  id: string,
  body: {
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
  }
) {
  const { data, errors } = await client.request(customerUpdateMutation, {
    variables: {
      input: {
        id,
        ...body,
      },
    },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data.customerUpdate.customer
}

const customerDeleteMutation = `
mutation customerDelete($id: ID!) {
  customerDelete(input: {id: $id}) {
    deletedCustomerId
    userErrors {
      field
      message
    }
  }
}
`
export async function deleteShopifyCustomer(id: string) {
  const { data, errors } = await client.request(customerDeleteMutation, {
    variables: { id },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data.customerDelete.deletedCustomerId
}

const searchCompaniesQuery = `
query CompaniesQuery($query: String!, $first: Int!, $cursor:String = null) {
  companies(query: $query, first: $first, after: $cursor) {
    nodes {
      id
      name
      externalId
      createdAt
      updatedAt
    }
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
  }
}`

export async function searchShopifyCompanies(
  query: string,
  take = 20,
  cursor?: string
) {
  const { data, errors } = await client.request<{
    companies: {
      nodes: ShopifyCompany[]
      pageInfo: PageInfo
    }
  }>(searchCompaniesQuery, {
    variables: {
      query,
      first: take,
      cursor,
    },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data
}

const companyCreateMutation = `
mutation CompanyCreate($input: CompanyCreateInput!) {
  companyCreate(input: $input) {
    company {
      id
      name
      externalId
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
    }
  }
}`

export async function createShopifyCompany(body: {
  name: string
  externalId: string
}): Promise<ShopifyCompany> {
  const { data, errors } = await client.request(companyCreateMutation, {
    variables: { input: { company: body } },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data.companyCreate.company
}

const companyUpdateMutation = `
mutation companyUpdate($companyId: ID!, $input: CompanyInput!) {
  companyUpdate(companyId: $companyId, input: $input) {
    company {
      id
      name
      externalId
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
    }
  }
}`

export async function updateShopifyCompany(
  id: string,
  body: { name: string; externalId: string }
) {
  const { data, errors } = await client.request(companyUpdateMutation, {
    variables: {
      companyId: id,
      input: body,
    },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data.companyUpdate.company
}

const companiesDeleteMutation = `
mutation companiesDelete($companyIds: [ID!]!) {
  companiesDelete(companyIds: $companyIds) {
    deletedCompanyIds
    userErrors {
      field
      message
    }
  }
}
`
export async function deleteShopifyCompanies(ids: string[]) {
  const { data, errors } = await client.request(companiesDeleteMutation, {
    variables: {
      companyIds: ids,
    },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data.companiesDelete.deletedCompanyIds
}

const CompanyContactCreateMutation = `
mutation companyContactCreate($companyId: ID!, $input: CompanyContactInput!) {
  companyContactCreate(companyId: $companyId, input: $input) {
    companyContact {
      id
      customer {
        id
      }
      company {
        id
      }
    }
    userErrors {
      field
      message
    }
  }
}`

export async function createCompanyContact(
  companyId: string,
  input: { email: string } | { phone: string }
): Promise<string> {
  const { data, errors } = await client.request(CompanyContactCreateMutation, {
    variables: { companyId, input },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data.companyContactCreate
}

const CompanyContactUpdateMutation = `
mutation companyContactsDelete($companyContactIds: [ID!]!) {
  companyContactsDelete(companyContactIds: $companyContactIds) {
    deletedCompanyContactIds
    userErrors {
      field
      message
    }
  }
}`

export async function deleteCompanyContacts(ids: string[]) {
  const { data, errors } = await client.request(CompanyContactUpdateMutation, {
    variables: {
      companyContactIds: ids,
    },
  })
  if (errors) {
    throw new Error(errors.message)
  }
  return data.companyContactsDelete.deletedCompanyContactIds
}

const companyAssignCustomerAsContactMutation = `
mutation companyAssignCustomerAsContact($companyId: ID!, $customerId: ID!) {
  companyAssignCustomerAsContact(companyId: $companyId, customerId: $customerId) {
    companyContact {
      id
      customer {
        id
      }
      company {
        id
      }
    }
    userErrors {
      field
      message
    }
  }
}`

export async function companyAssignCustomerAsContact(
  companyId: string,
  customerId: string
): Promise<string> {
  const { data, errors } = await client.request(
    companyAssignCustomerAsContactMutation,
    {
      variables: { companyId, customerId },
    }
  )
  if (errors) {
    throw new Error(errors.message)
  }
  return data.companyContactCreate
}
