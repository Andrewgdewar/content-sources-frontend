import { Flex, Text } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  container: {
    marginRight: '48px',
    flex: 1,
  },
  title: {
    textWrap: 'nowrap',
    minWidth: '170px',
  },
  content: {
    width: '500px',
    extend: 'pf-v5-u-color-100',
  },
});

export default function DetailItem({ title, value }: { title: string; value?: string | number }) {
  if (!value) return <></>;
  const classes = useStyles();
  return (
    <Flex
      direction={{ default: 'row' }}
      flexWrap={{ default: 'nowrap' }}
      className={classes.container}
    >
      <Text className={classes.title}>{title}</Text>
      <Text className={classes.content}>{value || '-'}</Text>
    </Flex>
  );
}
