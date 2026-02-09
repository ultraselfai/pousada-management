import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { inter } from "@/lib/fonts";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Admin Dois Corações",
  description: "Sistema de gestão da Pousada Dois Corações",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <SidebarConfigProvider>
            {children}
            <Toaster richColors position="top-right" />
          </SidebarConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
