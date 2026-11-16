import { cn } from "@/lib/utils";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Precio sugerido frente al base, con la diferencia en % y en palabras para lectores de pantalla. */
export function PriceDelta({ basePrice, price }: { basePrice: number; price: number }) {
  const pct = Math.round(((price - basePrice) / basePrice) * 100);
  const direction = pct > 0 ? "up" : pct < 0 ? "down" : "same";
  return (
    <span className="inline-flex items-baseline gap-2 tabular-nums">
      <span className="font-semibold">{usd.format(price)}</span>
      <span
        className={cn(
          "text-xs",
          direction === "up" && "text-emerald-700 dark:text-emerald-400",
          direction === "down" && "text-red-700 dark:text-red-400",
          direction === "same" && "text-muted-foreground",
        )}
      >
        {direction === "same" ? "no change" : `${pct > 0 ? "+" : ""}${pct}%`}
        <span className="sr-only"> versus base price {usd.format(basePrice)}</span>
      </span>
    </span>
  );
}
