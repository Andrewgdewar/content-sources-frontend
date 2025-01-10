import { isEmpty } from 'lodash';
import * as Yup from 'yup';
import { FormikErrors } from 'formik';
import {
  ContentOrigin,
  ValidationResponse,
  type ContentItem,
  type EditContentRequestItem,
} from 'services/Content/ContentApi';
import { NotificationPayload } from 'Hooks/useNotification';
import ERROR_CODE from './httpErrorCodes.json';
import { AlertVariant } from '@patternfly/react-core';

export enum ErrorCode {
  FileInvalidType = 'file-invalid-type',
  FileTooLarge = 'file-too-large',
  FileTooSmall = 'file-too-small',
  TooManyFiles = 'too-many-files',
}

export interface FileError {
  message: string;
  code: ErrorCode | string;
}

export interface FileRejection {
  file: File;
  errors: FileError[];
}

export interface FormikValues {
  uuid?: string;
  name: string;
  url: string;
  gpgKey: string;
  arch: string;
  versions: string[];
  gpgLoading: boolean;
  metadataVerification: boolean;
  snapshot: boolean;
  modularityFilteringEnabled: boolean;
  origin?: ContentOrigin;
}

export const getDefaultValues = (overrides: Partial<FormikValues> = {}): FormikValues => ({
  name: '',
  url: '',
  gpgKey: '',
  arch: 'any',
  versions: ['any'],
  gpgLoading: false,
  metadataVerification: false,
  snapshot: true,
  modularityFilteringEnabled: true,
  origin: ContentOrigin.EXTERNAL, // This needs to stay as EXTERNAL, will be updated if use clicks "upload"
  ...overrides,
});

export const mapContentItemToDefaultFormikValues = ({
  uuid,
  name,
  url,
  distribution_arch: arch,
  distribution_versions: versions,
  gpg_key: gpgKey,
  metadata_verification: metadataVerification,
  snapshot,
  module_hotfixes,
  ...rest
}: ContentItem): FormikValues => ({
  name,
  url,
  arch,
  versions,
  gpgKey,
  gpgLoading: false,
  metadataVerification,
  uuid,
  snapshot,
  modularityFilteringEnabled: !module_hotfixes,
  ...rest,
});

export const REGEX_URL =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const isValidURL = (val: string) => {
  if (!val) return false;
  const regex = new RegExp(REGEX_URL);
  return val.match(regex);
};

export const mapFormikToAPIValues = ({
  uuid,
  name,
  url,
  arch,
  versions,
  gpgKey,
  metadataVerification,
  snapshot,
  modularityFilteringEnabled,
  origin,
}: FormikValues): EditContentRequestItem =>
  ({
    uuid,
    name,
    url,
    distribution_arch: arch,
    distribution_versions: versions,
    gpg_key: gpgKey,
    snapshot,
    metadata_verification: metadataVerification,
    module_hotfixes: !modularityFilteringEnabled,
    origin,
  }) as EditContentRequestItem;

const mapNoMetaDataError = (response: ValidationResponse): Partial<ValidationResponse> => {
  if (isEmpty(response)) return {};
  const { url, ...rest } = response;
  return {
    ...rest,
    ...(url
      ? {
          url: {
            ...url,
            error:
              !url?.error && !url?.metadata_present
                ? `Unable to retrieve YUM Metadata, Recieved HTTP ${url?.http_code}: ${
                    url ? ERROR_CODE[url.http_code] : ''
                  }`
                : url?.error,
          },
        }
      : {}),
  };
};

export const mapValidationData = (
  validationData: ValidationResponse,
  formikErrors: FormikErrors<FormikValues | undefined>,
  removeUrl?: boolean,
): Record<string, string> => {
  const { name, url, gpg_key: gpgKey } = mapNoMetaDataError(validationData);

  const hasUrlErrors = url?.error || formikErrors?.url;
  const result = {
    // First apply the errors found in the ValidationAPI
    ...(name?.error ? { name: name?.error } : {}),
    ...(url?.error ? { url: url?.error } : {}),
    ...(!hasUrlErrors && gpgKey?.error ? { gpgKey: gpgKey?.error } : {}),
    // Overwrite any errors with errors found within the UI itself
    ...formikErrors,
  } as Record<string, string>;
  if (removeUrl) delete result?.url;
  return result;
};

export const validationSchema = (upload?: boolean) =>
  Yup.object().shape({
    name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
    ...(upload
      ? {}
      : { url: Yup.string().url('Invalid URL').required('Required').min(2, 'Too Short!') }),
  });

export const maxUploadSize = 32000;

export const failedFileUpload = (
  files: FileRejection[],
  notify: (arg: NotificationPayload) => void,
) => {
  let description = 'Check the file and try again.';
  if (files.length != 1) {
    description = 'Only a single file upload is supported.';
  } else if (files[0].file.size > maxUploadSize) {
    description = 'The file is larger than ' + maxUploadSize + ' bytes.';
  }
  notify({
    variant: AlertVariant.danger,
    title: 'There was an problem uploading the file.',
    description,
    id: 'file-upload-error',
  });
};
