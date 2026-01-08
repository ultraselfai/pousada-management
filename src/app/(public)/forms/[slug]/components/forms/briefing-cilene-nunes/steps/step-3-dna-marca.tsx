/**
 * Step 3: DNA da Marca - Tag Selector (DEC-29)
 */

"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepHeader } from "../ui-components";
import { BRAND_KEYWORDS, FORM_THEME } from "../types";

interface Step3Props {
  selectedKeywords: string[];
  customKeywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  onCustomKeywordsChange: (keywords: string[]) => void;
}

export function Step3DNAMarca({
  selectedKeywords,
  customKeywords,
  onKeywordsChange,
  onCustomKeywordsChange,
}: Step3Props) {
  const [newKeyword, setNewKeyword] = useState("");
  const [showInput, setShowInput] = useState(false);

  const toggleKeyword = (id: string) => {
    if (selectedKeywords.includes(id)) {
      onKeywordsChange(selectedKeywords.filter((k) => k !== id));
    } else {
      onKeywordsChange([...selectedKeywords, id]);
    }
  };

  const addCustomKeyword = () => {
    if (newKeyword.trim() && !customKeywords.includes(newKeyword.trim())) {
      onCustomKeywordsChange([...customKeywords, newKeyword.trim()]);
      setNewKeyword("");
      setShowInput(false);
    }
  };

  const removeCustomKeyword = (keyword: string) => {
    onCustomKeywordsChange(customKeywords.filter((k) => k !== keyword));
  };

  // Embaralhar keywords apenas uma vez (não a cada render)
  const shuffledKeywords = useMemo(() => {
    return [...BRAND_KEYWORDS].sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div>
      <StepHeader
        title="O DNA da Marca"
        description="Selecione as palavras que melhor definem a sensação que você quer que sua marca passe. (Pode adicionar outras se sentir falta)"
      />

      {/* Keywords Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {shuffledKeywords.map((keyword, index) => {
          const isSelected = selectedKeywords.includes(keyword.id);
          return (
            <motion.button
              key={keyword.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => toggleKeyword(keyword.id)}
              className={`
                p-4 rounded-xl text-left transition-all duration-200
                ${
                  isSelected
                    ? "ring-2 ring-offset-2"
                    : "hover:scale-[1.02]"
                }
              `}
              style={{
                backgroundColor: isSelected
                  ? FORM_THEME.progressBar
                  : FORM_THEME.badgeBackground,
                color: isSelected ? FORM_THEME.buttonText : FORM_THEME.title,
              }}
            >
              <span className="font-medium block">{keyword.label}</span>
              <span
                className="text-xs opacity-70"
                style={{
                  color: isSelected
                    ? FORM_THEME.buttonText
                    : FORM_THEME.description,
                }}
              >
                {keyword.subtitle}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Keywords */}
      {customKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {customKeywords.map((keyword) => (
            <motion.span
              key={keyword}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: FORM_THEME.progressBar,
                color: FORM_THEME.buttonText,
              }}
            >
              {keyword}
              <button
                onClick={() => removeCustomKeyword(keyword)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.span>
          ))}
        </div>
      )}

      {/* Add Custom Keyword */}
      {showInput ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex gap-2"
        >
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Digite um adjetivo..."
            className="flex-1"
            style={{
              backgroundColor: FORM_THEME.badgeBackground,
              borderColor: "transparent",
              color: FORM_THEME.title,
            }}
            onKeyDown={(e) => e.key === "Enter" && addCustomKeyword()}
            autoFocus
          />
          <Button
            type="button"
            onClick={addCustomKeyword}
            style={{
              backgroundColor: FORM_THEME.progressBar,
              color: FORM_THEME.buttonText,
            }}
          >
            Adicionar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setShowInput(false);
              setNewKeyword("");
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowInput(true)}
          className="w-full"
          style={{
            borderColor: FORM_THEME.progressBar,
            color: FORM_THEME.progressBar,
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar novo adjetivo
        </Button>
      )}
    </div>
  );
}
