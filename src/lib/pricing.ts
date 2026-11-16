/**
 * Reglas de precio dinámico para un tour o actividad.
 *
 * Funciones puras: no leen la fecha ni la red, así que se prueban sin mocks
 * y dan el mismo resultado en el servidor, en el cliente y en Storybook.
 */

/** Umbrales de ocupación: única fuente para el precio y para la insignia. */
export const FULL_FROM = 0.9;
export const HIGH_FROM = 0.7;
export const LOW_BELOW = 0.3;
/** Último minuto: sale en estos días o menos y va por debajo de esta ocupación. */
export const LAST_MINUTE_DAYS = 2;
export const LAST_MINUTE_BELOW = 0.5;
/** En riesgo: sale en estos días o menos y va por debajo de esta ocupación. */
export const AT_RISK_DAYS = 7;
export const AT_RISK_BELOW = 0.5;

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

export type PriceField = keyof PriceInput;

export class PriceInputError extends Error {
  constructor(
    public readonly field: PriceField,
    message: string,
  ) {
    super(message);
  }
}

export function validateInput({ basePrice, occupancy, daysToDeparture }: PriceInput): void {
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    throw new PriceInputError("basePrice", "must be a positive number");
  }
  if (!Number.isFinite(occupancy) || occupancy < 0 || occupancy > 1) {
    throw new PriceInputError("occupancy", "must be between 0 and 1");
  }
  if (!Number.isInteger(daysToDeparture) || daysToDeparture < 0) {
    throw new PriceInputError("daysToDeparture", "must be a non-negative integer");
  }
}

export type OccupancyLevel = "low" | "normal" | "high" | "full";

export function occupancyLevel(occupancy: number): OccupancyLevel {
  if (occupancy >= FULL_FROM) return "full";
  if (occupancy >= HIGH_FROM) return "high";
  if (occupancy < LOW_BELOW) return "low";
  return "normal";
}

/**
 * Precio sugerido. Con estas reglas el factor queda entre 0,8 (demanda baja y
 * último minuto) y 1,25 (casi lleno); no hace falta un tope aparte.
 */
export function suggestPrice(input: PriceInput): PriceSuggestion {
  validateInput(input);
  const { basePrice, occupancy, daysToDeparture } = input;
  let factor = 1;
  const reasons: string[] = [];

  switch (occupancyLevel(occupancy)) {
    case "full":
      factor += 0.25;
      reasons.push("Almost full (90%+): +25%");
      break;
    case "high":
      factor += 0.15;
      reasons.push("High demand (70-89%): +15%");
      break;
    case "low":
      factor -= 0.1;
      reasons.push("Low demand (under 30%): -10%");
      break;
    case "normal":
      break;
  }

  if (daysToDeparture <= LAST_MINUTE_DAYS && occupancy < LAST_MINUTE_BELOW) {
    factor -= 0.1;
    reasons.push("Departs within 2 days and under half full: -10% to fill seats");
  }

  if (reasons.length === 0) {
    reasons.push("Normal demand: base price");
  }

  return {
    price: Math.round(basePrice * factor),
    factor: Math.round(factor * 100) / 100,
    reasons,
  };
}

/** Un tour está en riesgo si sale pronto y le falta la mitad de los cupos. */
export function isAtRisk(occupancy: number, daysToDeparture: number): boolean {
  return daysToDeparture <= AT_RISK_DAYS && occupancy < AT_RISK_BELOW;
}
