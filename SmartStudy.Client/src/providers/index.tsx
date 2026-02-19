import { UIProviders } from "./ui-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProviders>
      {children}
    </UIProviders>
  );
}
