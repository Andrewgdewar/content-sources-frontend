import axios from 'axios';
import { Links, Meta } from '../Content/ContentApi';
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
}

export interface TemplateCollectionResponse {
  data: Array<TemplateItem>;
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
