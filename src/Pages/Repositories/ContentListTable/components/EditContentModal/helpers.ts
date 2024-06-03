import { ContentItem, EditContentRequest } from '../../../../../services/Content/ContentApi';

export interface FormikEditValues {
  name: string;
  url: string;
  gpgKey: string;
  metadataVerification: boolean;
  arch: string;
  versions: string[];
  gpgLoading: boolean;
  expanded: boolean;
  uuid: string;
  snapshot: boolean;
  modularityFilteringEnabled: boolean;
}

export const mapFormikToEditAPIValues = (formikValues: FormikEditValues[]): EditContentRequest =>
  formikValues.map(
    ({
      name,
      url,
      arch,
      versions,
      gpgKey,
      metadataVerification,
      uuid,
      snapshot,
      modularityFilteringEnabled,
    }) => ({
      uuid,
      name,
      url,
      distribution_arch: arch,
      distribution_versions: versions,
      gpg_key: gpgKey,
      metadata_verification: metadataVerification,
      snapshot,
      module_hotfixes: !modularityFilteringEnabled,
    }),
  );

export const mapToDefaultFormikValues = (values: ContentItem[]): FormikEditValues[] =>
  values.map(
    (
      {
        name,
        url,
        distribution_arch: arch,
        distribution_versions: versions,
        uuid,
        gpg_key: gpgKey,
        metadata_verification: metadataVerification,
        snapshot,
        module_hotfixes,
      },
      index,
    ) => ({
      name,
      url,
      arch,
      versions,
      gpgKey,
      gpgLoading: false,
      metadataVerification,
      expanded: index + 1 === values.length,
      uuid,
      snapshot,
      modularityFilteringEnabled: !module_hotfixes,
    }),
  );

export const mapToContentItemsToEditContentRequest = (values: ContentItem[]): EditContentRequest =>
  mapFormikToEditAPIValues(mapToDefaultFormikValues(values));
