import { Button } from '@patternfly/react-core';

import type { Meta, StoryObj } from '@storybook/react';
import FileUploader from '../components/FileUploader/FileUploader';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components',
  component: FileUploader,
  decorators: [
    (Story) => (
      <div style={{ justifyContent: 'center', display: 'flex', paddingTop: '20vh' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  args: {},
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const FileUpload: Story = {
  args: {},
};
