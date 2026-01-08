import { ThemeProvider } from "@/components/theme-provider";

/**
 * Layout para páginas públicas (formulários)
 *
 * Layout minimalista sem sidebar ou navegação.
 * Apenas o conteúdo do formulário.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="system">
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {children}
      </main>
    </ThemeProvider>
  );
}
