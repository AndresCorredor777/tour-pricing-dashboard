import { KpiCard } from "@/components/kpi-card";
import { PricingSimulator } from "@/components/pricing-simulator";
import { ToursTable } from "@/components/tours-table";
import { isAtRisk } from "@/lib/pricing";
import { withPrices } from "@/lib/tours";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Server Component: los cálculos corren en el servidor; solo el simulador va al cliente.
export default function Home() {
  const tours = withPrices();
  const avgOccupancy = tours.reduce((s, t) => s + t.occupancy, 0) / tours.length;
  const atRisk = tours.filter((t) => isAtRisk(t.occupancy, t.daysToDeparture));
  const openSeats = tours.reduce((s, t) => s + (t.capacity - t.booked), 0);
  const revenueBase = tours.reduce((s, t) => s + (t.capacity - t.booked) * t.basePrice, 0);
  const revenueSuggested = tours.reduce((s, t) => s + (t.capacity - t.booked) * t.suggestion.price, 0);
  // El simulador arranca en el tour con menos ocupación entre los que están en riesgo.
  const focus = [...(atRisk.length ? atRisk : tours)].sort((a, b) => a.occupancy - b.occupancy)[0];

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6">
      <header className="grid gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Tour pricing</h1>
        <p className="text-muted-foreground">
          Suggested prices for upcoming departures, based on occupancy and days left. Demo with synthetic data.
        </p>
      </header>

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Average occupancy" value={`${Math.round(avgOccupancy * 100)}%`} hint={`${tours.length} departures`} />
        <KpiCard
          label="Departures at risk"
          value={String(atRisk.length)}
          hint="7 days or less and under half full"
        />
        <KpiCard
          label="Open seats at suggested prices"
          value={usd.format(revenueSuggested)}
          hint={`${openSeats} seats · ${usd.format(revenueBase)} at base prices`}
        />
      </section>

      <section aria-labelledby="departures" className="grid gap-3">
        <h2 id="departures" className="text-xl font-semibold">Departures</h2>
        <ToursTable tours={tours} />
      </section>

      <section aria-labelledby="simulator" className="grid gap-3">
        <h2 id="simulator" className="text-xl font-semibold">Simulator</h2>
        <PricingSimulator
          tourName={focus.name}
          basePrice={focus.basePrice}
          initialOccupancy={focus.occupancy}
          initialDays={focus.daysToDeparture}
        />
      </section>
    </main>
  );
}
