import { createUseStyles } from 'react-jss';
import {
  global_danger_color_200,
  global_info_color_200,
  global_success_color_200,
  global_warning_color_200,
} from '@patternfly/react-tokens';

const red = global_danger_color_200.value;
const green = global_success_color_200.value;
const gold = global_warning_color_200.value;
const blue = global_info_color_200.value;

interface Props {
  color: 'red' | 'green' | 'gold' | 'blue';
  isLink?: boolean;
  children?: React.ReactNode;
}

const useStyles = ({ isLink }: Props) =>
  createUseStyles({
    fontStyle: {
      fontWeight: 'bold',
      fontSize: '14px',
      ...(isLink
        ? {
            textDecoration: 'grey dotted underline',
            cursor: 'pointer',
          }
        : {}),
    },
    red: { extend: 'fontStyle', color: red },
    green: { extend: 'fontStyle', color: green },
    gold: { extend: 'fontStyle', color: gold },
    blue: { extend: 'fontStyle', color: blue },
  });

const StatusText = (props: Props) => {
  const classes = useStyles(props)();
  const { color, children } = props;

  return <span className={classes[color]}>{children}</span>;
};

export default StatusText;
