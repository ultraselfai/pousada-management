/**
 * Form Registry (DEC-28)
 *
 * Registry de componentes de formulário.
 * Mapeia slugs para componentes React específicos.
 *
 * Para adicionar um novo formulário:
 * 1. Crie o componente em ./forms/
 * 2. Adicione ao formComponents abaixo
 * 3. Crie o projeto com o mesmo slug no admin
 */

import { ComponentType } from "react";
import { DefaultForm } from "./forms/default-form";
import { BriefingWebsiteForm } from "./forms/briefing-website-form";
import { BriefingCileneNunesForm } from "./forms/briefing-cilene-nunes";

/**
 * Props padrão para todos os formulários
 */
export interface FormComponentProps {
  projectId: string;
  slug: string;
  viewMode?: boolean;
  submissionData?: Record<string, unknown> | null;
}

/**
 * Registry de componentes de formulário
 *
 * Chave: slug do projeto (ex: "briefing-website")
 * Valor: Componente React que renderiza o formulário
 */
const formComponents: Record<string, ComponentType<FormComponentProps>> = {
  // Formulários disponíveis
  "briefing-website": BriefingWebsiteForm,
  "briefing-cilene-nunes": BriefingCileneNunesForm,

  // Adicione novos formulários aqui:
  // "briefing-video": BriefingVideoForm,
  // "briefing-logo": BriefingLogoForm,
};

interface FormRegistryProps {
  slug: string;
  projectId: string;
  viewMode?: boolean;
  submissionData?: Record<string, unknown> | null;
}

/**
 * Componente que renderiza o formulário correto baseado no slug
 */
export function FormRegistry({ slug, projectId, viewMode, submissionData }: FormRegistryProps) {
  // Buscar componente no registry
  const FormComponent = formComponents[slug];

  // Se não encontrar, renderizar formulário padrão (placeholder)
  if (!FormComponent) {
    return <DefaultForm projectId={projectId} slug={slug} />;
  }

  return <FormComponent projectId={projectId} slug={slug} viewMode={viewMode} submissionData={submissionData} />;
}
