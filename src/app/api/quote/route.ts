import { type NextRequest } from "next/server";
import { PriceInputError, suggestPrice } from "@/lib/pricing";

// GET /api/quote?basePrice=60&occupancy=0.4&days=3 → precio sugerido y motivos.
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const raw = {
    basePrice: params.get("basePrice"),
    occupancy: params.get("occupancy"),
    days: params.get("days"),
  };
  if (raw.basePrice === null || raw.occupancy === null || raw.days === null) {
    return Response.json({ error: "basePrice, occupancy and days are required" }, { status: 400 });
  }
  try {
    const suggestion = suggestPrice({
      basePrice: Number(raw.basePrice),
      occupancy: Number(raw.occupancy),
      daysToDeparture: Number(raw.days),
    });
    return Response.json(suggestion);
  } catch (err) {
    if (err instanceof PriceInputError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
