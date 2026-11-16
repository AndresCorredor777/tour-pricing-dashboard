import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OccupancyBadge } from "./occupancy-badge";

const meta = {
  title: "Pricing/OccupancyBadge",
  component: OccupancyBadge,
  args: { occupancy: 0.5 },
  argTypes: { occupancy: { control: { type: "range", min: 0, max: 1, step: 0.05 } } },
} satisfies Meta<typeof OccupancyBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Low: Story = { args: { occupancy: 0.2 } };
export const Normal: Story = { args: { occupancy: 0.5 } };
export const High: Story = { args: { occupancy: 0.75 } };
export const AlmostFull: Story = { args: { occupancy: 0.94 } };

/** Los cuatro niveles juntos, para revisar contraste y que el texto no dependa del color. */
export const AllLevels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[0.2, 0.5, 0.75, 0.94].map((o) => (
        <OccupancyBadge key={o} occupancy={o} />
      ))}
    </div>
  ),
};
