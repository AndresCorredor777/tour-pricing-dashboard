import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OccupancyBadge } from "@/components/occupancy-badge";
import { PriceDelta } from "@/components/price-delta";
import { isAtRisk } from "@/lib/pricing";
import type { TourWithPrice } from "@/lib/tours";

/** En pantallas angostas: una tarjeta por salida, con el precio sugerido siempre visible. */
function ToursList({ tours }: { tours: TourWithPrice[] }) {
  if (tours.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No upcoming departures.</p>;
  }
  return (
    <ul className="grid gap-3">
      {tours.map((t) => (
        <li key={t.id} className="grid gap-2 rounded-lg border p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">
                {t.city} · {t.daysToDeparture} days left · base ${t.basePrice}
                {isAtRisk(t.occupancy, t.daysToDeparture) ? " · at risk" : ""}
              </div>
            </div>
            <PriceDelta basePrice={t.basePrice} price={t.suggestion.price} factor={t.suggestion.factor} />
          </div>
          <OccupancyBadge occupancy={t.occupancy} />
          <p className="text-xs text-muted-foreground">{t.suggestion.reasons.join(" · ")}</p>
        </li>
      ))}
    </ul>
  );
}

export function ToursTable({ tours }: { tours: TourWithPrice[] }) {
  return (
    <>
      <div className="sm:hidden">
        <ToursList tours={tours} />
      </div>
      <div className="hidden sm:block">
        <ToursGrid tours={tours} />
      </div>
    </>
  );
}

function ToursGrid({ tours }: { tours: TourWithPrice[] }) {
  return (
    <Table>
      <TableCaption>Synthetic demo data. Each suggested price lists the rules that produced it.</TableCaption>
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
              <PriceDelta basePrice={t.basePrice} price={t.suggestion.price} factor={t.suggestion.factor} />
            </TableCell>
            <TableCell className="min-w-56 max-w-72 text-xs whitespace-normal text-muted-foreground">
              {t.suggestion.reasons.join(" · ")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
