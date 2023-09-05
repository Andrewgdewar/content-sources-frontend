import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import * as Redux from 'redux';

import App from './App';
import { ContextProvider } from './middleware/AppContext';
import { createStore, resetStore } from './store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // TODO: Have a conversation about this
    },
  },
});

interface AppEntryProps {
  logger?: Redux.Middleware;
}

export default function AppEntry({ logger }: AppEntryProps) {
  const store = React.useMemo(() => {
    resetStore();
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
