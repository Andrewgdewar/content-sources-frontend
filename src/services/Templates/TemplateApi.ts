import axios from 'axios';
import { Links, Meta, type ErrataResponse, type PackageItem } from '../Content/ContentApi';
import { objectToUrlParams } from 'helpers';

export interface TemplateRequest {
  arch: string;
  date: string;
  description: string;
  name: string;
  repository_uuids: string[];
  version: string;
}

export interface EditTemplateRequest extends TemplateRequest {
  uuid: string;
}

export interface TemplateItem {
  uuid: string;
  name: string;
  org_id: string;
  description: string;
  repository_uuids: string[];
  arch: string;
  version: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  last_updated_by?: string;
}

export interface TemplateCollectionResponse {
  data: Array<TemplateItem>;
  links: Links;
  meta: Meta;
}

export interface SnapshotRpmCollectionResponse {
  data: Array<PackageItem>;
  links: Links;
  meta: Meta;
}

export type TemplateFilterData = {
  arch: string;
  version: string;
  search: string;
};

export const getTemplates: (
  page: number,
  limit: number,
  sortBy: string,
  templateFilterData: TemplateFilterData,
) => Promise<TemplateCollectionResponse> = async (
  page,
  limit,
  sortBy,
  { search, arch, version },
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1/templates/?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
      arch,
      version,
      sort_by: sortBy,
    })}`,
  );
  return data;
};

export const getTemplatePackages: (
  page: number,
  limit: number,
  search: string,
  uuid: string,
) => Promise<SnapshotRpmCollectionResponse> = async (page, limit, search, uuid) => {
  const { data } = await axios.get(
    `/api/content-sources/v1/templates/${uuid}/rpms?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      uuid,
      search,
    })}`,
  );
  return data;
};

export const getTemplateErrata: (
  uuid: string,
  page: number,
  limit: number,
  search: string,
  type: string[],
  severity: string[],
  sortBy: string,
) => Promise<ErrataResponse> = async (
  uuid: string,
  page: number,
  limit: number,
  search: string,
  type: string[],
  severity: string[],
  sortBy: string,
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1/templates/${uuid}/errata?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
      type: type.join(',').toLowerCase(),
      severity: severity.join(','),
      sort_by: sortBy,
    })}`,
  );
  return data;
};

export const EditTemplate: (request: EditTemplateRequest) => Promise<void> = async (request) => {
  const { data } = await axios.patch(
    `/api/content-sources/v1.0/templates/${request.uuid}`,
    request,
  );
  return data;
};

export const fetchTemplate: (uuid: string) => Promise<TemplateItem> = async (uuid: string) => {
  const { data } = await axios.get(`/api/content-sources/v1/templates/${uuid}`);
  return data;
};

export const deleteTemplateItem: (uuid: string) => Promise<void> = async (uuid: string) => {
  const { data } = await axios.delete(`/api/content-sources/v1/templates/${uuid}`);
  return data;
};

export const createTemplate: (request: TemplateRequest) => Promise<TemplateItem> = async (
  request,
) => {
  const { data } = await axios.post('/api/content-sources/v1.0/templates/', request);
  return data;
};
