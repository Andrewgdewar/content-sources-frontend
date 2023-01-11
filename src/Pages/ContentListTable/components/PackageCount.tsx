import { Button, Text, Tooltip } from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { global_disabled_color_100 } from '@patternfly/react-tokens';
import { useState } from 'react';
import Hide from '../../../components/Hide/Hide';
import { ContentItem } from '../../../services/Content/ContentApi';
import PackageModal from './PackageModal/PackageModal';

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
}

const PackageCount = ({ rowData }: Props) => {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState(false);

  if (!rowData.package_count && rowData.status === 'Pending') {
    return (
      <Tooltip isContentLeftAligned content='Repository has not been introspected yet'>
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
    <>
      <Hide hide={!modalOpen}>
        <PackageModal rowData={rowData} closeModal={() => setModalOpen(false)} />
      </Hide>
      <Button
        ouiaId='package_count_button'
        variant='link'
        onClick={() => setModalOpen(true)}
        className={classes.link}
      >
        {rowData.package_count}
      </Button>
    </>
  );
};

export default PackageCount;
