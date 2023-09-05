import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  BanIcon,
  ClockIcon,
} from '@patternfly/react-icons';
import { Flex, FlexItem, Spinner } from '@patternfly/react-core';
import StatusText from '../../../components/StatusText/StatusText';
import {
  global_danger_color_100,
  global_success_color_100,
  global_warning_color_100,
} from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import { AdminTask } from '../../../services/AdminTasks/AdminTaskApi';

const red = global_danger_color_100.value;
const green = global_success_color_100.value;
const gold = global_warning_color_100.value;

const useStyles = createUseStyles({
  spinner: {
    animationDuration: '6s !important',
    margin: '-3px 0',
  },
});

interface Props {
  status: AdminTask['status'];
}

const StatusIcon = ({ status }: Props) => {
  const classes = useStyles();

  switch (status) {
    case 'running':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <Spinner size='md' className={classes.spinner} />
          </FlexItem>
          <FlexItem>
            <StatusText color='blue'>Running</StatusText>
          </FlexItem>
        </Flex>
      );
    case 'failed':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <ExclamationCircleIcon color={red} />
          </FlexItem>
          <FlexItem>
            <StatusText color='green'>Failed</StatusText>
          </FlexItem>
        </Flex>
      );
    case 'completed':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <CheckCircleIcon color={green} />
          </FlexItem>
          <FlexItem>
            <StatusText color='green'>Completed</StatusText>
          </FlexItem>
        </Flex>
      );
    case 'canceled':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <BanIcon color={red} />
          </FlexItem>
          <FlexItem>
            <StatusText color='green'>Canceled</StatusText>
          </FlexItem>
        </Flex>
      );
    case 'pending':
      return (
        <Flex alignContent={{ default: 'alignContentCenter' }} direction={{ default: 'row' }}>
          <FlexItem spacer={{ default: 'spacerSm' }}>
            <ClockIcon color={gold} />
          </FlexItem>
          <FlexItem>
            <StatusText color='blue'>Pending</StatusText>
          </FlexItem>
        </Flex>
      );
    default:
      return <></>;
  }
};

export default StatusIcon;
