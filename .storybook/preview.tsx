import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

const preview: Preview = {
  // Página de Docs automática para cada componente (props, JSDoc e historias).
  tags: ["autodocs"],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-6 font-sans text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
