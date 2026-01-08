/**
 * Step 1: Ponto Zero (DEC-29)
 * Área de atuação, trajetória e transformação
 */

"use client";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { StepHeader } from "../ui-components";
import { FORM_THEME } from "../types";

interface Step1Props {
  value: string;
  onChange: (value: string) => void;
}

export function Step1PontoZero({ value, onChange }: Step1Props) {
  return (
    <div>
      <StepHeader
        title="Ponto Zero"
        description="Para darmos início, gostaria que me contasse um pouco mais sobre a sua área de atuação, trajetória e qual a transformação que ela gera:"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Conte sobre sua área, sua jornada e o impacto que você gera..."
          className="min-h-[180px] resize-none text-base leading-relaxed"
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
