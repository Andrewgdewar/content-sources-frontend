import { Grid } from '@patternfly/react-core';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import { useMemo } from 'react';

import { ErrorPage } from '../components/Error/ErrorPage';
import RepositoryLayout from './Repositories/RepositoryLayout';
import { ZeroState } from '../components/ZeroState/ZeroState';
import useRepositoryRoutes from './Repositories/useRepositoryRoutes';
import { REPOSITORIES_ROUTE } from './constants';
import useTemplateRoutes from './Templates/useTemplateRoutes';
import { useAppContext } from '../middleware/AppContext';

const useStyles = createUseStyles({
  containerMargin: {
    margin: '24px',
  },
});

export default function RepositoriesRoutes() {
  const classes = useStyles();
  const key = useMemo(() => Math.random(), []);
  const repositoryRoutes = useRepositoryRoutes();
  const templateRoutes = useTemplateRoutes();
  const { zeroState } = useAppContext();

  return (
    <Routes key={key}>
      {zeroState ? <Route path={REPOSITORIES_ROUTE} element={<ZeroState />} /> : <></>}

      <Route element={<RepositoryLayout tabs={repositoryRoutes} />}>
        {repositoryRoutes.map(({ route, Element, ChildRoutes }, key) => (
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
      </Route>
      {templateRoutes.map(({ route, Element, ChildRoutes }, key) => (
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
      <Route path='*' element={<Navigate to={REPOSITORIES_ROUTE} replace />} />
    </Routes>
  );
}
