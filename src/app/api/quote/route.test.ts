import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET } from "./route";

const call = (qs: string) => GET(new NextRequest(`http://localhost/api/quote?${qs}`));

describe("GET /api/quote", () => {
  it("returns the suggested price and reasons", async () => {
    const res = call("basePrice=100&occupancy=0.95&days=10");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.price).toBe(125);
    expect(body.reasons.length).toBeGreaterThan(0);
  });

  it("answers 400 when a parameter is missing", async () => {
    const res = call("basePrice=100&occupancy=0.5");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/required/);
  });

  it("answers 400 with the validation message for bad values", async () => {
    const res = call("basePrice=100&occupancy=2&days=3");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/occupancy/);
  });

  it("answers 400 for non-numeric input", async () => {
    expect(call("basePrice=abc&occupancy=0.5&days=3").status).toBe(400);
  });
});
