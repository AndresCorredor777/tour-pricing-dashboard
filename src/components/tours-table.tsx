import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OccupancyBadge } from "@/components/occupancy-badge";
import { PriceDelta } from "@/components/price-delta";
import { isAtRisk } from "@/lib/pricing";
import type { TourWithPrice } from "@/lib/tours";

export function ToursTable({ tours }: { tours: TourWithPrice[] }) {
  return (
    <Table>
      <TableCaption>Synthetic demo data. Suggested prices follow the rules in src/lib/pricing.ts.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Tour</TableHead>
          <TableHead>Occupancy</TableHead>
          <TableHead className="text-right">Days left</TableHead>
          <TableHead className="text-right">Base</TableHead>
          <TableHead>Suggested</TableHead>
          <TableHead>Why</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tours.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
              No upcoming departures.
            </TableCell>
          </TableRow>
        ) : null}
        {tours.map((t) => (
          <TableRow key={t.id}>
            <TableCell>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">
                {t.city}
                {isAtRisk(t.occupancy, t.daysToDeparture) ? " · at risk" : ""}
              </div>
            </TableCell>
            <TableCell>
              <OccupancyBadge occupancy={t.occupancy} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{t.daysToDeparture}</TableCell>
            <TableCell className="text-right tabular-nums">${t.basePrice}</TableCell>
            <TableCell>
              <PriceDelta basePrice={t.basePrice} price={t.suggestion.price} />
            </TableCell>
            <TableCell className="max-w-64 text-xs whitespace-normal text-muted-foreground">
              {t.suggestion.reasons.join(" · ")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
