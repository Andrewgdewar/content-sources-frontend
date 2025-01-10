import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { Button, Flex, FlexItem, Popover, Spinner, Tooltip } from '@patternfly/react-core';
import StatusText from 'components/StatusText/StatusText';
import { global_danger_color_100, global_success_color_100 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import { AdminTask } from 'services/AdminTasks/AdminTaskApi';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useMemo } from 'react';

const red = global_danger_color_100.value;
const green = global_success_color_100.value;

const useStyles = createUseStyles({
  spinner: {
    animationDuration: '6s !important',
    margin: '-3px 0',
  },
});

interface Props {
  uuid: string;
  last_update_snapshot_error: string;
  last_update_task: AdminTask | undefined;
}

const StatusIcon = ({ uuid, last_update_snapshot_error, last_update_task }: Props) => {
  const classes = useStyles();
  const { getEnvironment } = useChrome();
  const isInEphemeral = useMemo(() => getEnvironment() === 'qa', []);

  const showError = (
    snapshotError: string | undefined,
    updateTemplateError: string | undefined,
  ) => {
    if (!snapshotError && !updateTemplateError) {
      return 'An unknown error occurred';
    } else if (snapshotError) {
      return `An error occurred when updating the latest snapshot: ${snapshotError}`;
    } else if (updateTemplateError) {
      return `An error occurred when updating the template: ${updateTemplateError}`;
    }
  };

  if (
    (last_update_task?.status === 'completed' &&
      last_update_task?.error === '' &&
      last_update_snapshot_error === '') ||
    (last_update_snapshot_error === '' && isInEphemeral)
  ) {
    return (
      <Flex
        key={`${uuid}`}
        alignContent={{ default: 'alignContentCenter' }}
        direction={{ default: 'row' }}
      >
        <FlexItem spacer={{ default: 'spacerSm' }}>
          <CheckCircleIcon color={green} />
        </FlexItem>
        <FlexItem>
          <StatusText color='green'>Valid</StatusText>
        </FlexItem>
      </Flex>
    );
  } else if (last_update_task?.status === 'pending' || last_update_task?.status === 'running') {
    return (
      <Tooltip position='top-start' content='Template update in progress'>
        <Flex
          key={`${uuid}`}
          alignContent={{ default: 'alignContentCenter' }}
          direction={{ default: 'row' }}
        >
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <Spinner size='md' className={classes.spinner} />
          </FlexItem>
          <FlexItem>
            <StatusText color='blue'>In progress</StatusText>
          </FlexItem>
        </Flex>
      </Tooltip>
    );
  } else {
    return (
      <Flex
        key={`${uuid}`}
        alignContent={{ default: 'alignContentCenter' }}
        direction={{ default: 'row' }}
      >
        <FlexItem spacer={{ default: 'spacerSm' }}>
          <ExclamationCircleIcon color={red} />
        </FlexItem>
        <FlexItem>
          <Popover
            aria-label='invalid popover'
            alertSeverityVariant='danger'
            headerContent='Invalid'
            headerIcon={<ExclamationCircleIcon />}
            bodyContent={showError(last_update_snapshot_error, last_update_task?.error)}
            position='left'
          >
            <Button variant='link' isInline>
              <StatusText color='red' isLink>
                Invalid
              </StatusText>
            </Button>
          </Popover>
        </FlexItem>
      </Flex>
    );
  }
};

export default StatusIcon;
