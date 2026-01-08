/**
 * Step 7: Ranking de Referências - Drag and Drop (DEC-29)
 * 
 * Versão profissional com DragOverlay e animações suaves
 * Clique na imagem para ver em tela cheia
 */

"use client";

import { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { StepHeader } from "../ui-components";
import { SortableList } from "../sortable-list";
import { LOGO_REFERENCES, FORM_THEME } from "../types";
import { ImageModal } from "../image-modal";

interface LogoReference {
  id: string;
  src: string;
  alt: string;
}

interface Step7Props {
  likedIds: string[];
  ranking: string[];
  onRankingChange: (ranking: string[]) => void;
}

export function Step7RankingReferencias({
  likedIds,
  ranking,
  onRankingChange,
}: Step7Props) {
  // Sync ranking with liked items - always keep them in sync
  useEffect(() => {
    // Se não há likes, limpar ranking
    if (likedIds.length === 0) {
      if (ranking.length > 0) {
        onRankingChange([]);
      }
      return;
    }

    // Se ranking vazio, inicializar com likes
    if (ranking.length === 0) {
      onRankingChange(likedIds);
      return;
    }

    // Verificar se o ranking contém exatamente os mesmos itens que likedIds
    const rankingSet = new Set(ranking);
    const likedSet = new Set(likedIds);
    
    // Se são diferentes, atualizar ranking mantendo a ordem dos que ainda são válidos
    // e adicionando novos likes no final
    const hasExtraInRanking = ranking.some(id => !likedSet.has(id));
    const hasMissingInRanking = likedIds.some(id => !rankingSet.has(id));
    
    if (hasExtraInRanking || hasMissingInRanking) {
      // Manter ordem dos itens válidos + adicionar novos no final
      const validExisting = ranking.filter(id => likedSet.has(id));
      const newItems = likedIds.filter(id => !rankingSet.has(id));
      onRankingChange([...validExisting, ...newItems]);
    }
  }, [likedIds, ranking, onRankingChange]);

  // Get the actual reference objects in order
  const orderedReferences = useMemo(() => {
    // Usar likedIds diretamente se ranking não está sincronizado ainda
    const idsToUse = ranking.length > 0 ? ranking.filter(id => likedIds.includes(id)) : likedIds;
    return idsToUse
      .map((id) => LOGO_REFERENCES.find((ref) => ref.id === id))
      .filter((ref): ref is LogoReference => ref !== undefined);
  }, [ranking, likedIds]);

  const handleReorder = (newItems: LogoReference[]) => {
    onRankingChange(newItems.map((item) => item.id));
  };

  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

  if (likedIds.length === 0) {
    return (
      <div>
        <StepHeader
          title="Ranking das Referências"
          description="Você não selecionou nenhuma referência como 'Gostei'. Volte ao passo anterior para selecionar pelo menos uma."
        />
      </div>
    );
  }

  return (
    <div>
      <StepHeader
        title="Ranking das Referências"
        description="Arraste para ordenar. Toque na imagem para ampliar."
      />

      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: FORM_THEME.badgeBackground }}
      >
        <SortableList
          items={orderedReferences}
          getItemId={(item) => item.id}
          onReorder={handleReorder}
          renderItem={(item) => (
            <>
              {/* Image Thumbnail - clicável para ampliar */}
              <div 
                className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all"
                style={{ ['--tw-ring-color' as string]: FORM_THEME.progressBar }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage({ src: item.src, alt: item.alt });
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect fill='%23E5E5E5' width='56' height='56'/%3E%3Ctext x='28' y='32' text-anchor='middle' fill='%23999' font-size='12'%3EImg%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Label */}
              <span
                className="font-medium text-sm flex-1"
                style={{ color: FORM_THEME.title }}
              >
                {item.alt}
              </span>
            </>
          )}
        />
      </div>

      <p
        className="text-center text-sm mt-4 opacity-60"
        style={{ color: FORM_THEME.description }}
      >
        Segure e arraste para reordenar
      </p>

      {/* Modal de imagem em tela cheia */}
      <ImageModal
        isOpen={!!selectedImage}
        src={selectedImage?.src || ""}
        alt={selectedImage?.alt || ""}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
