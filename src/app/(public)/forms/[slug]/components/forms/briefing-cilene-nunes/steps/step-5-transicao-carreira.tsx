/**
 * Step 5: Transição de Carreira (DEC-29)
 */

"use client";

import { motion } from "framer-motion";
import { StepHeader } from "../ui-components";
import { CAREER_POSITIONS, FORM_THEME } from "../types";

interface Step5Props {
  selectedPosition: string | null;
  onPositionChange: (position: string | null) => void;
}

export function Step5TransicaoCarreira({
  selectedPosition,
  onPositionChange,
}: Step5Props) {
  return (
    <div>
      <StepHeader
        title="A Transição de Carreira"
        description="Você foi professora por muito tempo e agora está se formando como Neuropsicopedagoga. Como você quer que essa experiência apareça na marca?"
      />

      {/* Options */}
      <div className="space-y-4">
        {CAREER_POSITIONS.map((position, index) => {
          const isSelected = selectedPosition === position.id;
          return (
            <motion.button
              key={position.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() =>
                onPositionChange(isSelected ? null : position.id)
              }
              className={`
                w-full p-5 rounded-xl text-left transition-all duration-200
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
                  <span className="font-semibold block mb-2">
                    {position.label}
                  </span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{
                      color: isSelected
                        ? `${FORM_THEME.buttonText}cc`
                        : FORM_THEME.description,
                    }}
                  >
                    {position.description}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
