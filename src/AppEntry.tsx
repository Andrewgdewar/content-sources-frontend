import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import * as Redux from 'redux';

import App from './App';
import 'index.scss';
import { ContextProvider } from './middleware/AppContext';
import { createStore, restoreStore } from './store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

interface AppEntryProps {
  logger?: Redux.Middleware;
}

export default function AppEntry({ logger }: AppEntryProps) {
  const store = React.useMemo(() => {
    restoreStore();
    if (logger) {
      return createStore(logger).store;
    }
    return createStore().store;
  }, [logger]);

  useEffect(() => {
    insights?.chrome?.appAction?.('view-list-page');
  }, []);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ContextProvider>
          <App />
        </ContextProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
