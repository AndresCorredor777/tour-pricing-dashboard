import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { suggestPrice } from "@/lib/pricing";
import { PricingSimulator, type GetQuote } from "./pricing-simulator";

// En Storybook no hay servidor: la cotización usa la misma función pura que el endpoint.
const localQuote: GetQuote = async (input) => suggestPrice(input);
const failingQuote: GetQuote = async () => {
  throw new Error("Pricing service unavailable");
};

const meta = {
  title: "Pricing/PricingSimulator",
  component: PricingSimulator,
  args: {
    tourName: "Coffee farm day trip",
    basePrice: 70,
    initialOccupancy: 0.25,
    initialDays: 1,
    getQuote: localQuote,
  },
} satisfies Meta<typeof PricingSimulator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LastMinuteLowDemand: Story = {};
export const AlmostFull: Story = { args: { initialOccupancy: 0.95, initialDays: 10 } };
export const ServiceError: Story = { args: { getQuote: failingQuote } };
