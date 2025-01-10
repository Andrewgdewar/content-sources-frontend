import { useMemo } from 'react';
import { Grid, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';

import { createUseStyles } from 'react-jss';
import { last } from 'lodash';
import Header from 'components/Header/Header';
import RepositoryQuickStart from 'components/QuickStart/RepositoryQuickStart';
import {
  ADMIN_TASKS_ROUTE,
  POPULAR_REPOSITORIES_ROUTE,
  REPOSITORIES_ROUTE,
} from '../../Routes/constants';
import { useAppContext } from 'middleware/AppContext';

const useStyles = createUseStyles({
  tabs: {
    backgroundColor: global_BackgroundColor_100.value,
  },
  tab: {
    '& button': {
      padding: 0, // Remove the default button padding
    },
  },
  link: {
    color: 'inherit', // Receives parent "Tab" components color
    textDecoration: 'none',
    padding: '8px 16px', // Add it back so that the entire clickable area works
    '&:focus-visible': {
      outlineOffset: '-6px',
    },
  },
  containerMargin: {
    margin: '24px',
  },
});

export default function RepositoryLayout() {
  const { pathname } = useLocation();
  const { features } = useAppContext();
  const classes = useStyles();
  const currentRoute = useMemo(() => last(pathname.split('/')), [pathname]);

  const tabs = useMemo(
    () => [
      { title: 'Your repositories', route: '', key: REPOSITORIES_ROUTE },
      {
        title: 'Popular repositories',
        route: POPULAR_REPOSITORIES_ROUTE,
        key: POPULAR_REPOSITORIES_ROUTE,
      },
      ...(features?.admintasks?.enabled && features.admintasks?.accessible
        ? [
            {
              title: 'Admin tasks',
              route: ADMIN_TASKS_ROUTE,
              key: ADMIN_TASKS_ROUTE,
            },
          ]
        : []),
    ],
    [features],
  );

  return (
    <>
      <Header
        title='Repositories'
        ouiaId='custom_repositories_description'
        paragraph='View all repositories within your organization.'
      />
      <Tabs className={classes.tabs} ouiaId='routed-tabs' activeKey={currentRoute}>
        {tabs.map(({ title, route, key }) => (
          <Tab
            className={classes.tab}
            keyParams={route}
            key={key}
            tabIndex={-1} // This prevents the tab from being targetable by accessibility features.
            eventKey={key}
            aria-label={title}
            ouiaId={title}
            title={
              <Link className={classes.link} accessKey={key} key={key} to={route}>
                <TabTitleText>{title}</TabTitleText>
              </Link>
            }
          />
        ))}
      </Tabs>
      <RepositoryQuickStart />
      {/* Render the app routes via the Layout Outlet */}
      <Grid className={classes.containerMargin}>
        <Outlet />
      </Grid>
    </>
  );
}
