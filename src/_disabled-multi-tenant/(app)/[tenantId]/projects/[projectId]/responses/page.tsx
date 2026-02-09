import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProject, listSubmissions } from "@/features/projects";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionsList } from "./components/submissions-list";

export const metadata: Metadata = {
  title: "Respostas | Projeto",
  description: "Visualize as respostas do formulário",
};

interface ResponsesPageProps {
  params: Promise<{ tenantId: string; projectId: string }>;
}

/**
 * Página de Respostas do Projeto (DEC-28)
 *
 * Lista todas as submissions de um projeto específico.
 */
export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const { tenantId, projectId } = await params;

  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(`/${tenantId}/login`);
  }

  // Buscar projeto
  const project = await getProject(projectId);
  if (!project) {
    notFound();
  }

  // Buscar submissions
  const submissions = await listSubmissions(projectId);

  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
            <Link href={`/${tenantId}/projects`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Projetos
            </Link>
          </Button>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              {submissions.length} resposta{submissions.length !== 1 ? "s" : ""} recebida
              {submissions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Info do formulário */}
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
          <div className="flex-1">
            <p className="text-sm font-medium">URL do Formulário</p>
            <code className="text-xs text-muted-foreground">
              {typeof window !== "undefined"
                ? `${window.location.origin}/forms/${project.slug}`
                : `/forms/${project.slug}`}
            </code>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a
              href={`/forms/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir Formulário
            </a>
          </Button>
        </div>

        {/* Lista de submissions */}
        <SubmissionsList submissions={submissions} formSlug={project.slug} />
      </div>
    </div>
  );
}
