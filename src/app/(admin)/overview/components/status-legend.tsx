"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RoomStatus } from "@/generated/prisma/client";
import { ROOM_STATUS_COLORS, ROOM_STATUS_LABELS } from "../constants";

interface StatusLegendProps {
  statusCounts: Record<RoomStatus, number>;
}

export function StatusLegend({ statusCounts }: StatusLegendProps) {
  const statuses = Object.entries(ROOM_STATUS_LABELS) as [RoomStatus, string][];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(([status, label]) => {
        const colors = ROOM_STATUS_COLORS[status];
        const count = statusCounts[status] || 0;

        return (
          <Badge
            key={status}
            variant="outline"
            className={cn(
              "gap-1.5 py-1 px-2.5",
              colors.bg,
              colors.text,
              colors.border
            )}
          >
            <span className="font-semibold">{count}</span>
            <span>{label}</span>
          </Badge>
        );
      })}
    </div>
  );
}
