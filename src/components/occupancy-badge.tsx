import { Badge } from "@/components/ui/badge";
import { occupancyLevel, type OccupancyLevel } from "@/lib/pricing";

const LABEL: Record<OccupancyLevel, string> = {
  full: "Almost full",
  high: "High demand",
  normal: "Normal",
  low: "Low demand",
};

const VARIANT = {
  full: "default",
  high: "secondary",
  normal: "outline",
  low: "destructive",
} as const;

/** Ocupación en % con su nivel en texto (no depende solo del color). */
export function OccupancyBadge({ occupancy }: { occupancy: number }) {
  const level = occupancyLevel(occupancy);
  return (
    <Badge variant={VARIANT[level]}>
      {Math.round(occupancy * 100)}% · {LABEL[level]}
    </Badge>
  );
}
