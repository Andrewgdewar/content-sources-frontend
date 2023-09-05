import '@redhat-cloud-services/frontend-components-utilities/styles/_all';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import Routes from './Routes';
import { useAppContext } from './middleware/AppContext';
import { NoPermissionsPage } from './components/NoPermissionsPage/NoPermissionsPage';

import { Bullseye, Spinner } from '@patternfly/react-core';

export default function App() {
  const { rbac, isFetchingFeatures } = useAppContext();

  switch (true) {
    case !rbac || isFetchingFeatures:
      return (
        <Bullseye>
          <Spinner size='xl' />
        </Bullseye>
      );
    case rbac?.read:
      return (
        <>
          <NotificationsPortal />
          <Routes />
        </>
      );

    default:
      return <NoPermissionsPage />;
  }
}
