export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header do site (você adiciona depois) */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-xl font-bold">🏖️ Pousada</div>
            <div className="flex gap-4">
              <a href="/" className="hover:underline">Início</a>
              <a href="/sobre" className="hover:underline">Sobre</a>
              <a href="/quartos" className="hover:underline">Quartos</a>
              <a href="/contato" className="hover:underline">Contato</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main>{children}</main>

      {/* Footer (você adiciona depois) */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2026 Pousada Management. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
