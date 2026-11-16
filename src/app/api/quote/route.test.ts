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
    expect((await res.json()).error).toBe("required: days");
  });

  it("treats empty or blank values as missing instead of zero", async () => {
    const res = call("basePrice=100&occupancy=&days=%20");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("required: occupancy, days");
  });

  it("names the query parameter in validation errors", async () => {
    const res = call("basePrice=100&occupancy=0.5&days=-1");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("days must be a non-negative integer");
  });

  it("answers 400 for out-of-range occupancy", async () => {
    const res = call("basePrice=100&occupancy=2&days=3");
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("occupancy must be between 0 and 1");
  });

  it.each(["abc", "0x10", "1e3", "Infinity"])("rejects %s as not a plain number", async (v) => {
    const res = call(`basePrice=${v}&occupancy=0.5&days=3`);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("must be a plain number: basePrice");
  });
});
