import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useMemo } from 'react';

export default function useIsEphemeralEnv(): boolean {
  const { getEnvironment } = useChrome();
  const isQe = useMemo(() => getEnvironment() === 'qa', []);
  return isQe;
}
