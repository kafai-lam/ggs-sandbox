declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined
      SHOPIFY_STORE_DOMAIN: string
      SHOPIFY_ADMIN_API_TOKEN: string
      DATABASE_URL: string
    }
  }
}

export {}
