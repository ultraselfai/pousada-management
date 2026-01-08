/**
 * Step 12: O "Não" Absoluto (DEC-29)
 */

"use client";

import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { StepHeader } from "../ui-components";
import { FORM_THEME } from "../types";

interface Step12Props {
  value: string;
  onChange: (value: string) => void;
}

export function Step12NaoAbsoluto({ value, onChange }: Step12Props) {
  return (
    <div>
      <StepHeader
        title='O "Não" Absoluto'
        description="Existe alguma coisa (cor, forma ou símbolo) que você DETESTA e eu não devo usar de jeito nenhum?"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: Não gosto de rosa pink, formas muito geométricas, símbolos infantis demais..."
          className="min-h-[150px] resize-none text-base leading-relaxed"
          style={{
            backgroundColor: FORM_THEME.badgeBackground,
            borderColor: "transparent",
            color: FORM_THEME.title,
          }}
        />
        <p
          className="text-sm mt-3 text-center"
          style={{ color: FORM_THEME.description }}
        >
          Este campo é opcional, mas muito útil para evitar surpresas!
        </p>
      </motion.div>
    </div>
  );
}
