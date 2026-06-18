import { BusyOverlay } from "./busy-overlay";
import { Footer } from "./footer";
import { Header } from "./header";
import { MainContent } from "./main-content";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="special">
      <BusyOverlay />
      <Header />
      <MainContent>{children}</MainContent>
      <Footer />
    </div>
  );
}
