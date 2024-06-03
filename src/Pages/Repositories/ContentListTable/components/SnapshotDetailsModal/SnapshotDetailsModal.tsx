import {
  Button,
  Modal,
  ModalVariant,
  Stack,
  StackItem,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { InnerScrollContainer } from '@patternfly/react-table';
import { ContentOrigin } from '../../../../../services/Content/ContentApi';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useRootPath from '../../../../../Hooks/useRootPath';
import { useAppContext } from '../../../../../middleware/AppContext';
import { useEffect, useState } from 'react';
import { SnapshotPackagesTab } from './Tabs/SnapshotPackagesTab';
import { createUseStyles } from 'react-jss';
import { SnapshotSelector } from './SnapshotSelector';
import { REPOSITORIES_ROUTE } from '../../../../../Routes/constants';
import { SnapshotErrataTab } from './Tabs/SnapshotErrataTab';

const useStyles = createUseStyles({
  modalBody: {
    padding: '24px 24px 0 24px',
  },
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '24px 0',
  },
});

export enum SnapshotDetailTab {
  PACKAGES = 'packages',
  ERRATA = 'errata',
}

export default function SnapshotDetailsModal() {
  const { contentOrigin } = useAppContext();
  const classes = useStyles();
  const { repoUUID, snapshotUUID } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const rootPath = useRootPath();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  useEffect(() => {
    if (urlSearchParams.get('tab') === SnapshotDetailTab.ERRATA) {
      setActiveTabKey(1);
    }
  }, []);

  const handleTabClick = (
    _: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    setUrlSearchParams(tabIndex ? { tab: SnapshotDetailTab.ERRATA } : {});
    setActiveTabKey(tabIndex);
  };

  const onClose = () =>
    navigate(rootPath + (contentOrigin === ContentOrigin.REDHAT ? `?origin=${contentOrigin}` : ''));

  const onBackClick = () => navigate(rootPath + `/${REPOSITORIES_ROUTE}/${repoUUID}/snapshots`);

  return (
    <Modal
      key={snapshotUUID}
      position='top'
      hasNoBodyWrapper
      aria-label='snapshot details modal'
      ouiaId='snapshot_details_modal'
      //   ouiaSafe={fetchingOrLoading}
      variant={ModalVariant.large}
      title='Snapshot detail'
      isOpen
      onClose={onClose}
      footer={
        <Button key='close' variant='secondary' onClick={onClose}>
          Close
        </Button>
      }
    >
      <InnerScrollContainer>
        <Stack className={classes.modalBody}>
          <StackItem className={classes.topContainer}>
            <SnapshotSelector />
            <Button variant='secondary' onClick={onBackClick}>
              View all snapshots
            </Button>
          </StackItem>
          <StackItem>
            <Tabs
              activeKey={activeTabKey}
              onSelect={handleTabClick}
              aria-label='Snapshot detail tabs'
            >
              <Tab
                eventKey={0}
                ouiaId='packages_tab'
                title={<TabTitleText>Packages</TabTitleText>}
                aria-label='Snapshot package detail tab'
              >
                <SnapshotPackagesTab />
              </Tab>
              <Tab
                eventKey={1}
                ouiaId='advisories_tab'
                title={<TabTitleText>Advisories</TabTitleText>}
                aria-label='Snapshot errata detail tab'
              >
                <SnapshotErrataTab />
              </Tab>
            </Tabs>
          </StackItem>
        </Stack>
      </InnerScrollContainer>
    </Modal>
  );
}
