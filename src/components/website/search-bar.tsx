"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Home, DollarSign, ChevronDown } from "lucide-react";

export function SearchBar() {
  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl p-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
        {/* Location */}
        <div className="p-4 md:border-r border-gray-100">
          <label className="text-sm font-medium text-gray-900 block mb-2">Localização</label>
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Ubatuba, Brasil</span>
            <ChevronDown className="w-4 h-4 ml-auto" />
          </div>
        </div>

        {/* Type */}
        <div className="p-4 md:border-r border-gray-100">
          <label className="text-sm font-medium text-gray-900 block mb-2">Tipo</label>
          <div className="flex items-center gap-2 text-gray-500">
            <Home className="w-4 h-4" />
            <span className="text-sm">Suíte</span>
            <ChevronDown className="w-4 h-4 ml-auto" />
          </div>
        </div>

        {/* Price */}
        <div className="p-4 md:border-r border-gray-100">
          <label className="text-sm font-medium text-gray-900 block mb-2">Preço</label>
          <div className="flex items-center gap-2 text-gray-500">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">R$ 200 - R$ 500</span>
            <ChevronDown className="w-4 h-4 ml-auto" />
          </div>
        </div>

        {/* Search Button */}
        <div className="p-2 flex items-center justify-center">
          <Button 
            className="w-full bg-[#ff0000] hover:bg-[#ff5252] text-white rounded-xl h-14 text-sm font-semibold"
          >
            Buscar Quartos
          </Button>
        </div>
      </div>
    </div>
  );
}
