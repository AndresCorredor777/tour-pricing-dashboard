import { type NextRequest } from "next/server";
import { PriceInputError, suggestPrice, type PriceField } from "@/lib/pricing";

// Nombre de cada campo en el query string, para que el error hable el idioma del contrato.
const PARAM: Record<PriceField, string> = {
  basePrice: "basePrice",
  occupancy: "occupancy",
  daysToDeparture: "days",
};

// Solo números decimales simples: rechaza "", " ", "0x10", "1e3" y "Infinity".
const NUMBER = /^-?\d+(\.\d+)?$/;

// GET /api/quote?basePrice=60&occupancy=0.4&days=3 → precio sugerido y motivos.
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const read = (name: string) => params.get(name)?.trim() ?? "";
  const raw = { basePrice: read("basePrice"), occupancy: read("occupancy"), days: read("days") };

  const missing = Object.entries(raw).filter(([, v]) => v === "").map(([k]) => k);
  if (missing.length) {
    return Response.json({ error: `required: ${missing.join(", ")}` }, { status: 400 });
  }
  const notNumber = Object.entries(raw).filter(([, v]) => !NUMBER.test(v)).map(([k]) => k);
  if (notNumber.length) {
    return Response.json({ error: `must be a plain number: ${notNumber.join(", ")}` }, { status: 400 });
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
      return Response.json({ error: `${PARAM[err.field]} ${err.message}` }, { status: 400 });
    }
    throw err;
  }
}
