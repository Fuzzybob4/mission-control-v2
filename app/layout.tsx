import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/hooks/use-toast";
import { DesignModeProvider } from "@/components/design-mode/design-mode-context";
import { DesignModeToggle } from "@/components/design-mode/design-mode-toggle";
import { DesignModeOverlay } from "@/components/design-mode/design-mode-overlay";
import { DesignModePanel } from "@/components/design-mode/design-mode-panel";

const inter = Inter({ subsets: ["latin"] });

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Atlas AI Operations Center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${orbitron.variable}`}>
        <DesignModeProvider>
          <ToastProvider>{children}</ToastProvider>
          <DesignModeOverlay />
          <DesignModePanel />
          <DesignModeToggle />
        </DesignModeProvider>
      </body>
    </html>
  );
}
