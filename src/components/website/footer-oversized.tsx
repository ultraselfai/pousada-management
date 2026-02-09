"use client";

import Image from "next/image";

export function FooterOversized() {
  return (
    <footer className="relative py-20 md:py-32 px-4 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Oversized Typography */}
        <div className="relative">
          {/* POUSADA */}
          <h2 className="text-[80px] md:text-[120px] lg:text-[180px] font-serif font-normal leading-none tracking-tight text-gray-900 mb-4">
            POUSADA—
          </h2>
          
          {/* CONTATO with overlaying images */}
          <div className="relative">
            <h2 className="text-[80px] md:text-[120px] lg:text-[180px] font-serif font-normal leading-none tracking-tight text-gray-900">
              CONTATO
            </h2>
            
            {/* Overlaying Images */}
            <div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-40 h-56 md:w-56 md:h-72 rounded-2xl overflow-hidden shadow-xl z-10">
              <Image
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600"
                alt="Pousada"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-40 h-56 md:w-56 md:h-72 rounded-2xl overflow-hidden shadow-xl z-10">
              <Image
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600"
                alt="Quarto"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 pt-12 border-t border-gray-200">
          {/* Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/" className="hover:text-[#ff0000] transition-colors">Início</a></li>
              <li><a href="/quartos" className="hover:text-[#ff0000] transition-colors">Quartos</a></li>
              <li><a href="/sobre" className="hover:text-[#ff0000] transition-colors">Sobre</a></li>
              <li><a href="/contato" className="hover:text-[#ff0000] transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-2 text-gray-600">
              <li>+55 (11) 9999-9999</li>
              <li>contato@pousada.com.br</li>
              <li>Rua Example, 123</li>
              <li>São Paulo - SP</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Redes Sociais</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-[#ff0000] transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-[#ff0000] transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-[#ff0000] transition-colors">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>&copy; 2026 Pousada Management. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
