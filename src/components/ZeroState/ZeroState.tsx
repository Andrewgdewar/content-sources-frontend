import { Suspense } from 'react';
import { Bullseye, Button, Grid, Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { Outlet, useNavigate } from 'react-router-dom';
import { createUseStyles } from 'react-jss';

import { useAppContext } from 'middleware/AppContext';

const useStyles = createUseStyles({
  minHeight: {
    minHeight: '100%',
    '& .bannerBefore': { maxHeight: '320px!important' },
  },
});

export const ZeroState = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { setZeroState } = useAppContext();

  const handleClick = () => {
    setZeroState(false);
    navigate('add');
  };

  return (
    <>
      <Suspense
        fallback={
          <Bullseye>
            <Spinner size='xl' />
          </Bullseye>
        }
      >
        <Grid className={classes.minHeight}>
          <AsyncComponent
            appId='content_zero_state'
            appName='dashboard'
            module='./AppZeroState'
            scope='dashboard'
            ErrorComponent={<ErrorState />}
            app='Content_management'
            ouiaId='get_started_from_zerostate_description'
            customText='Get started with Insights by adding custom repositories'
            customButton={
              <Button
                id='add-custom-repositories-button'
                ouiaId='add_custom_repositories_button'
                className='pf-c-button pf-m-primary pf-u-p-md pf-u-font-size-md'
                onClick={() => handleClick()}
              >
                Add custom repositories
              </Button>
            }
          />
        </Grid>
      </Suspense>
      <Outlet />
    </>
  );
};
