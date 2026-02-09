"use client";

import { RoomCard } from "./room-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const rooms = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000",
    title: "Suíte Deluxe",
    badge: "Mais Procurado"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000",
    title: "Bangalô na Praia"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000",
    title: "Quarto Vista Mar",
    badge: "Promocional"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000",
    title: "Suíte Premium"
  }
];

export function RoomsSection() {
  return (
    <section className="py-20 md:py-32 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-sm uppercase tracking-wider text-[#ff5252] mb-2">Destaque</p>
            <h2 className="text-4xl md:text-5xl font-serif font-normal text-gray-900">
              Explore os Melhores Quartos
            </h2>
          </div>
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-12 h-12 border-gray-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-12 h-12 border-gray-300"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-[#ff0000] hover:bg-[#ff5252] text-white rounded-full px-8"
          >
            Ver Todos os Quartos
          </Button>
        </div>
      </div>
    </section>
  );
}
