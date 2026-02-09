"use client";

import { SearchBar } from "./search-bar";

export function HeroSection() {
  return (
    <section className="w-full bg-white px-4 md:px-6 relative z-10">
      <div className="max-w-[1600px] mx-auto relative">
        {/* Hero Block - Rounded container with image */}
        <div 
          className="relative w-full h-[500px] md:h-[600px] rounded-[20px] md:rounded-[24px] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000')`,
          }}
        >
          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Floating badge top right */}
          <div className="absolute top-6 right-6 bg-white rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
            <span className="text-sm text-gray-700">Baixe o app</span>
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
              </div>
              <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-serif font-normal leading-tight max-w-4xl">
              Encontre quartos incríveis, compare preços e
              <br className="hidden md:block" />
              reserve suas férias dos sonhos facilmente
            </h1>
            <p className="text-white/90 text-sm md:text-base mt-4 max-w-2xl">
              Busque hospedagens confiáveis para estadias inesquecíveis e reservas sem complicações. 
              Encontre os melhores quartos em segundos com facilidade e confiança!
            </p>
          </div>
        </div>

        {/* Search Bar - FORA do overflow-hidden, posicionado relativamente ao container pai */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-5xl px-6 z-50">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
