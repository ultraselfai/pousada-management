/**
 * Shared UI Components for Briefing Form (DEC-29)
 */

"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FORM_THEME } from "./types";

// Animation variants for step transitions
export const slideVariants = {
  enter: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "forward" | "backward") => ({
    x: direction === "forward" ? -300 : 300,
    opacity: 0,
  }),
};

export const fadeVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

// Custom Progress Bar component for the form
function FormProgressBar({ value }: { value: number }) {
  return (
    <div
      className="relative h-1 w-full overflow-hidden"
      style={{ backgroundColor: FORM_THEME.badgeBackground }}
    >
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          backgroundColor: FORM_THEME.progressBar,
          width: `${value}%`,
        }}
      />
    </div>
  );
}

interface FormLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  progress: number;
  onBack?: () => void;
  onNext?: () => void;
  canProceed?: boolean;
  isLastStep?: boolean;
  isFirstStep?: boolean;
  nextLabel?: string;
}

export function FormLayout({
  children,
  currentStep,
  totalSteps,
  progress,
  onBack,
  onNext,
  canProceed = true,
  isLastStep = false,
  isFirstStep = false,
  nextLabel = "Continuar",
}: FormLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: FORM_THEME.background,
        fontFamily: FORM_THEME.fontBody,
      }}
    >
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <FormProgressBar value={progress} />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-6 pb-24 px-4 overflow-y-auto">
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
              Questão {currentStep} de {totalSteps - 1}
            </span>
          </div>

          {/* Step Content */}
          {children}
        </div>
      </main>

      {/* Footer with Navigation */}
      <footer
        className="fixed bottom-0 left-0 right-0 p-4 z-50"
        style={{ backgroundColor: FORM_THEME.footerBackground }}
      >
        <div className="max-w-lg mx-auto flex gap-3">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              style={{
                borderColor: FORM_THEME.progressBar,
                color: FORM_THEME.progressBar,
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1"
            style={{
              backgroundColor: canProceed
                ? FORM_THEME.buttonBackground
                : `${FORM_THEME.buttonBackground}80`,
              color: FORM_THEME.buttonText,
            }}
          >
            {nextLabel}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}

interface StepWrapperProps {
  children: ReactNode;
  stepKey: number;
  direction: "forward" | "backward";
}

export function StepWrapper({ children, stepKey, direction }: StepWrapperProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface StepHeaderProps {
  title: string;
  description?: string;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  // Separate main text from parenthetical text
  const parseDescription = (text: string) => {
    const match = text.match(/^(.*?)(\s*\(.*\))$/);
    if (match) {
      return {
        main: match[1].trim(),
        hint: match[2].trim(),
      };
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
          fontFamily: '"Crimson Text", serif',
        }}
      >
        {title}
      </h2>
      {parsed && (
        <div>
          <p
            className="text-base leading-relaxed"
            style={{ color: FORM_THEME.description }}
          >
            {parsed.main}
          </p>
          {parsed.hint && (
            <p
              className="text-sm mt-1 opacity-70"
              style={{ color: FORM_THEME.description }}
            >
              {parsed.hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
