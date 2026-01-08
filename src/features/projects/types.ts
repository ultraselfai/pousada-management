/**
 * Projects Types - DEC-28
 *
 * Tipos TypeScript para a feature de Projetos (Formulários/Briefings).
 * Projetos são formulários personalizados que podem ser acessados via URL pública.
 */

/**
 * Tipo base do Project (espelhando o Prisma)
 */
export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipo base do Submission (espelhando o Prisma)
 */
export interface Submission {
  id: string;
  projectId: string;
  data: unknown;
  viewed: boolean;
  createdAt: Date;
}

/**
 * Project com contagem de submissions
 */
export interface ProjectWithCount extends Project {
  _count: {
    submissions: number;
  };
}

/**
 * Project com submissions incluídas
 */
export interface ProjectWithSubmissions extends Project {
  submissions: Submission[];
}

/**
 * Submission com dados parseados do JSON
 */
export interface SubmissionWithParsedData<T = Record<string, unknown>>
  extends Omit<Submission, "data"> {
  data: T;
}

/**
 * Resultado de listagem de projetos
 */
export interface ProjectsListResult {
  projects: ProjectWithCount[];
  total: number;
}

/**
 * Resultado de ação em projeto
 */
export interface ProjectActionResult {
  success: boolean;
  message?: string;
  project?: Project;
  error?: string;
}

/**
 * Resultado de submissão de formulário
 */
export interface SubmissionActionResult {
  success: boolean;
  message?: string;
  submission?: Submission;
  error?: string;
}
