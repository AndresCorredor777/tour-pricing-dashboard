import { cn } from "@/lib/utils";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type Props = {
  basePrice: number;
  price: number;
  /**
   * Factor de la regla (p. ej. 1.25). Si viene, el % sale de aquí y coincide con el motivo;
   * calcularlo desde el precio redondeado daría +24% para $25 → $31.
   */
  factor?: number;
};

/** Precio sugerido frente al base, con la diferencia en % y en palabras para lectores de pantalla. */
export function PriceDelta({ basePrice, price, factor }: Props) {
  const pct = Math.round(factor !== undefined ? (factor - 1) * 100 : ((price - basePrice) / basePrice) * 100);
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
