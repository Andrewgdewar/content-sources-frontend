import { PopularRepository, CreateContentRequestItem } from '../../services/Content/ContentApi';

export const repoToRequestItem = (
  repo: PopularRepository,
  snapshot = false,
): CreateContentRequestItem => {
  const {
    suggested_name,
    url,
    distribution_versions,
    distribution_arch,
    gpg_key,
    metadata_verification,
  } = repo;

  return {
    name: suggested_name,
    url,
    distribution_versions,
    distribution_arch,
    gpg_key,
    metadata_verification,
    snapshot,
  };
};
