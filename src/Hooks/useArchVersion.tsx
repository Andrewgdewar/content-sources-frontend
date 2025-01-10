import { useCallback, useMemo } from 'react';
import { useRepositoryParams } from 'services/Content/ContentQueries';

export default function useArchVersion() {
  const {
    isLoading,
    error,
    isError,
    data: { distribution_versions: distVersions, distribution_arches: distArches } = {
      distribution_versions: [],
      distribution_arches: [],
    },
  } = useRepositoryParams();

  const labelToName: Record<string, string> = useMemo(() => {
    const result = {};
    distArches.forEach(({ name, label }) => {
      result[label] = name;
    });
    distVersions.forEach(({ name, label }) => {
      result[label] = name;
    });
    return result;
  }, [distVersions, distArches]);

  const archesDisplay = useCallback(
    (arch: string = '') => labelToName[arch] || arch,
    [labelToName],
  );

  const versionDisplay = useCallback(
    (versions: string[]) => versions.map((version) => labelToName[version]).join(', '),
    [labelToName],
  );

  return { isLoading, error, isError, archesDisplay, versionDisplay };
}
