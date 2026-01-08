/**
 * Step 11: Ranking de Elementos - Drag and Drop (DEC-29)
 * 
 * Versão profissional com DragOverlay e animações suaves
 */

"use client";

import { useMemo } from "react";
import { StepHeader } from "../ui-components";
import { SortableList } from "../sortable-list";
import { BRAND_ELEMENTS, ELEMENT_POSITIONS, FORM_THEME } from "../types";

type BrandElement = (typeof BRAND_ELEMENTS)[number];

interface Step11Props {
  ranking: string[];
  onRankingChange: (ranking: string[]) => void;
}

export function Step11RankingElementos({
  ranking,
  onRankingChange,
}: Step11Props) {
  // Get the actual element objects in order
  const orderedElements = useMemo(() => {
    return ranking
      .map((id) => BRAND_ELEMENTS.find((el) => el.id === id))
      .filter((el): el is BrandElement => el !== undefined);
  }, [ranking]);

  const handleReorder = (newItems: BrandElement[]) => {
    onRankingChange(newItems.map((item) => item.id));
  };

  return (
    <div>
      <StepHeader
        title="Ranking de Elementos"
        description="Arraste para definir a hierarquia dos símbolos da sua marca"
      />

      {/* Position Legend */}
      <div
        className="p-3 rounded-xl mb-4 space-y-1.5"
        style={{ backgroundColor: FORM_THEME.badgeBackground }}
      >
        {ELEMENT_POSITIONS.slice(0, 5).map((pos, index) => (
          <div key={pos.position} className="flex items-center gap-2 text-xs">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                backgroundColor: index < 4 ? FORM_THEME.progressBar : "#EF4444",
                color: FORM_THEME.buttonText,
              }}
            >
              {pos.position}
            </div>
            <span style={{ color: FORM_THEME.title }}>
              <strong>{pos.label}</strong> - {pos.description}
            </span>
          </div>
        ))}
      </div>

      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: FORM_THEME.badgeBackground }}
      >
        <SortableList
          items={orderedElements}
          getItemId={(item) => item.id}
          onReorder={handleReorder}
          renderItem={(item, index) => (
            <>
              {/* Icon */}
              <span className="text-2xl">{item.icon}</span>

              {/* Element Info */}
              <div className="flex-1 min-w-0">
                <span
                  className="font-medium block text-sm"
                  style={{ color: FORM_THEME.title }}
                >
                  {item.label}
                </span>
                {ELEMENT_POSITIONS[index] && (
                  <span
                    className="text-xs opacity-70 block truncate"
                    style={{ color: FORM_THEME.description }}
                  >
                    {ELEMENT_POSITIONS[index].label}
                  </span>
                )}
              </div>
            </>
          )}
        />
      </div>

      <p
        className="text-center text-sm mt-4 opacity-60"
        style={{ color: FORM_THEME.description }}
      >
        Arraste os itens para reordenar • O último item será eliminado
      </p>
    </div>
  );
}
