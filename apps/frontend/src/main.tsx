import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import * as ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { trpc } from "@/lib/trpc"
import { httpBatchLink } from "@trpc/client"
import { useState } from "react"
import App from "./app/App"

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: import.meta.env.VITE_BACKEND_BASE_URL + "/trpc",
          fetch(url, opts) {
            return fetch(url, { ...opts, credentials: "include" })
          },
        }),
      ],
    })
  )
  return (
    <StrictMode>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      </trpc.Provider>
    </StrictMode>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <MainWrapper>
    <App />
  </MainWrapper>
)
