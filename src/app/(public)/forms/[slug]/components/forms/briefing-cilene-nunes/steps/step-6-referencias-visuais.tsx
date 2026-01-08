/**
 * Step 6: Referências Visuais - Like/Dislike (DEC-29)
 */

"use client";

import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import Image from "next/image";
import { StepHeader } from "../ui-components";
import { LOGO_REFERENCES, FORM_THEME } from "../types";

interface Step6Props {
  references: { id: string; liked: boolean | null }[];
  onReferenceChange: (id: string, liked: boolean | null) => void;
}

export function Step6ReferenciasVisuais({
  references,
  onReferenceChange,
}: Step6Props) {
  const getReference = (id: string) => references.find((r) => r.id === id);

  return (
    <div>
      <StepHeader
        title="Referências Visuais"
        description="Marque com Gostei ou Não Gostei nas referências de logos abaixo"
      />

      {/* Images Grid */}
      <div className="grid grid-cols-2 gap-4">
        {LOGO_REFERENCES.map((ref, index) => {
          const refData = getReference(ref.id);
          const liked = refData?.liked;

          return (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: FORM_THEME.badgeBackground }}
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-200">
                <Image
                  src={ref.src}
                  alt={ref.alt}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    // Fallback for missing images
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23E5E5E5' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' font-family='sans-serif' font-size='14' text-anchor='middle' dy='.3em'%3ELogo " +
                      (index + 1) +
                      "%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Like/Dislike Buttons */}
              <div className="flex">
                <button
                  onClick={() =>
                    onReferenceChange(ref.id, liked === false ? null : false)
                  }
                  className={`
                    flex-1 py-3 flex items-center justify-center gap-2
                    transition-all duration-200
                    ${liked === false ? "bg-red-500 text-white" : "bg-transparent text-gray-400 hover:bg-red-50"}
                  `}
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span className="text-sm font-medium">Não gostei</span>
                </button>
                <button
                  onClick={() =>
                    onReferenceChange(ref.id, liked === true ? null : true)
                  }
                  className={`
                    flex-1 py-3 flex items-center justify-center gap-2
                    transition-all duration-200
                    ${liked === true ? "bg-green-500 text-white" : "bg-transparent text-gray-400 hover:bg-green-50"}
                  `}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Gostei</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
