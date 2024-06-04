import { QueryClient, useMutation, useQuery } from 'react-query';

import useErrorNotification from 'Hooks/useErrorNotification';
import {
  TemplateFilterData,
  TemplateItem,
  fetchTemplate,
  getTemplates,
  TemplateCollectionResponse,
  createTemplate,
  TemplateRequest,
  deleteTemplateItem,
  EditTemplateRequest,
  EditTemplate,
} from './TemplateApi';
import useNotification from 'Hooks/useNotification';
import { AlertVariant } from '@patternfly/react-core';

export const FETCH_TEMPLATE_KEY = 'FETCH_TEMPLATE_KEY';
export const GET_TEMPLATES_KEY = 'GET_TEMPLATES_KEY';

export const useEditTemplateQuery = (queryClient: QueryClient, request: EditTemplateRequest) => {
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();
  return useMutation(() => EditTemplate(request), {
    onSuccess: () => {
      notify({
        variant: AlertVariant.success,
        title: `Successfully edited template '${request.name}'`,
        id: 'edit-template-success',
      });

      queryClient.invalidateQueries(GET_TEMPLATES_KEY);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      errorNotifier(
        `Error editing template '${request.name}'`,
        'An error occurred',
        err,
        'edit-template-error',
      );
    },
  });
};

export const useFetchTemplate = (uuid: string, enabled: boolean = true) => {
  const errorNotifier = useErrorNotification();
  return useQuery<TemplateItem>([FETCH_TEMPLATE_KEY, uuid], () => fetchTemplate(uuid), {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) =>
      errorNotifier(
        'Unable to find associated content template.',
        'An error occurred',
        err,
        'fetch-template-error',
      ),
    keepPreviousData: true,
    staleTime: 20000,
    enabled,
  });
};

export const useTemplateList = (
  page: number,
  limit: number,
  sortBy: string,
  filterData: TemplateFilterData,
) => {
  const errorNotifier = useErrorNotification();
  return useQuery<TemplateCollectionResponse>(
    // Below MUST match the "templateListKeyArray" seen below (once written) in the useDeleteTemplate.
    [GET_TEMPLATES_KEY, page, limit, sortBy, ...Object.values(filterData)],
    () => getTemplates(page, limit, sortBy, filterData),
    {
      onError: (err) => {
        errorNotifier(
          'Unable to get content template list',
          'An error occurred',
          err,
          'template-list-error',
        );
      },
      keepPreviousData: true,
      staleTime: 20000,
    },
  );
};

export const useCreateTemplateQuery = (queryClient: QueryClient, request: TemplateRequest) => {
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();
  return useMutation(() => createTemplate(request), {
    onSuccess: () => {
      notify({
        variant: AlertVariant.success,
        title: `Content Template "${request?.name}" created`,
        id: 'create-template-success',
      });

      queryClient.invalidateQueries(GET_TEMPLATES_KEY);
      queryClient.invalidateQueries(FETCH_TEMPLATE_KEY);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      errorNotifier(
        'Error creating content template',
        'An error occurred',
        err,
        'create-template-error',
      );
    },
  });
};

export const useDeleteTemplateItemMutate = (
  queryClient: QueryClient,
  page: number,
  limit: number,
  sortBy: string,
  filterData: TemplateFilterData,
) => {
  // Below MUST match the "useTemplateList" key found above or updates will fail.
  const contentListKeyArray = [
    GET_TEMPLATES_KEY,
    page,
    limit,
    sortBy,
    ...Object.values(filterData),
  ];
  const errorNotifier = useErrorNotification();
  return useMutation(deleteTemplateItem, {
    onMutate: async (uuid: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(contentListKeyArray);
      // Snapshot the previous value
      const previousData: Partial<TemplateCollectionResponse> =
        queryClient.getQueryData(contentListKeyArray) || {};

      // Optimistically update to the new value
      queryClient.setQueryData(contentListKeyArray, () => ({
        ...previousData,
        data: previousData.data?.filter((data) => uuid !== data.uuid),
        meta: previousData.meta
          ? {
              ...previousData.meta,
              count: previousData.meta.count ? previousData.meta.count - 1 : 1,
            }
          : undefined,
      }));
      // Return a context object with the snapshotted value
      return { previousData, queryClient };
    },
    onSuccess: (_data, _variables, context) => {
      // Update all of the existing calls "count" to prevent number jumping on pagination
      const { previousData } = context as {
        previousData: TemplateCollectionResponse;
      };
      queryClient.setQueriesData(
        GET_TEMPLATES_KEY,
        (data: Partial<TemplateCollectionResponse> = {}) => {
          if (data?.meta?.count) {
            data.meta.count = previousData?.meta?.count - 1;
          }

          return data;
        },
      );
      queryClient.invalidateQueries(GET_TEMPLATES_KEY);
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any, _newData, context) => {
      if (context) {
        const { previousData } = context as {
          previousData: TemplateCollectionResponse;
        };
        queryClient.setQueryData(contentListKeyArray, previousData);
      }
      errorNotifier(
        'Unable to delete the given template.',
        'An error occurred',
        err,
        'delete-template-error',
      );
    },
  });
};
