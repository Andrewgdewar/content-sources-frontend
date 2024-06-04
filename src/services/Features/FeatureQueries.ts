import { useState } from 'react';
import { Features, getFeatures } from './FeatureApi';
import useErrorNotification from 'Hooks/useErrorNotification';

export const useFetchFeaturesQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const errorNotifier = useErrorNotification();

  const fetchFeatures = async (): Promise<Features | null> => {
    setIsLoading(true);
    let features: Features | null = null;
    try {
      features = await getFeatures();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      errorNotifier('Error fetching features', 'An error occurred', err, 'fetch-features-error');
    }
    setIsLoading(false);
    return features;
  };

  return { fetchFeatures, isLoading };
};
