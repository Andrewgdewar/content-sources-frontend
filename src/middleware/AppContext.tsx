import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { fetchRBAC, Rbac } from '@redhat-cloud-services/insights-common-typescript';
import { Features } from '../services/Features/FeatureApi';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { getRegistry as _getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { insights } from '../../package.json';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useFetchFeaturesQuery } from '../services/Features/FeatureQueries';

const getRegistry = _getRegistry as unknown as () => { register: ({ notifications }) => void };
const { appname } = insights;

export interface AppContextInterface {
  rbac?: { read: boolean; write: boolean };
  features: Features | null;
  isFetchingFeatures: boolean;
}

export const AppContext = createContext({} as AppContextInterface);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [rbac, setRbac] = useState<Rbac | undefined>(undefined);
  const [features, setFeatures] = useState<Features | null>(null);
  const chrome = useChrome();
  const { fetchFeatures, isLoading: isFetchingFeatures } = useFetchFeaturesQuery();

  useEffect(() => {
    // Get chrome and register app
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer });

    if (chrome && !rbac) {
      // Get permissions and store them in context
      chrome.auth.getUser().then(async () => fetchRBAC(appname).then(setRbac));
    }

    (async () => {
      const fetchedFeatures = await fetchFeatures();
      setFeatures(fetchedFeatures);
    })();
  }, [!!chrome]);

  return (
    <AppContext.Provider
      value={{
        rbac: rbac
          ? {
              read: rbac?.hasPermission('content-sources', 'repositories', 'read'),
              write: rbac?.hasPermission('content-sources', 'repositories', 'write'),
            }
          : undefined,
        features: features,
        isFetchingFeatures: isFetchingFeatures,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
