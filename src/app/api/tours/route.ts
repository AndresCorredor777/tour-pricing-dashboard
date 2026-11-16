import { withPrices } from "@/lib/tours";

// GET /api/tours → lista de tours con su precio sugerido.
export function GET() {
  return Response.json({ tours: withPrices() });
}
