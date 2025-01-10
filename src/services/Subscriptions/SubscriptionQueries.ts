import { Subscriptions, getSubscriptions, getEphemeralSubscriptions } from './SubscriptionApi';
import useErrorNotification from 'Hooks/useErrorNotification';
import useIsEphemeralEnv from 'Hooks/useIsEphemeralEnv';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

const SUBSCRIPTION_CHECK_KEY = 'SUBSCRIPTION_CHECK_KEY';

export const useFetchSubscriptionsQuery = () => {
  const errorNotifier = useErrorNotification();
  const isEphemeral = useIsEphemeralEnv();
  const queryFn = useMemo(
    () => (isEphemeral ? getEphemeralSubscriptions() : getSubscriptions()),
    [isEphemeral],
  );

  return useQuery<Subscriptions>([SUBSCRIPTION_CHECK_KEY], () => queryFn, {
    onError: (err) =>
      errorNotifier(
        'Error fetching subscriptions',
        'An error occurred',
        err,
        'fetch-subscriptions-error',
      ),
  });
};
