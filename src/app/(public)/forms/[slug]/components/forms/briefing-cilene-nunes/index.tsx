/**
 * Briefing DNA da Marca Form - Main Component (DEC-29)
 *
 * Formulário interativo multi-step para coleta de briefing de identidade visual.
 * Mobile-first, Typeform-style com animações Framer Motion.
 *
 * Rota: /forms/briefing-cilene-nunes
 * Modo visualização: /forms/briefing-cilene-nunes?submission=ID
 */

"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { submitForm } from "@/features/projects";
import { FormComponentProps } from "../../form-registry";
import { useFormState } from "./use-form-state";
import { FormLayout, StepWrapper } from "./ui-components";
import { BriefingViewMode } from "./view-mode";
import { WelcomeScreen } from "./welcome-screen";
import {
  Step1PontoZero,
  Step2Conquistas,
  Step3DNAMarca,
  Step4PerfilCliente,
  Step5TransicaoCarreira,
  Step6ReferenciasVisuais,
  Step7RankingReferencias,
  Step8Tipografia,
  Step9RankingTipografias,
  Step10PaletaCores,
  Step11RankingElementos,
  Step12NaoAbsoluto,
  Step13ReferenciasExtras,
  CompletionScreen,
} from "./steps";
import { BRAND_KEYWORDS, LOGO_REFERENCES, TYPOGRAPHY_REFERENCES, COLOR_PALETTES, BRAND_ELEMENTS } from "./types";

export function BriefingCileneNunesForm({ projectId, slug, viewMode, submissionData }: FormComponentProps) {
  // Se estiver em modo visualização, renderizar componente de visualização
  if (viewMode && submissionData) {
    return <BriefingViewMode data={submissionData} />;
  }

  return <BriefingFormEdit projectId={projectId} formSlug={slug} />;
}

// Componente interno para o modo de edição
function BriefingFormEdit({ projectId, formSlug }: { projectId: string; formSlug: string }) {
  const {
    showWelcome,
    currentStep,
    formData,
    isSubmitting,
    isCompleted,
    direction,
    progress,
    totalSteps,
    startForm,
    updateFormData,
    goToNextStep,
    goToPreviousStep,
    getLikedLogos,
    getLikedTypography,
    canProceed,
    completeForm,
    setIsSubmitting,
  } = useFormState();

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submissionData = {
        // Step 1 - Ponto Zero
        pontoZero: formData.pontoZero,

        // Step 2 - Conquistas
        conquistas: formData.conquistas,

        // Step 3 - DNA da Marca
        brandKeywords: formData.brandKeywords.map(
          (id) => BRAND_KEYWORDS.find((k) => k.id === id)?.label || id
        ),
        customKeywords: formData.customKeywords,

        // Step 4 - Perfil do Cliente
        clientConcern: formData.clientConcern,
        clientConcernCustom: formData.clientConcernCustom,

        // Step 5 - Transição de Carreira
        careerPositioning: formData.careerPositioning,

        // Step 6 & 7 - Referências Visuais
        logoPreferences: formData.logoReferences.map((ref) => ({
          id: ref.id,
          src: LOGO_REFERENCES.find((r) => r.id === ref.id)?.src,
          liked: ref.liked,
        })),
        logoRanking: formData.logoRanking.map((id, index) => ({
          position: index + 1,
          id,
          src: LOGO_REFERENCES.find((r) => r.id === id)?.src,
        })),

        // Step 8 & 9 - Tipografia
        typographyPreferences: formData.typographyReferences.map((ref) => ({
          id: ref.id,
          src: TYPOGRAPHY_REFERENCES.find((r) => r.id === ref.id)?.src,
          liked: ref.liked,
        })),
        typographyRanking: formData.typographyRanking.map((id, index) => ({
          position: index + 1,
          id,
          src: TYPOGRAPHY_REFERENCES.find((r) => r.id === id)?.src,
        })),

        // Step 10 - Paleta de Cores
        selectedPalettes: formData.selectedPalettes.map((id) =>
          COLOR_PALETTES.find((p) => p.id === id)
        ).filter(Boolean),

        // Step 11 - Ranking de Elementos
        elementsRanking: formData.elementsRanking.map((id, index) => ({
          position: index + 1,
          id,
          label: BRAND_ELEMENTS.find((e) => e.id === id)?.label,
          icon: BRAND_ELEMENTS.find((e) => e.id === id)?.icon,
          role:
            index === 0
              ? "Protagonista"
              : index === 1
                ? "Coadjuvante"
                : index < 4
                  ? "Cenário"
                  : "Eliminado",
        })),

        // Step 12 - O Não Absoluto
        absoluteNo: formData.absoluteNo,

        // Step 13 - Referências Extras
        extraBrandReferences: formData.extraBrandReferences,
        uploadedFiles: formData.uploadedFilesUrls, // URLs dos arquivos uploadados

        // Metadata
        submittedAt: new Date().toISOString(),
      };

      const result = await submitForm({
        projectId,
        data: submissionData,
      });

      if (result.success) {
        completeForm();
        toast.success("Briefing enviado com sucesso!");
      } else {
        toast.error(result.error || "Erro ao enviar briefing");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar briefing. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, projectId, completeForm, setIsSubmitting]);

  // Handle next step or submit
  const handleNext = useCallback(() => {
    if (currentStep === 13) {
      // Last step before completion - submit
      handleSubmit();
    } else {
      goToNextStep();
    }
  }, [currentStep, goToNextStep, handleSubmit]);

  // Update logo reference
  const handleLogoReferenceChange = useCallback(
    (id: string, liked: boolean | null) => {
      const updated = formData.logoReferences.map((ref) =>
        ref.id === id ? { ...ref, liked } : ref
      );
      updateFormData("logoReferences", updated);
    },
    [formData.logoReferences, updateFormData]
  );

  // Update typography reference
  const handleTypographyReferenceChange = useCallback(
    (id: string, liked: boolean | null) => {
      const updated = formData.typographyReferences.map((ref) =>
        ref.id === id ? { ...ref, liked } : ref
      );
      updateFormData("typographyReferences", updated);
    },
    [formData.typographyReferences, updateFormData]
  );

  // Show completion screen
  if (isCompleted) {
    return <CompletionScreen isVisible={true} />;
  }

  // Show welcome screen
  if (showWelcome) {
    return <WelcomeScreen onStart={startForm} />;
  }

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PontoZero
            value={formData.pontoZero}
            onChange={(value) => updateFormData("pontoZero", value)}
          />
        );
      case 2:
        return (
          <Step2Conquistas
            value={formData.conquistas}
            onChange={(value) => updateFormData("conquistas", value)}
          />
        );
      case 3:
        return (
          <Step3DNAMarca
            selectedKeywords={formData.brandKeywords}
            customKeywords={formData.customKeywords}
            onKeywordsChange={(keywords) =>
              updateFormData("brandKeywords", keywords)
            }
            onCustomKeywordsChange={(keywords) =>
              updateFormData("customKeywords", keywords)
            }
          />
        );
      case 4:
        return (
          <Step4PerfilCliente
            selectedConcern={formData.clientConcern}
            customConcern={formData.clientConcernCustom}
            onConcernChange={(concern) =>
              updateFormData("clientConcern", concern)
            }
            onCustomConcernChange={(text) =>
              updateFormData("clientConcernCustom", text)
            }
          />
        );
      case 5:
        return (
          <Step5TransicaoCarreira
            selectedPosition={formData.careerPositioning}
            onPositionChange={(position) =>
              updateFormData("careerPositioning", position)
            }
          />
        );
      case 6:
        return (
          <Step6ReferenciasVisuais
            references={formData.logoReferences}
            onReferenceChange={handleLogoReferenceChange}
          />
        );
      case 7:
        return (
          <Step7RankingReferencias
            likedIds={getLikedLogos()}
            ranking={formData.logoRanking}
            onRankingChange={(ranking) =>
              updateFormData("logoRanking", ranking)
            }
          />
        );
      case 8:
        return (
          <Step8Tipografia
            references={formData.typographyReferences}
            onReferenceChange={handleTypographyReferenceChange}
          />
        );
      case 9:
        return (
          <Step9RankingTipografias
            likedIds={getLikedTypography()}
            ranking={formData.typographyRanking}
            onRankingChange={(ranking) =>
              updateFormData("typographyRanking", ranking)
            }
          />
        );
      case 10:
        return (
          <Step10PaletaCores
            selectedPalettes={formData.selectedPalettes}
            onPalettesChange={(palettes) =>
              updateFormData("selectedPalettes", palettes)
            }
          />
        );
      case 11:
        return (
          <Step11RankingElementos
            ranking={formData.elementsRanking}
            onRankingChange={(ranking) =>
              updateFormData("elementsRanking", ranking)
            }
          />
        );
      case 12:
        return (
          <Step12NaoAbsoluto
            value={formData.absoluteNo}
            onChange={(value) => updateFormData("absoluteNo", value)}
          />
        );
      case 13:
        return (
          <Step13ReferenciasExtras
            brandReferences={formData.extraBrandReferences}
            onBrandReferencesChange={(value) =>
              updateFormData("extraBrandReferences", value)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      progress={progress}
      onBack={goToPreviousStep}
      onNext={handleNext}
      canProceed={canProceed(currentStep) && !isSubmitting}
      isFirstStep={currentStep === 1}
      isLastStep={currentStep === 13}
      nextLabel={
        currentStep === 13
          ? isSubmitting
            ? "Enviando..."
            : "Concluir Briefing"
          : "Continuar"
      }
    >
      <StepWrapper stepKey={currentStep} direction={direction}>
        {renderStep()}
      </StepWrapper>
    </FormLayout>
  );
}
