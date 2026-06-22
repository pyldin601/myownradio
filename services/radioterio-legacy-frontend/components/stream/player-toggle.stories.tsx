import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlayerToggle } from "./player-toggle";

const meta = {
  title: "Stream/PlayerToggle",
  component: PlayerToggle,
  parameters: {
    layout: "centered",
  },
  args: {
    initialTrackTitle: "Pretenders - Brass in Pocket",
    streamSid: 528,
  },
  decorators: [
    (Story) => (
      <div
        className="stream-info"
        style={{
          backgroundColor: "#1f1f20",
          minWidth: "720px",
          padding: "48px",
        }}
      >
        <div id="controls">
          <div className="about">
            <Story />
          </div>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PlayButton: Story = {};
