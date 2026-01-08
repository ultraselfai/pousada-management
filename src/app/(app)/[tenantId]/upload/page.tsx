import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Upload | Cliente",
  description: "Upload de arquivos para Cloudflare R2",
}

/**
 * Upload de Arquivos do Cliente
 * 
 * Página para o cliente fazer upload de arquivos.
 */
export default function ClientUploadPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Upload de Arquivos</h1>
          <p className="text-muted-foreground">
            Faça upload de arquivos para sua organização.
          </p>
        </div>

        {/* Área de upload */}
        <div className="rounded-lg border-2 border-dashed bg-card p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Arraste arquivos aqui</p>
              <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Selecionar Arquivos
            </button>
          </div>
        </div>

        {/* Lista de arquivos recentes */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Arquivos Recentes</h3>
          <div className="text-sm text-muted-foreground text-center py-8">
            Nenhum arquivo enviado ainda.
          </div>
        </div>
      </div>
    </div>
  )
}
