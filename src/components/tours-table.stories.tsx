import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { withPrices } from "@/lib/tours";
import { ToursTable } from "./tours-table";

const meta = {
  title: "Dashboard/ToursTable",
  component: ToursTable,
  args: { tours: withPrices() },
} satisfies Meta<typeof ToursTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { tours: [] } };
