"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";

export function AboutSection() {
  return (
    <section className="w-full bg-white pt-40 md:pt-48 pb-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header com badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 mb-6">
            <span className="text-sm text-gray-600">Conheça-nos</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-normal text-gray-900 leading-tight">
            Explore Estadias, Sobre Conforto, Sua Estadia,
            <br className="hidden md:block" />
            Nossa Prioridade
          </h2>
        </div>

        {/* Content Grid - 3 columns layout como na referência */}
        <div className="grid md:grid-cols-12 gap-6 items-start">
          
          {/* Coluna 1 - Texto + botão */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div className="border border-gray-200 rounded-full px-4 py-2 inline-flex self-start">
              <span className="text-sm text-gray-600">Sobre Nós</span>
            </div>
            <p className="text-gray-900 text-lg leading-relaxed">
              Pousada é uma plataforma confiável
              conectando viajantes com
              os melhores quartos em todo
              o país
            </p>
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-3 inline-flex items-center gap-2 self-start"
            >
              Saiba Mais
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-gray-900" />
              </div>
            </Button>
          </div>

          {/* Coluna 2 - Card grande central */}
          <div className="md:col-span-5">
            <div className="relative h-[400px] rounded-3xl overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000"
                alt="Hotel"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Overlay text */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <p className="text-white text-center text-lg font-medium leading-relaxed">
                  Uma plataforma versátil
                  <br />
                  oferecendo uma ampla gama de
                  <br />
                  opções de quartos e serviços
                </p>
              </div>

              {/* Bottom badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Ubatuba, Brasil</span>
                </div>
                <Button 
                  size="icon"
                  className="bg-[#ff0000] hover:bg-[#ff5252] text-white rounded-full w-10 h-10"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Coluna 3 - Cards menores com scroll */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Card pequeno */}
            <div className="relative h-[180px] rounded-3xl overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800"
                alt="Quarto"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs text-gray-700">outdoor</span>
              </div>

              {/* Info */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">Litoral Norte</span>
                </div>
                <Button 
                  size="icon"
                  className="bg-white/90 hover:bg-white text-gray-900 rounded-full w-8 h-8"
                >
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Texto descritivo */}
            <p className="text-gray-600 text-sm leading-relaxed">
              Explore o destino perfeito para
              conforto, relaxamento e luxo. Onde
              hospitalidade encontra excelência em cada
              estadia.
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-10 h-10 border-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full w-10 h-10 border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
