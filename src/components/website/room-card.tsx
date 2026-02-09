"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface RoomCardProps {
  image: string;
  title: string;
  description?: string;
  badge?: string;
}

export function RoomCard({ image, title, description, badge }: RoomCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Image */}
      <div className="relative h-80 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="text-sm font-semibold text-gray-900">{badge}</span>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full w-10 h-10"
        >
          <Heart className="w-5 h-5" />
        </Button>

        {/* Title on Image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-2xl font-semibold mb-1">{title}</h3>
          {description && (
            <p className="text-white/90 text-sm line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
