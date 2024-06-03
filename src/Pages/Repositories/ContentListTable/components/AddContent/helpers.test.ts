import { FormikErrors } from 'formik';
import { ValidationResponse } from '../../../../../services/Content/ContentApi';
import {
  FormikValues,
  REGEX_URL,
  failedFileUpload,
  isValidURL,
  mapFormikToAPIValues,
  mapValidationData,
  maxUploadSize,
} from './helpers';

it('REGEX_URL', () => {
  const regex = new RegExp(REGEX_URL);
  expect('https://www.google.com'.match(regex)).toBeTruthy();
  expect('BANANA!'.match(regex)).toBeFalsy();
  expect('http://e.ca'.match(regex)).toBeTruthy();
});

it('isValidURL', () => {
  expect(isValidURL('https://www.google.com')).toBeTruthy();
  expect(isValidURL('BANANA!')).toBeFalsy();
  expect(isValidURL('http://e.ca')).toBeTruthy();
});

it('mapFormikToAPIValues', () => {
  const values = [
    {
      name: 'AwesomeNamewtmsgnum0',
      url: 'https://google.ca/wtmsgnum0/x86_64/el7',
      gpgKey: '',
      arch: 'x86_64',
      versions: ['el7'],
      gpgLoading: false,
      expanded: false,
      metadataVerification: false,
      snapshot: true,
      modularityFilteringEnabled: true,
    },
  ];

  const mappedValues = [
    {
      name: 'AwesomeNamewtmsgnum0',
      url: 'https://google.ca/wtmsgnum0/x86_64/el7',
      distribution_arch: 'x86_64',
      distribution_versions: ['el7'],
      gpg_key: '',
      metadata_verification: false,
      snapshot: true,
      module_hotfixes: false,
    },
  ];

  expect(mapFormikToAPIValues(values)).toEqual(mappedValues);
});

it('mapValidationData', () => {
  const validationData: ValidationResponse = [
    {
      name: {
        skipped: false,
        valid: true,
        error: '',
      },
      url: {
        skipped: false,
        valid: true,
        error:
          'Error fetching YUM metadata: Head "https://bobjull.co": dial tcp: lookup bobjull.co: no such host',
        http_code: 0,
        metadata_present: false,
        metadata_signature_present: false,
      },
    },
  ];
  const formikErrors = [];
  const success = [
    {
      url: 'Error fetching YUM metadata: Head "https://bobjull.co": dial tcp: lookup bobjull.co: no such host',
    },
  ];
  expect(mapValidationData([], [])).toEqual([]);
  expect(mapValidationData(validationData, formikErrors)).toEqual(success);
});

it('mapValidationData, ensure url error heirarchy', () => {
  const validationData: ValidationResponse = [
    {
      name: {
        skipped: false,
        valid: true,
        error: '',
      },
      url: {
        skipped: false,
        valid: true,
        error:
          'Error fetching YUM metadata: Head "https://bobjull.co": dial tcp: lookup bobjull.co: no such host',
        http_code: 0,
        metadata_present: false,
        metadata_signature_present: false,
      },
      // We expect gpgKey errors not to be shown, as they are dependent on the url which has an error!
      gpg_key: {
        skipped: false,
        valid: false,
        error: 'Error loading GPG Key: unexpected EOF.  Is this a valid GPG Key?',
      },
    },
  ];
  const formikErrors: FormikErrors<FormikValues | undefined>[] = [
    { name: 'name error booga booga!' },
  ];
  const success = [
    {
      name: 'name error booga booga!',
      url: 'Error fetching YUM metadata: Head "https://bobjull.co": dial tcp: lookup bobjull.co: no such host',
    },
  ];

  expect(mapValidationData(validationData, formikErrors)).toEqual(success);
});

it('Notifies on file upload failure due to size', () => {
  const notif = jest.fn((payload) => payload);
  const file = new File([''], 'filename', { type: 'text/html' });
  Object.defineProperty(file, 'size', { value: maxUploadSize + 1 });

  failedFileUpload(
    [
      {
        file,
        errors: [],
      },
    ],
    notif,
  );
  expect(notif.mock.calls).toHaveLength(1);
  expect(notif.mock.calls[0][0].description).toMatch(/file is larger than/);
});

it('Notifies on file upload failure due to too many files', () => {
  const notif = jest.fn((payload) => payload);
  const file = new File([''], 'filename', { type: 'text/html' });

  failedFileUpload(
    [
      {
        file,
        errors: [],
      },
      {
        file,
        errors: [],
      },
    ],
    notif,
  );
  expect(notif.mock.calls).toHaveLength(1);
  expect(notif.mock.calls[0][0].description).toMatch(/Only a single file upload is supported/);
});
