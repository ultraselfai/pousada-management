"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function Navbar() {
  return (
    <nav className="w-full bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">Pousada</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-sm text-gray-900 hover:text-[#ff0000] transition-colors">
              Home
            </Link>
            <Link href="/sobre" className="text-sm text-gray-600 hover:text-[#ff0000] transition-colors">
              Sobre Nós
            </Link>
            <Link href="/servicos" className="text-sm text-gray-600 hover:text-[#ff0000] transition-colors">
              Serviços
            </Link>
            <Link href="/quartos" className="text-sm text-gray-600 hover:text-[#ff0000] transition-colors">
              Quartos
            </Link>
            <Link href="/contato" className="text-sm text-gray-600 hover:text-[#ff0000] transition-colors">
              Contato
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200">
              <span className="text-sm text-gray-500">Buscar...</span>
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <Button 
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 py-2 text-sm font-medium flex items-center gap-2"
            >
              Reservar
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
