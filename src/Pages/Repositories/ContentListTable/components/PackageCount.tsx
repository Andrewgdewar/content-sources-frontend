import { Button, Text, Tooltip } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { global_disabled_color_100 } from '@patternfly/react-tokens';
import { useNavigate } from 'react-router-dom';

import { ContentItem } from 'services/Content/ContentApi';

const useStyles = createUseStyles({
  text: {
    color: global_disabled_color_100.value,
    width: 'fit-content',
  },
  link: {
    padding: 0,
  },
});

interface Props {
  rowData: ContentItem;
  href?: string;
  opensNewTab?: boolean;
}

const PackageCount = ({ rowData, href, opensNewTab }: Props) => {
  const classes = useStyles();
  const navigate = useNavigate();

  if (!rowData.package_count && rowData.status === 'Pending') {
    return (
      <Tooltip isContentLeftAligned content='Introspection is in progress'>
        <Text className={classes.text}>N/A</Text>
      </Tooltip>
    );
  }

  if (rowData.status === 'Invalid') {
    return (
      <Tooltip isContentLeftAligned content='Repository is invalid.'>
        <Text className={classes.text}>N/A</Text>
      </Tooltip>
    );
  }

  return (
    <Button
      ouiaId='package_count_button'
      variant='link'
      component='a'
      href={href}
      className={classes.link}
      target={opensNewTab ? '_blank' : ''}
      onClick={href ? undefined : () => navigate(`${rowData.uuid}/packages`)}
    >
      {rowData.package_count}
    </Button>
  );
};

export default PackageCount;
