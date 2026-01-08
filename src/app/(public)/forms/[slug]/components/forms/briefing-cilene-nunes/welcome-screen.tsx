/**
 * Welcome Screen - Briefing DNA da Marca
 *
 * Tela de boas-vindas com fundo laranja e animações dramáticas.
 */

"use client";

import { motion } from "framer-motion";
import { FORM_THEME } from "./types";

interface WelcomeScreenProps {
  onStart: () => void;
}

// Variantes de animação para texto linha por linha
const lineVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: "blur(10px)",
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
  },
};

// Variante para o botão com efeito de "pop"
const buttonVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    }
  },
  hover: { 
    scale: 1.08,
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  tap: { 
    scale: 0.95,
  },
};

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.8 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ backgroundColor: FORM_THEME.buttonBackground }}
    >
      <div className="max-w-lg text-center">
        {/* "Olá!" com entrada dramática */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.3, 
            duration: 0.8,
            type: "spring",
            stiffness: 150,
          }}
          className="text-5xl md:text-7xl leading-tight mb-8"
          style={{
            fontFamily: FORM_THEME.fontTitle,
            color: FORM_THEME.background,
          }}
        >
          Olá!
        </motion.h1>

        {/* Linhas de texto animadas individualmente */}
        <div className="space-y-2 mb-14">
          <motion.p
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.0, duration: 0.7, ease: "easeOut" }}
            className="text-2xl md:text-3xl"
            style={{
              fontFamily: FORM_THEME.fontTitle,
              color: FORM_THEME.background,
            }}
          >
            Vamos desbravar juntos
          </motion.p>
          
          <motion.p
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.4, duration: 0.7, ease: "easeOut" }}
            className="text-2xl md:text-3xl"
            style={{
              fontFamily: FORM_THEME.fontTitle,
              color: FORM_THEME.background,
            }}
          >
            a essência da marca
          </motion.p>
          
          <motion.p
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.8, duration: 0.7, ease: "easeOut" }}
            className="text-2xl md:text-4xl font-medium"
            style={{
              fontFamily: FORM_THEME.fontTitle,
              color: FORM_THEME.background,
            }}
          >
            Cilene Nunes?
          </motion.p>
        </div>

        {/* Botão com entrada "pop" e pulse suave */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: 2.8,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          whileHover={{ 
            scale: 1.08,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-10 py-5 text-lg rounded-full shadow-xl cursor-pointer"
          style={{
            fontFamily: FORM_THEME.fontBody,
            fontWeight: 600,
            backgroundColor: FORM_THEME.background,
            color: FORM_THEME.buttonBackground,
          }}
        >
          <motion.span
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              delay: 4.0,
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="inline-block"
          >
            Iniciar Briefing
          </motion.span>
        </motion.button>
      </div>

      {/* Partículas decorativas animadas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 2, duration: 1.5 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Círculo decorativo 1 */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full"
          style={{ backgroundColor: FORM_THEME.background }}
        />
        
        {/* Círculo decorativo 2 */}
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            x: [0, -15, 0],
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full"
          style={{ backgroundColor: FORM_THEME.background }}
        />
        
        {/* Círculo decorativo 3 */}
        <motion.div
          animate={{ 
            y: [0, 25, 0],
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/2 right-1/6 w-16 h-16 rounded-full"
          style={{ backgroundColor: FORM_THEME.background }}
        />
      </motion.div>

      {/* Gradiente decorativo inferior */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(to top, rgba(250, 249, 245, 0.15), transparent)`,
        }}
      />
    </motion.div>
  );
}
