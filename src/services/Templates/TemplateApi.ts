import axios from 'axios';
import {
  Links,
  Meta,
  type ErrataResponse,
  type PackageItem,
  SnapshotListResponse,
  SnapshotItem,
} from '../Content/ContentApi';
import { objectToUrlParams } from 'helpers';
import { AdminTask } from 'services/AdminTasks/AdminTaskApi';

export interface TemplateRequest {
  arch: string;
  date: string | null;
  description: string;
  name: string;
  repository_uuids: string[];
  version: string;
  use_latest: boolean;
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
  snapshots: SnapshotItem[];
  to_be_deleted_snapshots: SnapshotItem[];
  arch: string;
  version: string;
  date: string;
  use_latest: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_updated_by: string;
  last_update_task_uuid?: string;
  last_update_task?: AdminTask;
  last_update_snapshot_error: string;
  rhsm_environment_created: boolean;
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
  repository_uuids: string;
  snapshot_uuids: string;
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
  { search, arch, version, repository_uuids, snapshot_uuids },
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1/templates/?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      search,
      arch,
      version,
      sort_by: sortBy,
      repository_uuids: repository_uuids,
      snapshot_uuids: snapshot_uuids,
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

export const getTemplateSnapshots: (
  uuid: string,
  page: number,
  limit: number,
  search: string,
  sortBy: string,
) => Promise<SnapshotListResponse> = async (
  uuid: string,
  page: number,
  limit: number,
  search: string,
  sortBy: string,
) => {
  const { data } = await axios.get(
    `/api/content-sources/v1/templates/${uuid}/snapshots/?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      repository_search: search,
      sort_by: sortBy,
    })}`,
  );
  return data;
};

export const getTemplatesForSnapshots: (
  snapshotUuids: string[],
) => Promise<TemplateCollectionResponse> = async (snapshotUuids: string[]) => {
  const { data } = await axios.get<TemplateCollectionResponse>(
    `/api/content-sources/v1/templates/?${objectToUrlParams({
      offset: '0',
      limit: '-1',
      snapshot_uuids: snapshotUuids.join(','),
    })}`,
  );
  return data;
};

export const EditTemplate: (request: EditTemplateRequest) => Promise<void> = async (request) => {
  const { data } = await axios.put(`/api/content-sources/v1.0/templates/${request.uuid}`, request);
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
