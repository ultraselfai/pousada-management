/**
 * Briefing View Mode - Visualização Somente Leitura (DEC-29)
 *
 * Exibe as respostas do briefing no formato original do formulário,
 * mas em modo somente leitura sem possibilidade de edição.
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FORM_THEME, BRAND_ELEMENTS, COLOR_PALETTES } from "./types";

interface BriefingViewModeProps {
  data: Record<string, unknown>;
}

export function BriefingViewMode({ data }: BriefingViewModeProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const totalSteps = 11;

  const goToNext = () => {
    if (currentStep < totalSteps) {
      setDirection("forward");
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setDirection("backward");
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: FORM_THEME.background,
        fontFamily: FORM_THEME.fontBody,
      }}
    >
      {/* View Mode Banner */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium"
        style={{ 
          backgroundColor: FORM_THEME.progressBar,
          color: FORM_THEME.buttonText,
        }}
      >
        <Eye className="inline-block w-4 h-4 mr-2" />
        Modo Visualização - Respostas enviadas
      </div>

      {/* Progress Bar */}
      <div className="fixed top-8 left-0 right-0 z-40">
        <div
          className="h-1 w-full"
          style={{ backgroundColor: FORM_THEME.badgeBackground }}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              backgroundColor: FORM_THEME.progressBar,
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-24 px-4 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          {/* Step Badge */}
          <div className="flex justify-center mb-6">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: FORM_THEME.badgeBackground,
                color: FORM_THEME.badgeText,
              }}
            >
              Questão {currentStep} de {totalSteps}
            </span>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ x: direction === "forward" ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === "forward" ? -300 : 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep(currentStep, data)}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer with Navigation */}
      <footer
        className="fixed bottom-0 left-0 right-0 p-4 z-50"
        style={{ backgroundColor: FORM_THEME.footerBackground }}
      >
        <div className="max-w-lg mx-auto flex gap-3">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevious}
              className="flex-1"
              style={{
                borderColor: FORM_THEME.progressBar,
                color: FORM_THEME.progressBar,
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
          )}
          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={goToNext}
              className="flex-1"
              style={{
                backgroundColor: FORM_THEME.buttonBackground,
                color: FORM_THEME.buttonText,
              }}
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1"
              style={{
                backgroundColor: FORM_THEME.buttonBackground,
                color: FORM_THEME.buttonText,
              }}
              onClick={() => window.close()}
            >
              <Check className="w-4 h-4 mr-1" />
              Fechar Visualização
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

function renderStep(step: number, data: Record<string, unknown>) {
  switch (step) {
    case 1:
      return <ViewStep1 data={data} />;
    case 2:
      return <ViewStep2 data={data} />;
    case 3:
      return <ViewStep3 data={data} />;
    case 4:
      return <ViewStep4 data={data} />;
    case 5:
      return <ViewStep5 data={data} />;
    case 6:
      return <ViewStep6 data={data} />;
    case 7:
      return <ViewStep7 data={data} />;
    case 8:
      return <ViewStep8 data={data} />;
    case 9:
      return <ViewStep9 data={data} />;
    case 10:
      return <ViewStep10 data={data} />;
    case 11:
      return <ViewStep11 data={data} />;
    default:
      return null;
  }
}

// Step Header Component
function StepHeader({ title, description }: { title: string; description?: string }) {
  const parseDescription = (text: string) => {
    const match = text.match(/^(.*?)(\s*\(.*\))$/);
    if (match) {
      return { main: match[1].trim(), hint: match[2].trim() };
    }
    return { main: text, hint: null };
  };

  const parsed = description ? parseDescription(description) : null;

  return (
    <div className="text-center mb-8">
      <h2
        className="text-2xl font-bold mb-3"
        style={{
          color: FORM_THEME.title,
          fontFamily: FORM_THEME.fontTitle,
        }}
      >
        {title}
      </h2>
      {parsed && (
        <div>
          <p className="text-base leading-relaxed" style={{ color: FORM_THEME.description }}>
            {parsed.main}
          </p>
          {parsed.hint && (
            <p className="text-sm mt-1 opacity-70" style={{ color: FORM_THEME.description }}>
              {parsed.hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Response Display Component
function ResponseDisplay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: FORM_THEME.badgeBackground }}
    >
      {children}
    </div>
  );
}

// Step 1: DNA da Marca
function ViewStep1({ data }: { data: Record<string, unknown> }) {
  const brandKeywords = (data.brandKeywords as string[]) || [];
  const customKeywords = (data.customKeywords as string[]) || [];

  return (
    <div>
      <StepHeader
        title="O DNA da Marca"
        description="Palavras selecionadas que definem a sensação da marca"
      />
      <ResponseDisplay>
        <div className="flex flex-wrap gap-2">
          {brandKeywords.map((keyword) => (
            <Badge
              key={keyword}
              className="text-sm py-2 px-4"
              style={{
                backgroundColor: FORM_THEME.progressBar,
                color: FORM_THEME.buttonText,
              }}
            >
              {keyword}
            </Badge>
          ))}
          {customKeywords.map((keyword) => (
            <Badge
              key={keyword}
              variant="outline"
              className="text-sm py-2 px-4"
              style={{
                borderColor: FORM_THEME.progressBar,
                color: FORM_THEME.progressBar,
              }}
            >
              {keyword} (personalizado)
            </Badge>
          ))}
        </div>
        {brandKeywords.length === 0 && customKeywords.length === 0 && (
          <p className="text-sm opacity-60" style={{ color: FORM_THEME.description }}>
            Nenhuma palavra selecionada
          </p>
        )}
      </ResponseDisplay>
    </div>
  );
}

// Step 2: Perfil do Cliente
function ViewStep2({ data }: { data: Record<string, unknown> }) {
  const clientConcern = data.clientConcern as string | undefined;
  const clientConcernCustom = data.clientConcernCustom as string | undefined;

  const concernLabels: Record<string, string> = {
    diagnostico: "O Diagnóstico - Pais angustiados que querem entender o que o filho tem",
    desempenho: "O Desempenho Escolar - Pais preocupados com notas e alfabetização",
    comportamento: "O Comportamento/Emoção - Pais que buscam acolhimento",
  };

  return (
    <div>
      <StepHeader
        title="O Perfil do Cliente"
        description="Principal preocupação dos pais"
      />
      <ResponseDisplay>
        <p className="text-base" style={{ color: FORM_THEME.title }}>
          {clientConcernCustom || (clientConcern && concernLabels[clientConcern]) || "Não informado"}
        </p>
      </ResponseDisplay>
    </div>
  );
}

// Step 3: Transição de Carreira
function ViewStep3({ data }: { data: Record<string, unknown> }) {
  const careerPositioning = data.careerPositioning as string | undefined;

  const positionLabels: Record<string, string> = {
    destacar: "Quero destacar muito minha experiência como professora (Posicionamento Prático)",
    neutra: "Quero ser neutra - focar 100% na nova identidade clínica (Posicionamento Clínico)",
    distanciar: "Quero me distanciar - ser vista como Doutora/Terapeuta (Posicionamento de Autoridade)",
  };

  return (
    <div>
      <StepHeader
        title="A Transição de Carreira"
        description="Como você quer se posicionar em relação à experiência como professora"
      />
      <ResponseDisplay>
        <p className="text-base" style={{ color: FORM_THEME.title }}>
          {(careerPositioning && positionLabels[careerPositioning]) || "Não informado"}
        </p>
      </ResponseDisplay>
    </div>
  );
}

// Step 4: Referências Visuais (Logo)
function ViewStep4({ data }: { data: Record<string, unknown> }) {
  const logoPreferences = (data.logoPreferences as Array<{ id: string; src?: string; liked: boolean | null }>) || [];
  const liked = logoPreferences.filter((p) => p.liked === true);
  const disliked = logoPreferences.filter((p) => p.liked === false);

  return (
    <div>
      <StepHeader
        title="Referências Visuais"
        description="Logos que você gostou e não gostou"
      />
      <ResponseDisplay>
        <div className="space-y-4">
          {liked.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: FORM_THEME.title }}>
                ✓ Gostou ({liked.length})
              </p>
              <div className="grid grid-cols-5 gap-2">
                {liked.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-white border-2 border-green-500">
                    <Image
                      src={item.src || "/form-images/placeholder.jpg"}
                      alt="Logo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {disliked.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: FORM_THEME.title }}>
                ✗ Não gostou ({disliked.length})
              </p>
              <div className="grid grid-cols-5 gap-2">
                {disliked.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-white border-2 border-red-500 opacity-50">
                    <Image
                      src={item.src || "/form-images/placeholder.jpg"}
                      alt="Logo"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ResponseDisplay>
    </div>
  );
}

// Step 5: Ranking de Referências
function ViewStep5({ data }: { data: Record<string, unknown> }) {
  const logoRanking = (data.logoRanking as Array<{ position: number; id: string; src?: string }>) || [];

  return (
    <div>
      <StepHeader
        title="Ranking das Referências"
        description="Ordem de preferência dos logos"
      />
      <ResponseDisplay>
        <div className="space-y-2">
          {logoRanking.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: FORM_THEME.progressBar,
                  color: FORM_THEME.buttonText,
                }}
              >
                {index + 1}
              </span>
              <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                <Image
                  src={item.src || "/form-images/placeholder.jpg"}
                  alt={`Posição ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          ))}
          {logoRanking.length === 0 && (
            <p className="text-sm opacity-60" style={{ color: FORM_THEME.description }}>
              Nenhum ranking definido
            </p>
          )}
        </div>
      </ResponseDisplay>
    </div>
  );
}

// Step 6: Tipografia
function ViewStep6({ data }: { data: Record<string, unknown> }) {
  const typographyPreferences = (data.typographyPreferences as Array<{ id: string; src?: string; liked: boolean | null }>) || [];
  const liked = typographyPreferences.filter((p) => p.liked === true);

  return (
    <div>
      <StepHeader
        title="Tipografia"
        description="Estilos de tipografia selecionados"
      />
      <ResponseDisplay>
        {liked.length > 0 ? (
          <div className="space-y-2">
            {liked.map((item) => (
              <div key={item.id} className="relative h-16 rounded-lg overflow-hidden bg-white p-2">
                <Image
                  src={item.src || "/form-images/placeholder.jpg"}
                  alt="Tipografia"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-60" style={{ color: FORM_THEME.description }}>
            Nenhuma tipografia selecionada
          </p>
        )}
      </ResponseDisplay>
    </div>
  );
}

// Step 7: Ranking de Tipografias
function ViewStep7({ data }: { data: Record<string, unknown> }) {
  const typographyRanking = (data.typographyRanking as Array<{ position: number; id: string; src?: string }>) || [];

  return (
    <div>
      <StepHeader
        title="Ranking das Tipografias"
        description="Ordem de preferência das tipografias"
      />
      <ResponseDisplay>
        <div className="space-y-2">
          {typographyRanking.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: FORM_THEME.progressBar,
                  color: FORM_THEME.buttonText,
                }}
              >
                {index + 1}
              </span>
              <div className="relative flex-1 h-10 rounded overflow-hidden">
                <Image
                  src={item.src || "/form-images/placeholder.jpg"}
                  alt={`Posição ${index + 1}`}
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
            </div>
          ))}
          {typographyRanking.length === 0 && (
            <p className="text-sm opacity-60" style={{ color: FORM_THEME.description }}>
              Nenhum ranking definido
            </p>
          )}
        </div>
      </ResponseDisplay>
    </div>
  );
}

// Step 8: Paleta de Cores
function ViewStep8({ data }: { data: Record<string, unknown> }) {
  const selectedPalettes = data.selectedPalettes as Array<{ id?: string; name?: string; description?: string; colors?: string[] }> | undefined;

  return (
    <div>
      <StepHeader
        title="Paleta de Cores"
        description="Paletas selecionadas para a marca"
      />
      <ResponseDisplay>
        {selectedPalettes && selectedPalettes.length > 0 ? (
          <div className="space-y-6">
            {selectedPalettes.map((palette, paletteIndex) => (
              <div key={palette.id || paletteIndex} className="space-y-3">
                <p className="font-medium" style={{ color: FORM_THEME.title }}>
                  {palette.name}
                </p>
                <p className="text-sm" style={{ color: FORM_THEME.description }}>
                  {palette.description}
                </p>
                <div className="flex gap-3 pt-2">
                  {palette.colors?.map((color, index) => (
                    <div
                      key={index}
                      className="w-12 h-12 rounded-lg shadow-sm border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-60" style={{ color: FORM_THEME.description }}>
            Nenhuma paleta selecionada
          </p>
        )}
      </ResponseDisplay>
    </div>
  );
}

// Step 9: Ranking de Elementos
function ViewStep9({ data }: { data: Record<string, unknown> }) {
  const elementsRanking = (data.elementsRanking as Array<{ id: string; label?: string; icon?: string; role?: string }>) || [];

  return (
    <div>
      <StepHeader
        title="Ranking de Elementos"
        description="Hierarquia dos símbolos da marca"
      />
      <ResponseDisplay>
        <div className="space-y-2">
          {elementsRanking.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: index < 4 ? FORM_THEME.progressBar : "#EF4444",
                  color: FORM_THEME.buttonText,
                }}
              >
                {index + 1}
              </span>
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <span className="font-medium" style={{ color: FORM_THEME.title }}>
                  {item.label}
                </span>
              </div>
              <Badge
                variant={index === 0 ? "default" : index < 3 ? "secondary" : "destructive"}
                className="text-xs"
              >
                {item.role}
              </Badge>
            </div>
          ))}
          {elementsRanking.length === 0 && (
            <p className="text-sm opacity-60" style={{ color: FORM_THEME.description }}>
              Nenhum ranking definido
            </p>
          )}
        </div>
      </ResponseDisplay>
    </div>
  );
}

// Step 10: O "Não" Absoluto
function ViewStep10({ data }: { data: Record<string, unknown> }) {
  const absoluteNo = data.absoluteNo as string | undefined;

  return (
    <div>
      <StepHeader
        title='O "Não" Absoluto'
        description="O que não pode ser usado de jeito nenhum"
      />
      <ResponseDisplay>
        {absoluteNo ? (
          <p className="text-base italic" style={{ color: FORM_THEME.title }}>
            &quot;{absoluteNo}&quot;
          </p>
        ) : (
          <p className="text-sm opacity-60" style={{ color: FORM_THEME.description }}>
            Nenhuma restrição informada
          </p>
        )}
      </ResponseDisplay>
    </div>
  );
}

// Step 11: Referências Extras
function ViewStep11({ data }: { data: Record<string, unknown> }) {
  const extraBrandReferences = data.extraBrandReferences as string | undefined;
  const uploadedFiles = data.uploadedFiles as Array<{
    name: string;
    publicUrl: string;
    key: string;
    size: number;
    type: string;
  }> | undefined;

  return (
    <div>
      <StepHeader
        title="Referências Extras"
        description="Marcas que você admira"
      />
      <ResponseDisplay>
        <div className="space-y-4">
          {extraBrandReferences ? (
            <p className="text-base" style={{ color: FORM_THEME.title }}>
              {extraBrandReferences}
            </p>
          ) : (
            <p className="text-sm opacity-60" style={{ color: FORM_THEME.description }}>
              Nenhuma referência informada
            </p>
          )}
          
          {/* Uploaded Images Grid */}
          {uploadedFiles && uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium" style={{ color: FORM_THEME.title }}>
                📎 {uploadedFiles.length} arquivo(s) enviado(s):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uploadedFiles.map((file, index) => (
                  <a
                    key={file.key || index}
                    href={file.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                    style={{ backgroundColor: FORM_THEME.badgeBackground }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.publicUrl}
                      alt={file.name || `Referência ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">
                        {file.name}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </ResponseDisplay>
    </div>
  );
}
