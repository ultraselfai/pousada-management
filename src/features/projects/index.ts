/**
 * Projects Feature - Public API (DEC-28)
 *
 * Módulo de Projetos (Formulários/Briefings).
 * Permite criar formulários personalizados acessíveis via URL pública.
 */

// Types
export type {
  Project,
  Submission,
  ProjectWithCount,
  ProjectWithSubmissions,
  SubmissionWithParsedData,
  ProjectsListResult,
  ProjectActionResult,
  SubmissionActionResult,
} from "./types";

// Schemas & Validation Types
export {
  createProjectSchema,
  updateProjectSchema,
  submitFormSchema,
} from "./schemas";

export type {
  CreateProjectInput,
  UpdateProjectInput,
  SubmitFormInput,
} from "./schemas";

// Server Actions
export {
  createProject,
  listProjects,
  getProject,
  getProjectBySlug,
  updateProject,
  deleteProject,
  submitForm,
  listSubmissions,
  markSubmissionAsViewed,
  getSubmission,
  deleteSubmission,
} from "./actions";
