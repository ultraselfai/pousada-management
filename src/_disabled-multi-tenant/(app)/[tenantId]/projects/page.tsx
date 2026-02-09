import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listProjects } from "@/features/projects";
import { ProjectsGrid } from "./components/projects-grid";
import { CreateProjectDialog } from "./components/create-project-dialog";

export const metadata: Metadata = {
  title: "Projetos | Decode Lab",
  description: "Gerencie seus formulários e briefings personalizados",
};

interface ProjectsPageProps {
  params: Promise<{ tenantId: string }>;
}

/**
 * Página de Projetos (DEC-28)
 *
 * Lista todos os projetos (formulários/briefings) da organização.
 * Permite criar novos projetos e ver respostas.
 */
export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { tenantId } = await params;

  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(`/${tenantId}/login`);
  }

  // Buscar organização do usuário
  const orgs = await auth.api.listOrganizations({ headers: await headers() });
  const currentOrg = orgs?.find((org) => org.slug === tenantId);

  if (!currentOrg) {
    redirect(`/${tenantId}/login`);
  }

  // Buscar projetos
  const { projects, total } = await listProjects(currentOrg.id);

  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
            <p className="text-muted-foreground">
              Crie e gerencie formulários personalizados para seus briefings.
            </p>
          </div>
          <CreateProjectDialog organizationId={currentOrg.id} />
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Total de Projetos
            </div>
            <div className="text-2xl font-bold">{total}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Respostas Hoje
            </div>
            <div className="text-2xl font-bold">
              {projects.reduce((acc, p) => acc + p._count.submissions, 0)}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Formulários Ativos
            </div>
            <div className="text-2xl font-bold">{projects.length}</div>
          </div>
        </div>

        {/* Grid de projetos */}
        <ProjectsGrid projects={projects} tenantId={tenantId} />
      </div>
    </div>
  );
}
