import { ContentItem } from '../../../../services/Content/ContentApi';
import { mapFormikToEditAPIValues, mapToDefaultFormikValues } from './helpers';

it('mapFormikToEditAPIValues', () => {
  const values = [
    {
      name: 'AwesomeNamewtmsgnum0',
      url: 'https://google.ca/wtmsgnum0/x86_64/el7',
      gpgKey: '',
      arch: 'x86_64',
      versions: ['el7'],
      gpgLoading: false,
      expanded: false,
      uuid: 'stuff',
      metadataVerification: false,
      snapshot: false,
    },
  ];

  const mappedValues = [
    {
      name: 'AwesomeNamewtmsgnum0',
      url: 'https://google.ca/wtmsgnum0/x86_64/el7',
      distribution_arch: 'x86_64',
      distribution_versions: ['el7'],
      gpg_key: '',
      uuid: 'stuff',
      snapshot: false,
      metadata_verification: false,
    },
  ];

  expect(mapFormikToEditAPIValues(values)).toEqual(mappedValues);
});

it('mapToDefaultFormikValues', () => {
  const validationData: ContentItem[] = [
    {
      uuid: 'stuffAndThings',
      name: 'stuffAndThings',
      url: 'stuffAndThings',
      package_count: 25,
      distribution_versions: ['version1', 'etc'],
      distribution_arch: 'stuffAndThings',
      status: 'stuffAndThings',
      last_introspection_error: 'stuffAndThings',
      last_introspection_time: 'stuffAndThings',
      failed_introspections_count: 0,
      account_id: 'stuffAndThings',
      org_id: 'stuffAndThings',
      gpg_key: 'stuffAndThings',
      metadata_verification: false,
      snapshot: false,
    },
  ];
  const mapped = [
    {
      name: 'stuffAndThings',
      url: 'stuffAndThings',
      arch: 'stuffAndThings',
      versions: ['version1', 'etc'],
      gpgKey: 'stuffAndThings',
      snapshot: false,
      gpgLoading: false,
      metadataVerification: false,
      expanded: true,
      uuid: 'stuffAndThings',
    },
  ];

  expect(mapToDefaultFormikValues([])).toEqual([]);
  expect(mapToDefaultFormikValues(validationData)).toEqual(mapped);
});
