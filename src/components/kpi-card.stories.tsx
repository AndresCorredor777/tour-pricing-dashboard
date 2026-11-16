import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { KpiCard } from "./kpi-card";

const meta = {
  title: "Dashboard/KpiCard",
  component: KpiCard,
  args: { label: "Average occupancy", value: "52%", hint: "6 departures" },
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHint: Story = {};
export const WithoutHint: Story = { args: { hint: undefined } };
