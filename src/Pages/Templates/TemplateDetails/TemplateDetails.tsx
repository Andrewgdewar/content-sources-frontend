import {
  Button,
  Grid,
  Modal,
  ModalVariant,
  Stack,
  StackItem,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { InnerScrollContainer } from '@patternfly/react-table';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import useRootPath from '../../../Hooks/useRootPath';
// import { useAppContext } from '../../../middleware/AppContext';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
// import { REPOSITORIES_ROUTE } from '../../../Routes/constants';

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

export enum TemplateDetailsTab {
  PACKAGES = 'packages',
  ERRATA = 'errata',
}

export default function TemplateDetails() {
  const classes = useStyles();
  const { templateUUID } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  //   const rootPath = useRootPath();
  //   const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  useEffect(() => {
    setActiveTabKey(urlSearchParams.get('tab') === TemplateDetailsTab.ERRATA ? 1 : 0);
  }, [urlSearchParams]);

  const handleTabClick = (
    _: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    setUrlSearchParams(tabIndex ? { tab: TemplateDetailsTab.ERRATA } : {});
    setActiveTabKey(tabIndex);
  };

  //   const onBackClick = () => navigate(rootPath + `/${REPOSITORIES_ROUTE}/${repoUUID}/snapshots`);

  return (
    <Grid>
      <InnerScrollContainer>
        <Stack className={classes.modalBody}>
          <StackItem className={classes.topContainer}>Info here</StackItem>
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
                {templateUUID}
                {/* <SnapshotPackagesTab /> */}
              </Tab>
              <Tab
                eventKey={1}
                ouiaId='advisories_tab'
                title={<TabTitleText>Advisories</TabTitleText>}
                aria-label='Snapshot errata detail tab'
              >
                {templateUUID}
                {/* <SnapshotErrataTab /> */}
              </Tab>
            </Tabs>
          </StackItem>
        </Stack>
      </InnerScrollContainer>
    </Grid>
  );
}
