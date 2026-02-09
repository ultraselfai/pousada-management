"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function DiscoverSection() {
  return (
    <section className="w-full bg-white py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Icon + Tags + Card com imagem */}
          <div className="md:col-span-5">
            {/* Icon + Tags */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600">Piscina</span>
                <span className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm">Spa</span>
                <span className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600">Restaurante</span>
              </div>
            </div>

            {/* Card com imagem + info */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card imagem */}
              <div className="relative h-[280px] rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800"
                  alt="Piscina"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Button 
                    size="sm"
                    className="bg-[#ff0000] hover:bg-[#ff5252] text-white rounded-full text-xs"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>

              {/* Card info - vermelho/terra */}
              <div className="bg-[#ff5252] rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-white text-lg font-semibold mb-3">
                    Quartos confortáveis com
                    excelente atendimento
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Serviço de quarto com entregas rápidas.
                    Consultas virtuais com equipe especializada.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 mt-6">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-10 h-10 border-gray-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                size="icon"
                className="rounded-full w-10 h-10 bg-gray-900 text-white hover:bg-gray-800"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Right Column - Title + Description + Image */}
          <div className="md:col-span-7">
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-gray-900 leading-tight mb-6">
              Descubra Excelência
              <br />
              em Hospitalidade. Hotéis
              <br />
              Confiáveis Você Pode
              <br />
              Contar <span className="inline-flex items-center justify-center border-2 border-gray-200 rounded-full px-4 py-1 text-sm font-sans ml-2">+</span>
            </h2>

            {/* Info box */}
            <div className="flex items-start gap-4 mb-8">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs">✱</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                Nossas instalações médicas de primeira linha oferecem uma ampla gama de serviços, 
                incluindo diagnósticos avançados, tratamentos especializados e atendimento de emergência 24h.
              </p>
            </div>

            {/* Image */}
            <div className="relative h-[300px] rounded-3xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200"
                alt="Quarto luxuoso"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
