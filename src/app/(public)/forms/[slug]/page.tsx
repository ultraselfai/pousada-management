import { notFound } from "next/navigation";
import { getProjectBySlug, getSubmission } from "@/features/projects";
import { FormRegistry } from "./components/form-registry";

interface FormPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ submission?: string }>;
}

/**
 * Página Pública de Formulário (DEC-28)
 *
 * Renderiza o formulário correspondente ao slug.
 * Cada slug mapeia para um componente React específico via FormRegistry.
 * 
 * Query params:
 * - ?submission=ID - Modo visualização de uma resposta específica
 */
export default async function FormPage({ params, searchParams }: FormPageProps) {
  const { slug } = await params;
  const { submission: submissionId } = await searchParams;

  // Buscar projeto pelo slug
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Se tiver submissionId, buscar a resposta para modo visualização
  let submissionData = null;
  if (submissionId) {
    const submission = await getSubmission(submissionId);
    if (submission && submission.projectId === project.id) {
      submissionData = submission.data as Record<string, unknown>;
    }
  }

  return (
    <FormRegistry 
      slug={slug} 
      projectId={project.id} 
      viewMode={!!submissionData}
      submissionData={submissionData}
    />
  );
}

/**
 * Metadata dinâmica baseada no projeto
 */
export async function generateMetadata({ params }: FormPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Formulário não encontrado",
    };
  }

  return {
    title: `${project.name} | Decode`,
    description: project.description || `Formulário: ${project.name}`,
  };
}
