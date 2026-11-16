import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PriceDelta } from "./price-delta";

const meta = {
  title: "Pricing/PriceDelta",
  component: PriceDelta,
  args: { basePrice: 100, price: 100 },
} satisfies Meta<typeof PriceDelta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Up: Story = { args: { price: 125 } };
export const Down: Story = { args: { price: 80 } };
export const NoChange: Story = {};
/** $25 × 1,25 = $31,25 → $31: el % sale del factor (+25%), no del precio redondeado (+24%). */
export const RoundedPriceUsesFactor: Story = { args: { basePrice: 25, price: 31, factor: 1.25 } };
