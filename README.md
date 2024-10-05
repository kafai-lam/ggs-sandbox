# GGS Sandbox

## Tech Stack

- Nx
- Prisma
- trpc
- @shopify/admin-api-client with GraphQL
- tanstack-query
- shadcn/ui

## Project Startup

```bash
npm install

docker comppose up -d
npx nx prisma-push backend
npx nx prisma-generate backend

npx nx serve backend
npx nx serve frontend
```

## Further Improvements

- [ ] OAuth
- [ ] Task Queue
- [ ] Logging
- [ ] Error Handling
- [ ] Form Validation
- [ ] Testing
