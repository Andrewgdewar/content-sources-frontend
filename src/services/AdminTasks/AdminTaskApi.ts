import axios from 'axios';
import { Links, Meta } from '../Content/ContentApi';
import { objectToUrlParams } from 'helpers';

export interface AdminTaskFilterData {
  statuses: string[];
  accountId: string;
  orgId: string;
}

export interface PulpData {
  sync?: Record<string, unknown>;
  publication?: Record<string, unknown>;
  distribution?: Record<string, unknown>;
}

export interface AdminTask {
  uuid: string;
  account_id?: string;
  org_id: string;
  typename: string;
  status: 'running' | 'failed' | 'completed' | 'canceled' | 'pending';
  queued_at: string;
  started_at: string;
  finished_at: string;
  error: string;
  payload?: Record<string, unknown>;
  pulp?: PulpData;
}

export type AdminTaskList = AdminTask[];

export interface AdminTaskListResponse {
  data: AdminTaskList;
  links: Links;
  meta: Meta;
}

export const getAdminTasks: (
  page: number,
  limit: number,
  filterData: AdminTaskFilterData,
  sortBy: string,
) => Promise<AdminTaskListResponse> = async (page, limit, filterData, sortBy) => {
  const accountIdParam = filterData.accountId;
  const orgIdParam = filterData.orgId;
  const statusParam = filterData?.statuses?.join(',').toLowerCase();
  const { data } = await axios.get(
    `/api/content-sources/v1/admin/tasks/?${objectToUrlParams({
      offset: ((page - 1) * limit).toString(),
      limit: limit?.toString(),
      account_id: accountIdParam,
      org_id: orgIdParam,
      status: statusParam,
      sort_by: sortBy,
    })}`,
  );
  return data;
};

export const getAdminTask: (uuid: string) => Promise<AdminTask> = async (uuid) => {
  const { data } = await axios.get(`/api/content-sources/v1/admin/tasks/${uuid}`);
  return data;
};
