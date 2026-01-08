/**
 * Step 12: Tela de Conclusão com Confetti (DEC-29)
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { CheckCircle, MessageCircle } from "lucide-react";
import { FORM_THEME } from "../types";

interface CompletionScreenProps {
  isVisible: boolean;
}

export function CompletionScreen({ isVisible }: CompletionScreenProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setShowConfetti(true);

      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ backgroundColor: FORM_THEME.background }}
    >
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={[
            FORM_THEME.progressBar,
            "#FFD700",
            "#FF69B4",
            "#00CED1",
            "#9370DB",
            "#32CD32",
          ]}
        />
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${FORM_THEME.progressBar}20` }}
        >
          <CheckCircle
            className="w-12 h-12"
            style={{ color: FORM_THEME.progressBar }}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-4"
          style={{ color: FORM_THEME.title }}
        >
          Parabéns! 🎉
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl mb-6"
          style={{ color: FORM_THEME.title }}
        >
          Briefing concluído com sucesso!
        </motion.p>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: FORM_THEME.badgeBackground }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageCircle
              className="w-5 h-5"
              style={{ color: FORM_THEME.progressBar }}
            />
            <span
              className="font-semibold"
              style={{ color: FORM_THEME.title }}
            >
              Próximo passo:
            </span>
          </div>
          <p style={{ color: FORM_THEME.description }}>
            Tire print dessa tela e me mande no WhatsApp.
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-2"
        >
          {["🎨", "✨", "💜", "🌟", "🎯"].map((emoji, index) => (
            <motion.span
              key={index}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
              className="text-2xl"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
