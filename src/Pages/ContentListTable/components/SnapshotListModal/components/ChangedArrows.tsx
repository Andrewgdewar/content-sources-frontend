import { LongArrowAltDownIcon, LongArrowAltUpIcon } from '@patternfly/react-icons';
import { Flex, FlexItem } from '@patternfly/react-core';
import { global_danger_color_100, global_success_color_100 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';

const red = global_danger_color_100.value;
const green = global_success_color_100.value;

const useStyles = createUseStyles({
  base: {
    fontWeight: 'bold',
    alignItems: 'center',
    display: 'flex',
    '& svg': {
      marginRight: '5px',
    },
  },
  red: { extend: 'base', color: red },
  green: { extend: 'base', color: green },
});

interface Props {
  addedCount: number;
  removedCount: number;
}

const ChangedArrows = ({ addedCount, removedCount }: Props) => {
  const classes = useStyles();
  return (
    <Flex>
      <FlexItem className={classes.green}>
        <LongArrowAltUpIcon />
        {addedCount}
      </FlexItem>
      <FlexItem className={classes.red}>
        <LongArrowAltDownIcon />
        {removedCount}
      </FlexItem>
    </Flex>
  );
};

export default ChangedArrows;
