import { suggestPrice, type PriceSuggestion } from "./pricing";

/**
 * Datos SINTÉTICOS para la demo. No vienen de ningún operador real.
 * Los días a la salida van fijos para que la demo sea reproducible.
 */
export interface Tour {
  id: string;
  name: string;
  city: string;
  basePrice: number;
  capacity: number;
  booked: number;
  daysToDeparture: number;
}

export interface TourWithPrice extends Tour {
  occupancy: number;
  suggestion: PriceSuggestion;
}

export const TOURS: Tour[] = [
  { id: "bog-graffiti", name: "Graffiti walking tour", city: "Bogotá", basePrice: 25, capacity: 16, booked: 15, daysToDeparture: 3 },
  { id: "bog-coffee", name: "Coffee farm day trip", city: "Bogotá", basePrice: 70, capacity: 12, booked: 3, daysToDeparture: 1 },
  { id: "ctg-islands", name: "Rosario Islands boat trip", city: "Cartagena", basePrice: 95, capacity: 30, booked: 22, daysToDeparture: 10 },
  { id: "ctg-food", name: "Old Town food tour", city: "Cartagena", basePrice: 55, capacity: 10, booked: 5, daysToDeparture: 5 },
  { id: "cus-rainbow", name: "Rainbow Mountain hike", city: "Cusco", basePrice: 60, capacity: 20, booked: 4, daysToDeparture: 21 },
  { id: "cus-sacred", name: "Sacred Valley full day", city: "Cusco", basePrice: 85, capacity: 18, booked: 9, daysToDeparture: 2 },
];

export function withPrices(tours: Tour[] = TOURS): TourWithPrice[] {
  return tours.map((t) => {
    const occupancy = t.booked / t.capacity;
    return {
      ...t,
      occupancy,
      suggestion: suggestPrice({ basePrice: t.basePrice, occupancy, daysToDeparture: t.daysToDeparture }),
    };
  });
}
