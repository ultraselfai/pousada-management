/**
 * Step 10: Paleta de Cores (DEC-29)
 * Permite escolher até 2 paletas
 */

"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { StepHeader } from "../ui-components";
import { COLOR_PALETTES, FORM_THEME } from "../types";

interface Step10Props {
  selectedPalettes: string[];
  onPalettesChange: (palettes: string[]) => void;
}

const MAX_PALETTES = 2;

export function Step10PaletaCores({
  selectedPalettes,
  onPalettesChange,
}: Step10Props) {
  const handlePaletteClick = (paletteId: string) => {
    if (selectedPalettes.includes(paletteId)) {
      // Remove se já selecionado
      onPalettesChange(selectedPalettes.filter((id) => id !== paletteId));
    } else if (selectedPalettes.length < MAX_PALETTES) {
      // Adiciona se ainda não atingiu o limite
      onPalettesChange([...selectedPalettes, paletteId]);
    }
  };

  return (
    <div>
      <StepHeader
        title="Paleta de Cores"
        description="Qual destas combinações vibra na mesma frequência da sua marca? Escolha até 2 paletas."
      />

      {/* Selection counter */}
      <div 
        className="text-center mb-4 text-sm font-medium"
        style={{ color: FORM_THEME.description }}
      >
        {selectedPalettes.length} de {MAX_PALETTES} selecionadas
      </div>

      {/* Palettes Grid */}
      <div className="grid grid-cols-1 gap-4">
        {COLOR_PALETTES.map((palette, index) => {
          const isSelected = selectedPalettes.includes(palette.id);
          const isDisabled = !isSelected && selectedPalettes.length >= MAX_PALETTES;

          return (
            <motion.button
              key={palette.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => handlePaletteClick(palette.id)}
              disabled={isDisabled}
              className={`
                relative p-5 rounded-xl text-left transition-all duration-200
                ${isSelected ? "ring-2 ring-offset-2" : ""}
                ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01]"}
              `}
              style={{
                backgroundColor: FORM_THEME.badgeBackground,
                ...(isSelected && { ringColor: FORM_THEME.progressBar }),
              }}
            >
              {/* Selected Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: FORM_THEME.progressBar }}
                >
                  <Check className="w-4 h-4" style={{ color: FORM_THEME.buttonText }} />
                </motion.div>
              )}

              {/* Color Circles */}
              <div className="flex gap-3 mb-4">
                {palette.colors.map((color, colorIndex) => (
                  <motion.div
                    key={colorIndex}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.08 + colorIndex * 0.05 }}
                    className="w-12 h-12 rounded-full shadow-sm border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Palette Info */}
              <div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: FORM_THEME.title }}
                >
                  {palette.name}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: FORM_THEME.description }}
                >
                  {palette.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
