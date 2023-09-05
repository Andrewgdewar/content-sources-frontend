import { useMemo } from 'react';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { Link, Outlet } from 'react-router-dom';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';

import { createUseStyles } from 'react-jss';
import { last } from 'lodash';
import Header from '../components/Header/Header';
import QuickStart from '../components/QuickStart/QuickStart';
import { TabbedRoute } from './useTabbedRoutes';

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

export default function Layout({ pathname, tabs }: { pathname: string; tabs: TabbedRoute[] }) {
  const classes = useStyles();
  const currentRoute = useMemo(() => last(pathname.split('/')), [pathname]);

  return (
    <>
      <Header />
      <Tabs className={classes.tabs} ouiaId='routed-tabs' activeKey={currentRoute}>
        {tabs.map(({ title, route }) => (
          <Tab
            className={classes.tab}
            keyParams={route}
            key={route}
            tabIndex={-1} // This prevents the tab from being targetable by accessibility features.
            eventKey={route || 'content'} // the current route will be "content" when there is no route specified (root)
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
      <QuickStart />
      {/* Render the app routes via the Layout Outlet */}
      <Outlet />
    </>
  );
}
