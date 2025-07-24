import type { Instance } from "ink";
import { Box, render, Text } from "ink";
import React from "react";

interface ProgressState {
  message: string;
  isComplete: boolean;
}

const ProgressComponent: React.FC<{ state: ProgressState }> = ({ state }) => (
  <Box>
    <Text color={state.isComplete ? "green" : "blue"}>
      {state.isComplete ? "✓" : "⠋"} {state.message}
    </Text>
  </Box>
);

export class ProgressDisplay {
  private app: Instance | null = null;
  private state: ProgressState = {
    message: "Starting...",
    isComplete: false,
  };

  start(): void {
    this.app = render(<ProgressComponent state={this.state} />);
  }

  update(message: string): void {
    this.state.message = message;
    if (this.app) {
      this.app.rerender(<ProgressComponent state={this.state} />);
    }
  }

  complete(): void {
    this.state.isComplete = true;
    this.state.message = "Completed successfully";
    if (this.app) {
      this.app.rerender(<ProgressComponent state={this.state} />);
      this.app.unmount();
    }
  }

  error(message: string): void {
    this.state.message = `Error: ${message}`;
    if (this.app) {
      this.app.rerender(<ProgressComponent state={this.state} />);
      this.app.unmount();
    }
  }
}
