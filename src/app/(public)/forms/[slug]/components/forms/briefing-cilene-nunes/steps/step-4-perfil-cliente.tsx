/**
 * Step 4: Perfil do Cliente (DEC-29)
 */

"use client";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StepHeader } from "../ui-components";
import { CLIENT_CONCERNS, FORM_THEME } from "../types";

interface Step4Props {
  selectedConcern: string | null;
  customConcern: string;
  onConcernChange: (concern: string | null) => void;
  onCustomConcernChange: (text: string) => void;
}

export function Step4PerfilCliente({
  selectedConcern,
  customConcern,
  onConcernChange,
  onCustomConcernChange,
}: Step4Props) {
  return (
    <div>
      <StepHeader
        title="O Perfil do Cliente"
        description='Pensando nos pais que vão te procurar no consultório, qual é a maior preocupação deles? (Isso ajuda a definir se a marca foca na "dor" ou na "esperança")'
      />

      {/* Options */}
      <div className="space-y-3 mb-6">
        {CLIENT_CONCERNS.map((concern, index) => {
          const isSelected = selectedConcern === concern.id;
          return (
            <motion.button
              key={concern.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                onConcernChange(isSelected ? null : concern.id);
                if (!isSelected) onCustomConcernChange("");
              }}
              className={`
                w-full p-4 rounded-xl text-left transition-all duration-200
                ${isSelected ? "ring-2 ring-offset-2" : "hover:scale-[1.01]"}
              `}
              style={{
                backgroundColor: isSelected
                  ? FORM_THEME.progressBar
                  : FORM_THEME.badgeBackground,
                color: isSelected ? FORM_THEME.buttonText : FORM_THEME.title,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5
                    flex items-center justify-center
                  `}
                  style={{
                    borderColor: isSelected
                      ? FORM_THEME.buttonText
                      : FORM_THEME.progressBar,
                  }}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: FORM_THEME.buttonText }}
                    />
                  )}
                </div>
                <div>
                  <span className="font-semibold block mb-1">
                    {concern.label}
                  </span>
                  <span
                    className="text-sm opacity-80"
                    style={{
                      color: isSelected
                        ? FORM_THEME.buttonText
                        : FORM_THEME.description,
                    }}
                  >
                    {concern.description}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Label
          htmlFor="custom-concern"
          className="text-sm font-medium mb-2 block"
          style={{ color: FORM_THEME.title }}
        >
          Ou se preferir escreva com suas palavras:
        </Label>
        <Textarea
          id="custom-concern"
          value={customConcern}
          onChange={(e) => {
            onCustomConcernChange(e.target.value);
            if (e.target.value) onConcernChange(null);
          }}
          placeholder="Descreva a principal preocupação dos pais..."
          className="min-h-[100px] resize-none"
          style={{
            backgroundColor: FORM_THEME.badgeBackground,
            borderColor: "transparent",
            color: FORM_THEME.title,
          }}
        />
      </motion.div>
    </div>
  );
}
