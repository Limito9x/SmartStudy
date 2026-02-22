import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { UIProviders } from "./ui-provider";
import { BrowserRouter } from "react-router-dom";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UIProviders>{children}</UIProviders>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
