import { isEmpty } from 'lodash';
import * as Yup from 'yup';
import { FormikErrors } from 'formik';
import { ValidationResponse } from '../../../../services/Content/ContentApi';
import { NotificationPayload } from '../../../../Hooks/useNotification';
import ERROR_CODE from './httpErrorCodes.json';
import { AlertVariant } from '@patternfly/react-core';

export interface FormikValues {
  name: string;
  url: string;
  gpgKey: string;
  arch: string;
  versions: string[];
  gpgLoading: boolean;
  metadataVerification: boolean;
  expanded: boolean;
  snapshot: boolean;
}

export const getDefaultFormikValues = (overrides: Partial<FormikValues> = {}): FormikValues => ({
  name: '',
  url: '',
  gpgKey: '',
  arch: 'any',
  versions: ['any'],
  gpgLoading: false,
  expanded: true,
  metadataVerification: false,
  snapshot: false,
  ...overrides,
});

export const REGEX_URL =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const isValidURL = (val: string) => {
  if (!val) return false;
  const regex = new RegExp(REGEX_URL);
  return val.match(regex);
};

export const mapFormikToAPIValues = (formikValues: FormikValues[]) =>
  formikValues.map(({ name, url, arch, versions, gpgKey, metadataVerification, snapshot }) => ({
    name,
    url,
    distribution_arch: arch,
    distribution_versions: versions,
    gpg_key: gpgKey,
    snapshot,
    metadata_verification: metadataVerification,
  }));

const mapNoMetaDataError = (validationData: ValidationResponse) =>
  validationData.map(({ url, ...rest }) => ({
    ...rest,
    url: {
      ...url,
      error:
        !url?.error && !url?.metadata_present
          ? `Unable to retrieve YUM Metadata, Recieved HTTP ${url?.http_code}: ${
              url ? ERROR_CODE[url.http_code] : ''
            }`
          : url?.error,
    },
  }));

export const mapValidationData = (
  validationData: ValidationResponse,
  formikErrors: FormikErrors<FormikValues | undefined>[],
) => {
  const updatedValidationData = mapNoMetaDataError(validationData);
  const errors = updatedValidationData.map(({ name, url, gpg_key: gpgKey }, index: number) => ({
    // First apply the errors found in the ValidationAPI
    ...(name?.error ? { name: name?.error } : {}),
    ...(url?.error ? { url: url?.error } : {}),
    ...(gpgKey?.error ? { gpgKey: gpgKey?.error } : {}),
    // Overwrite any errors with errors found within the UI itself
    ...formikErrors[index],
  }));

  if (errors.every((err) => isEmpty(err))) {
    return [];
  }

  return errors;
};

export const makeValidationSchema = () => {
  // This adds the uniqueProperty function to the below schema validation
  Yup.addMethod(Yup.object, 'uniqueProperty', function (propertyName, message) {
    return this.test('unique', message, function (value) {
      if (!value || !value[propertyName]) {
        return true;
      }
      if (
        this.parent.filter((v) => v !== value).some((v) => v[propertyName] === value[propertyName])
      ) {
        throw this.createError({
          path: `${this.path}.${propertyName}`,
        });
      }

      return true;
    });
  });

  return Yup.array(
    Yup.object()
      .shape({
        name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
        url: Yup.string().url('Invalid URL').required('Required'),
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      .uniqueProperty('name', 'Names must be unique')
      .uniqueProperty('url', 'Url\'s must be unique'),
  );
};

export const maxUploadSize = 32000;
export const failedFileUpload = (files: File[], notify: (arg: NotificationPayload) => void) => {
  let description = 'Check the file and try again.';
  if (files.length != 1) {
    description = 'Only a single file upload is supported.';
  } else if (files[0].size > maxUploadSize) {
    description = 'The file is larger than ' + maxUploadSize + ' bytes.';
  }
  notify({
    variant: AlertVariant.danger,
    title: 'There was an problem uploading the file.',
    description,
  });
};
