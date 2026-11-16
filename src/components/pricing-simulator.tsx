"use client";

import { useEffect, useId, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { PriceDelta } from "@/components/price-delta";
import type { PriceInput, PriceSuggestion } from "@/lib/pricing";

export type GetQuote = (input: PriceInput, signal: AbortSignal) => Promise<PriceSuggestion>;

/** Cotización por REST: la usa la app. Storybook inyecta otra función sin red. */
export const fetchQuote: GetQuote = async ({ basePrice, occupancy, daysToDeparture }, signal) => {
  const qs = new URLSearchParams({
    basePrice: String(basePrice),
    occupancy: String(occupancy),
    days: String(daysToDeparture),
  });
  const res = await fetch(`/api/quote?${qs}`, { signal });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `Quote failed (${res.status})`);
  return body as PriceSuggestion;
};

type Props = {
  tourName: string;
  basePrice: number;
  initialOccupancy: number;
  initialDays: number;
  getQuote?: GetQuote;
};

export function PricingSimulator({ tourName, basePrice, initialOccupancy, initialDays, getQuote = fetchQuote }: Props) {
  const [occupancyPct, setOccupancyPct] = useState(Math.round(initialOccupancy * 100));
  const [days, setDays] = useState(initialDays);
  const [quote, setQuote] = useState<PriceSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const occId = useId();
  const daysId = useId();

  useEffect(() => {
    const controller = new AbortController();
    getQuote({ basePrice, occupancy: occupancyPct / 100, daysToDeparture: days }, controller.signal)
      .then((q) => {
        setQuote(q);
        setError(null);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Could not get a quote");
      });
    return () => controller.abort();
  }, [basePrice, occupancyPct, days, getQuote]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>What-if: {tourName}</CardTitle>
        <CardDescription>Move occupancy and days to departure to see how the rules react.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <label id={occId} className="flex justify-between text-sm font-medium">
            <span>Occupancy</span>
            <span className="tabular-nums">{occupancyPct}%</span>
          </label>
          <Slider
            aria-labelledby={occId}
            min={0}
            max={100}
            step={5}
            value={[occupancyPct]}
            onValueChange={(v) => setOccupancyPct(Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div className="grid gap-2">
          <label id={daysId} className="flex justify-between text-sm font-medium">
            <span>Days to departure</span>
            <span className="tabular-nums">{days}</span>
          </label>
          <Slider
            aria-labelledby={daysId}
            min={0}
            max={30}
            step={1}
            value={[days]}
            onValueChange={(v) => setDays(Array.isArray(v) ? v[0] : v)}
          />
        </div>

        <div aria-live="polite" className="rounded-lg border p-4">
          {error ? (
            <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>
          ) : quote ? (
            <div className="grid gap-2">
              <PriceDelta basePrice={basePrice} price={quote.price} />
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {quote.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Calculating…</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
