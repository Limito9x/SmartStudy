import { UIProviders } from "./ui-provider";
import { BrowserRouter } from "react-router-dom";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <UIProviders>{children}</UIProviders>
    </BrowserRouter>
  );
}
