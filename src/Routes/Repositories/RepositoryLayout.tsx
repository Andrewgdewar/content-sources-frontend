import { useMemo } from 'react';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';

import { createUseStyles } from 'react-jss';
import { last } from 'lodash';
import Header from 'components/Header/Header';
import RepositoryQuickStart from 'components/QuickStart/RepositoryQuickStart';
import { TabbedRouteItem } from '../constants';

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
});

export default function RepositoryLayout({ tabs }: { tabs: TabbedRouteItem[] }) {
  const { pathname } = useLocation();
  const classes = useStyles();
  const currentRoute = useMemo(() => last(pathname.split('/')), [pathname]);

  return (
    <>
      <Header
        title='Repositories'
        ouiaId='custom_repositories_description'
        paragraph='View all repositories within your organization.'
      />
      <Tabs className={classes.tabs} ouiaId='routed-tabs' activeKey={currentRoute}>
        {tabs.map(({ title, route }) => (
          <Tab
            className={classes.tab}
            keyParams={route}
            key={route}
            tabIndex={-1} // This prevents the tab from being targetable by accessibility features.
            eventKey={route}
            aria-label={title}
            ouiaId={title}
            title={
              <Link className={classes.link} accessKey={route} key={route} to={route}>
                <TabTitleText>{title}</TabTitleText>
              </Link>
            }
          />
        ))}
      </Tabs>
      <RepositoryQuickStart />
      {/* Render the app routes via the Layout Outlet */}
      <Outlet />
    </>
  );
}
