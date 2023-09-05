import { Grid } from '@patternfly/react-core';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { createUseStyles } from 'react-jss';
import { ErrorPage } from '../components/Error/ErrorPage';
import Layout from './Layout';
import { useMemo } from 'react';
import useTabbedRoutes, { DEFAULT_ROUTE } from './useTabbedRoutes';

const useStyles = createUseStyles({
  containerMargin: {
    margin: '24px',
  },
});

export default function MainRoutes() {
  const classes = useStyles();
  const { pathname } = useLocation();
  const key = useMemo(() => Math.random(), []);
  const tabs = useTabbedRoutes();

  return (
    <Routes key={key}>
      <Route element={<Layout pathname={pathname} tabs={tabs} />}>
        {tabs.map(({ route, Element, ChildRoutes }, key) => (
          <Route
            key={key.toString()}
            path={route}
            element={
              <ErrorPage>
                <Grid className={classes.containerMargin}>
                  <Element />
                </Grid>
              </ErrorPage>
            }
          >
            {ChildRoutes?.map(({ path, Element: ChildRouteElement }, childRouteKey) => (
              <Route key={childRouteKey} path={path} element={<ChildRouteElement />} />
            ))}
          </Route>
        ))}
        <Route path='*' element={<Navigate to={DEFAULT_ROUTE} replace />} />
      </Route>
    </Routes>
  );
}
