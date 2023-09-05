import { CreateContentRequestItem } from '../../services/Content/ContentApi';
import { defaultPopularRepository } from '../../testingHelpers';
import { repoToRequestItem } from './helper';

it('repoToRequestItem', () => {
  const requestItem: CreateContentRequestItem = {
    name: defaultPopularRepository.suggested_name,
    url: defaultPopularRepository.url,
    distribution_versions: defaultPopularRepository.distribution_versions,
    distribution_arch: defaultPopularRepository.distribution_arch,
    gpg_key: defaultPopularRepository.gpg_key,
    metadata_verification: defaultPopularRepository.metadata_verification,
    snapshot: false,
  };
  expect(repoToRequestItem(defaultPopularRepository)).toEqual(requestItem);
});
