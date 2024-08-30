import { Button, ButtonVariant } from '@patternfly/react-core';

import type { Meta, StoryObj } from '@storybook/react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    children: { control: 'text' },
    ouiaId: { control: 'text' },
    variant: {
      options: Object.values(ButtonVariant),
      control: { type: 'select' },
    },
    isLoading: {
      control: { type: 'boolean' },
    },
    isDisabled: {
      control: { type: 'boolean' },
    },
    ouiaSafe: {
      control: { type: 'boolean' },
    },
  },
  args: {
    variant: ButtonVariant.primary,
    children: 'Button',
    ouiaId: 'simple_ouia_id',
    isLoading: false,
    isDisabled: false,
    ouiaSafe: true,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const ButtonExample: Story = {
  args: {},
};
