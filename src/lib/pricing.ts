/**
 * Reglas de precio dinámico para un tour o actividad.
 *
 * Funciones puras: no leen la fecha ni la red, así que se prueban sin mocks
 * y dan el mismo resultado en el servidor, en el cliente y en Storybook.
 */

export const MIN_FACTOR = 0.8;
export const MAX_FACTOR = 1.3;

export interface PriceInput {
  /** Precio base publicado, en USD. */
  basePrice: number;
  /** Ocupación actual, de 0 a 1. */
  occupancy: number;
  /** Días que faltan para la salida (0 = hoy). */
  daysToDeparture: number;
}

export interface PriceSuggestion {
  price: number;
  factor: number;
  /** Motivos en lenguaje claro, en el orden en que se aplicaron. */
  reasons: string[];
}

export class PriceInputError extends Error {}

export function validateInput({ basePrice, occupancy, daysToDeparture }: PriceInput): void {
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    throw new PriceInputError("basePrice must be a positive number");
  }
  if (!Number.isFinite(occupancy) || occupancy < 0 || occupancy > 1) {
    throw new PriceInputError("occupancy must be between 0 and 1");
  }
  if (!Number.isInteger(daysToDeparture) || daysToDeparture < 0) {
    throw new PriceInputError("daysToDeparture must be a non-negative integer");
  }
}

export function suggestPrice(input: PriceInput): PriceSuggestion {
  validateInput(input);
  const { basePrice, occupancy, daysToDeparture } = input;
  let factor = 1;
  const reasons: string[] = [];

  if (occupancy >= 0.9) {
    factor += 0.25;
    reasons.push("Almost full (90%+): +25%");
  } else if (occupancy >= 0.7) {
    factor += 0.15;
    reasons.push("High demand (70-89%): +15%");
  } else if (occupancy < 0.3) {
    factor -= 0.1;
    reasons.push("Low demand (under 30%): -10%");
  }

  if (daysToDeparture <= 2 && occupancy < 0.5) {
    factor -= 0.1;
    reasons.push("Departs within 2 days and under half full: -10% to fill seats");
  }

  const clamped = Math.min(MAX_FACTOR, Math.max(MIN_FACTOR, factor));
  if (clamped !== factor) {
    reasons.push(`Kept within ${MIN_FACTOR * 100}-${MAX_FACTOR * 100}% of the base price`);
  }
  if (reasons.length === 0) {
    reasons.push("Normal demand: base price");
  }

  return {
    price: Math.round(basePrice * clamped),
    factor: Math.round(clamped * 100) / 100,
    reasons,
  };
}

export type OccupancyLevel = "low" | "normal" | "high" | "full";

export function occupancyLevel(occupancy: number): OccupancyLevel {
  if (occupancy >= 0.9) return "full";
  if (occupancy >= 0.7) return "high";
  if (occupancy < 0.3) return "low";
  return "normal";
}

/** Un tour está en riesgo si sale pronto y le falta la mitad de los cupos. */
export function isAtRisk(occupancy: number, daysToDeparture: number): boolean {
  return daysToDeparture <= 7 && occupancy < 0.5;
}
