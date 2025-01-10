import { Grid } from '@patternfly/react-core';
import { SecurityIcon } from '@patternfly/react-icons';
import {
  global_danger_color_100,
  global_palette_orange_300,
  global_warning_color_100,
  global_Color_200,
} from '@patternfly/react-tokens';

import { createUseStyles } from 'react-jss';

const useStyles = (color: string) => {
  let finalColor = 'initial';
  switch (color) {
    case 'critical':
      finalColor = global_danger_color_100.value;
      break;
    case 'important':
      finalColor = global_palette_orange_300.value;
      break;
    case 'moderate':
      finalColor = global_warning_color_100.value;
      break;
    case 'low':
      finalColor = global_Color_200.value;
      break;
    default:
      break;
  }

  return createUseStyles({
    iconColor: {
      fill: finalColor,
      marginRight: '4px',
    },
    wrapper: {
      display: 'inline-flex',
      alignItems: 'center',
    },
  });
};

interface Props {
  severity: string;
}

const severityTypes = new Set(['critical', 'important', 'moderate', 'low']);

export default function SeverityWithIcon({ severity }: Props) {
  const loweredSeverity = severity?.toLowerCase();
  const classes = useStyles(loweredSeverity)();

  const isOther = !severityTypes.has(loweredSeverity);

  return (
    <Grid className={classes.wrapper}>
      {isOther ? '' : <SecurityIcon className={classes.iconColor} />} {severity}
    </Grid>
  );
}
