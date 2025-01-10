import { useQuery } from 'react-query';
import {
  AdminTaskFilterData,
  AdminTaskListResponse,
  getAdminTasks,
  AdminTask,
  getAdminTask,
} from './AdminTaskApi';
import useErrorNotification from 'Hooks/useErrorNotification';

export const ADMIN_TASK_LIST_KEY = 'ADMIN_TASK_LIST_KEY';
export const ADMIN_TASK_KEY = 'ADMIN_TASK_KEY';

const ADMIN_TASK_LIST_POLLING_TIME = 15000; // 15 seconds

export const useAdminTaskListQuery = (
  page: number,
  limit: number,
  filterData: AdminTaskFilterData,
  sortBy: string,
  polling: boolean,
) => {
  const errorNotifier = useErrorNotification();
  const flattenedFilterData = Object.values(filterData).flat(1);
  return useQuery<AdminTaskListResponse>(
    [ADMIN_TASK_LIST_KEY, page, limit, sortBy, ...flattenedFilterData],
    () => getAdminTasks(page, limit, filterData, sortBy),
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        errorNotifier(
          'Unable to get admin task list',
          'An error occurred',
          err,
          'admin-task-list-error',
        );
      },
      refetchInterval: polling ? ADMIN_TASK_LIST_POLLING_TIME : undefined,
      refetchIntervalInBackground: false, // This prevents endless polling when our app isn't the focus tab in a browser
      refetchOnWindowFocus: polling, // If polling and navigate to another tab, on refocus, we want to poll once more. (This is based off of the stalestime below)
      keepPreviousData: true,
      staleTime: 20000,
    },
  );
};

export const useFetchAdminTaskQuery = (uuid?: string) => {
  const errorNotifier = useErrorNotification();
  return useQuery<AdminTask>(
    [ADMIN_TASK_KEY, uuid],
    () => getAdminTask(uuid as string), // Will be disabled if undefined
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        errorNotifier(
          'Unable to find an Admin task with the given UUID.',
          'An error occurred',
          err,
          'fetch-admin-task-error',
        );
      },
      keepPreviousData: true,
      staleTime: 20000,
    },
  );
};
