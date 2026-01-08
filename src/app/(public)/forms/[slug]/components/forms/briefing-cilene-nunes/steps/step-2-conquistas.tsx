/**
 * Step 2: Conquistas (DEC-29)
 * Maiores conquistas e orgulhos na área
 */

"use client";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { StepHeader } from "../ui-components";
import { FORM_THEME } from "../types";

interface Step2Props {
  value: string;
  onChange: (value: string) => void;
}

export function Step2Conquistas({ value, onChange }: Step2Props) {
  return (
    <div>
      <StepHeader
        title="Conquistas"
        description="Compartilhe suas maiores conquistas na área, seja formações, transformações geradas e o que você se recordar que te dá orgulho de fazer o que você faz:"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Suas formações, certificações, resultados, depoimentos, momentos marcantes..."
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
