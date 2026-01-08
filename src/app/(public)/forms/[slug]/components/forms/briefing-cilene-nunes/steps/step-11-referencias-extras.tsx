/**
 * Step 11: Referências Extras
 * Campo de texto simples para nomes de marcas
 */

"use client";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { StepHeader } from "../ui-components";
import { FORM_THEME } from "../types";

interface Step11Props {
  brandReferences: string;
  onBrandReferencesChange: (value: string) => void;
}

export function Step11ReferenciasExtras({
  brandReferences,
  onBrandReferencesChange,
}: Step11Props) {
  return (
    <div>
      <StepHeader
        title="Referências Extras"
        description="Fora a imagem que você me mandou, existe alguma outra marca (pode ser de outra área, tipo loja de roupa ou café) que você acha linda?"
      />

      {/* Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Textarea
          value={brandReferences}
          onChange={(e) => onBrandReferencesChange(e.target.value)}
          placeholder="Escreva o nome de marcas que você admira..."
          className="min-h-[120px] resize-none text-base"
          style={{
            backgroundColor: FORM_THEME.badgeBackground,
            borderColor: "transparent",
            color: FORM_THEME.title,
          }}
        />
      </motion.div>

      <p
        className="text-sm text-center"
        style={{ color: FORM_THEME.description }}
      >
        Este campo é opcional
      </p>
    </div>
  );
}
