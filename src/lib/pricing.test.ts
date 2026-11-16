import { describe, expect, it } from "vitest";
import { isAtRisk, occupancyLevel, PriceInputError, suggestPrice } from "./pricing";

describe("suggestPrice", () => {
  it("keeps the base price under normal demand", () => {
    const s = suggestPrice({ basePrice: 60, occupancy: 0.5, daysToDeparture: 10 });
    expect(s.price).toBe(60);
    expect(s.factor).toBe(1);
    expect(s.reasons).toEqual(["Normal demand: base price"]);
  });

  it("raises the price 15% from 70% occupancy", () => {
    expect(suggestPrice({ basePrice: 100, occupancy: 0.7, daysToDeparture: 10 }).price).toBe(115);
  });

  it("raises the price 25% when almost full", () => {
    const s = suggestPrice({ basePrice: 100, occupancy: 0.95, daysToDeparture: 10 });
    expect(s.price).toBe(125);
    expect(s.reasons[0]).toMatch(/Almost full/);
  });

  it("lowers the price 10% under 30% occupancy", () => {
    expect(suggestPrice({ basePrice: 100, occupancy: 0.2, daysToDeparture: 10 }).price).toBe(90);
  });

  it("adds a last-minute discount for a half-empty departure within 2 days", () => {
    const s = suggestPrice({ basePrice: 100, occupancy: 0.4, daysToDeparture: 2 });
    expect(s.price).toBe(90);
    expect(s.reasons).toHaveLength(1);
  });

  it("stacks low demand and last minute, and never goes below 80% of base", () => {
    const s = suggestPrice({ basePrice: 100, occupancy: 0.1, daysToDeparture: 0 });
    expect(s.factor).toBe(0.8);
    expect(s.price).toBe(80);
  });

  it("does not discount a full departure that leaves tomorrow", () => {
    expect(suggestPrice({ basePrice: 100, occupancy: 0.9, daysToDeparture: 1 }).price).toBe(125);
  });

  it.each([
    [0.3, 10, 100],
    [0.69, 10, 100],
    [0.7, 10, 115],
    [0.89, 10, 115],
    [0.9, 10, 125],
    [0.5, 2, 100],
    [0.49, 2, 90],
    [0.49, 3, 100],
  ])("occupancy %f with %i days gives %i (threshold edges)", (occupancy, days, price) => {
    expect(suggestPrice({ basePrice: 100, occupancy, daysToDeparture: days }).price).toBe(price);
  });

  it("uses the same level as the badge for every adjustment", () => {
    for (const o of [0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 1]) {
      const reason = suggestPrice({ basePrice: 100, occupancy: o, daysToDeparture: 10 }).reasons[0];
      const expected = { full: /Almost full/, high: /High demand/, low: /Low demand/, normal: /Normal demand/ }[occupancyLevel(o)];
      expect(reason).toMatch(expected);
    }
  });

  it("rounds to whole dollars", () => {
    expect(suggestPrice({ basePrice: 55, occupancy: 0.75, daysToDeparture: 5 }).price).toBe(63);
  });

  it.each([
    [{ basePrice: 0, occupancy: 0.5, daysToDeparture: 1 }],
    [{ basePrice: 50, occupancy: 1.2, daysToDeparture: 1 }],
    [{ basePrice: 50, occupancy: -0.1, daysToDeparture: 1 }],
    [{ basePrice: 50, occupancy: 0.5, daysToDeparture: -1 }],
    [{ basePrice: 50, occupancy: 0.5, daysToDeparture: 1.5 }],
    [{ basePrice: Number.NaN, occupancy: 0.5, daysToDeparture: 1 }],
  ])("rejects invalid input %j", (input) => {
    expect(() => suggestPrice(input)).toThrow(PriceInputError);
  });
});

describe("occupancyLevel and isAtRisk", () => {
  it("classifies occupancy at the thresholds", () => {
    expect(occupancyLevel(0.29)).toBe("low");
    expect(occupancyLevel(0.3)).toBe("normal");
    expect(occupancyLevel(0.7)).toBe("high");
    expect(occupancyLevel(0.9)).toBe("full");
  });

  it("flags departures within 7 days that are under half full", () => {
    expect(isAtRisk(0.4, 7)).toBe(true);
    expect(isAtRisk(0.5, 3)).toBe(false);
    expect(isAtRisk(0.2, 8)).toBe(false);
  });
});
