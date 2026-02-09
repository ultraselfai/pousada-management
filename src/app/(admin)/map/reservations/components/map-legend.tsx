"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookingStatus } from "@/generated/prisma/client";
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from "../constants";

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
  const statuses: BookingStatus[] = [
    "PRE_BOOKING",
    "CONFIRMED",
    "CHECKED_IN",
    "CHECKED_OUT",
    "CANCELLED",
  ];

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {statuses.map((status) => (
        <div key={status} className="flex items-center gap-2">
          <div
            className={cn(
              "w-4 h-4 rounded",
              BOOKING_STATUS_COLORS[status]
            )}
          />
          <span className="text-sm text-muted-foreground">
            {BOOKING_STATUS_LABELS[status]}
          </span>
        </div>
      ))}
    </div>
  );
}
