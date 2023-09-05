import {
  Bullseye,
  Button,
  Flex,
  FlexItem,
  Grid,
  OnPerPageSelect,
  OnSetPage,
  Pagination,
  PaginationVariant,
  Spinner,
} from '@patternfly/react-core';
import {
  ActionsColumn,
  IAction,
  TableComposable,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  ThProps,
  Tr,
} from '@patternfly/react-table';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { useCallback, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import {
  ContentItem,
  FilterData,
  IntrospectRepositoryRequestItem,
} from '../../services/Content/ContentApi';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';

import {
  useBulkDeleteContentItemMutate,
  useContentListQuery,
  useDeleteContentItemMutate,
  useIntrospectRepositoryMutate,
  useRepositoryParams,
} from '../../services/Content/ContentQueries';
import ContentListFilters from './components/ContentListFilters';
import Hide from '../../components/Hide/Hide';
import EmptyTableState from '../../components/EmptyTableState/EmptyTableState';
import { useQueryClient } from 'react-query';
import StatusIcon from './components/StatusIcon';
import UrlWithExternalIcon from '../../components/UrlWithLinkIcon/UrlWithLinkIcon';
import PackageCount from './components/PackageCount';
import { useAppContext } from '../../middleware/AppContext';
import ConditionalTooltip from '../../components/ConditionalTooltip/ConditionalTooltip';
import dayjs from 'dayjs';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
  },
  mainContainer100Height: {
    composes: ['$mainContainer'], // This extends another class within this stylesheet
    minHeight: '100%',
  },
  topContainer: {
    justifyContent: 'space-between',
    padding: '16px 24px', // This is needed
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
  invisible: {
    opacity: 0,
  },
  checkboxMinWidth: {
    minWidth: '45px!important',
  },
});

const perPageKey = 'contentListPerPage';

const ContentListTable = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { rbac, features } = useAppContext();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');
  const [checkedRepositories, setCheckedRepositories] = useState(new Set<string>());

  const [filterData, setFilterData] = useState<FilterData>({
    searchQuery: '',
    versions: [],
    arches: [],
    statuses: [],
  });

  const clearFilters = () =>
    setFilterData({ searchQuery: '', versions: [], arches: [], statuses: [] });

  const notFiltered =
    !filterData.arches?.length &&
    filterData.searchQuery === '' &&
    !filterData.versions?.length &&
    !filterData.statuses?.length;

  const {
    isLoading: repositoryParamsLoading,
    error: repositoryParamsError,
    isError: repositoryParamsIsError,
    data: { distribution_versions: distVersions, distribution_arches: distArches } = {
      distribution_versions: [],
      distribution_arches: [],
    },
  } = useRepositoryParams();

  const columnSortAttributes = [
    'name',
    'distribution_arch',
    'distribution_versions',
    'package_count',
    'last_introspection_time',
    'status',
  ];

  const sortString = (): string =>
    columnSortAttributes[activeSortIndex] + ':' + activeSortDirection;

  const {
    isLoading,
    error,
    isError,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useContentListQuery(page, perPage, filterData, sortString());

  const { mutateAsync: deleteItem, isLoading: isDeleting } = useDeleteContentItemMutate(
    queryClient,
    page,
    perPage,
    filterData,
    sortString(),
  );

  const { mutateAsync: introspectRepository, isLoading: isIntrospecting } =
    useIntrospectRepositoryMutate(queryClient, page, perPage, filterData, sortString());

  const introspectRepoForUuid = (uuid: string): Promise<void> =>
    introspectRepository({ uuid: uuid, reset_count: true } as IntrospectRepositoryRequestItem);

  const { mutateAsync: deleteItems, isLoading: isDeletingItems } = useBulkDeleteContentItemMutate(
    queryClient,
    checkedRepositories,
    page,
    perPage,
    filterData,
    sortString(),
  );

  // Other update actions will be added to this later.
  const actionTakingPlace =
    isDeleting || isFetching || repositoryParamsLoading || isIntrospecting || isDeletingItems;

  const onSetPage: OnSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect: OnPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload
    localStorage.setItem(perPageKey, newPerPage.toString());
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const sortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc', // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const columnHeaders = [
    'Name',
    'Architecture',
    'Versions',
    'Packages',
    'Last Introspection',
    'Status',
  ];

  const archesDisplay = (arch: string) => distArches.find(({ label }) => arch === label)?.name;

  const versionDisplay = (versions: Array<string>): string =>
    distVersions
      .filter(({ label }) => versions?.includes(label))
      .map(({ name }) => name)
      .join(', ');

  const lastIntrospectionDisplay = (time?: string): string =>
    time === '' || time === undefined ? 'Never' : dayjs(time).fromNow();

  // Error is caught in the wrapper component
  if (isError) throw error;
  if (repositoryParamsIsError) throw repositoryParamsError;

  const {
    data: contentList = [],
    meta: { count = 0 },
  } = data;

  const rowActions = useCallback(
    (rowData: ContentItem): IAction[] => [
      {
        isDisabled: actionTakingPlace,
        title: 'Edit',
        onClick: () => {
          navigate(`edit-repository?repoUUIDS=${rowData.uuid}`);
        },
      },
      ...(features?.snapshots?.accessible
        ? [
            {
              isDisabled:
                actionTakingPlace ||
                !rowData.snapshot ||
                !(rowData.snapshot && rowData.last_snapshot_uuid),
              title:
                rowData.snapshot && rowData.last_snapshot_uuid
                  ? 'View all snapshots'
                  : 'No snapshots yet',
              onClick: () => {
                navigate(`${rowData.uuid}/snapshots`);
              },
            },
          ]
        : []),
      {
        isDisabled: actionTakingPlace || rowData?.status == 'Retrying',
        title: 'Introspect Now',
        onClick: () => introspectRepoForUuid(rowData?.uuid).then(clearCheckedRepositories),
      },
      { isSeparator: true },
      {
        title: 'Delete',
        onClick: () =>
          deleteItem(rowData?.uuid).then(() => {
            clearCheckedRepositories();
            // If this is the last item on a page, go to previous page.
            if (page > 1 && count / perPage + 1 >= page && (count - 1) % perPage === 0) {
              setPage(page - 1);
            }
          }),
      },
    ],
    [actionTakingPlace, checkedRepositories],
  );

  const clearCheckedRepositories = () => setCheckedRepositories(new Set<string>());

  // Applied to all repos on current page
  const selectAllRepos = (_, checked: boolean) => {
    if (checked) {
      const newSet = new Set<string>(checkedRepositories);
      data.data
        .filter((contentItem) => repoCanBeChecked(contentItem))
        .forEach((contentItem) => newSet.add(contentItem.uuid));
      setCheckedRepositories(newSet);
    } else {
      const newSet = new Set<string>(checkedRepositories);
      for (const contentItem of data.data) {
        newSet.delete(contentItem.uuid);
      }
      setCheckedRepositories(newSet);
    }
  };

  const repoCanBeChecked = (contentItem: ContentItem) => contentItem.status !== 'Pending';

  const atLeastOneRepoChecked = useMemo(() => checkedRepositories.size >= 1, [checkedRepositories]);

  const areAllReposPending = useMemo(
    () => data.data.every((contentItem) => !repoCanBeChecked(contentItem)),
    [data],
  );

  const areAllReposSelected = useMemo(() => {
    let atLeastOneSelectedOnPage = false;
    const allSelectedOrPending = data.data.every((contentItem) => {
      if (checkedRepositories.has(contentItem.uuid)) {
        atLeastOneSelectedOnPage = true;
      }
      return !repoCanBeChecked(contentItem) || checkedRepositories.has(contentItem.uuid);
    });
    // Returns false if all repos on current page are pending (none selected)
    return allSelectedOrPending && atLeastOneSelectedOnPage;
  }, [data, checkedRepositories]);

  const onSelectRepo = (uuid: string, value: boolean) => {
    const newSet = new Set<string>(checkedRepositories);
    if (value) {
      newSet.add(uuid);
    } else {
      newSet.delete(uuid);
    }
    setCheckedRepositories(newSet);
  };

  const deleteCheckedRepos = () =>
    deleteItems(checkedRepositories).then(() => {
      const newMaxPage = Math.ceil((count - checkedRepositories.size) / perPage);
      if (page > 1 && newMaxPage < page) {
        setPage(newMaxPage);
      }
      clearCheckedRepositories();
    });

  const itemName = 'custom repositories';
  const notFilteredBody = 'To get started, create a custom repository';

  const countIsZero = count === 0;
  const showLoader = countIsZero && notFiltered && !isLoading;
  return (
    <>
      <Outlet context={{ clearCheckedRepositories }} />
      {showLoader ? (
        <Bullseye data-ouia-safe={!actionTakingPlace} data-ouia-component-id='content_list_page'>
          <EmptyTableState
            notFiltered={notFiltered}
            clearFilters={clearFilters}
            itemName={itemName}
            notFilteredBody={notFilteredBody}
            notFilteredButton={
              <ConditionalTooltip
                content='You do not have the required permissions to perform this action.'
                show={!rbac?.write}
                setDisabled
              >
                <Button
                  id='createContentSourceButton'
                  ouiaId='create_content_source'
                  variant='primary'
                  isDisabled={isLoading}
                  onClick={() => navigate('add-repository')}
                >
                  Add repositories
                </Button>
              </ConditionalTooltip>
            }
          />
        </Bullseye>
      ) : (
        <Grid
          data-ouia-safe={!actionTakingPlace}
          data-ouia-component-id='content_list_page'
          className={countIsZero ? classes.mainContainer100Height : classes.mainContainer}
        >
          <Flex className={classes.topContainer}>
            <ContentListFilters
              isLoading={isLoading}
              setFilterData={(values) => {
                setFilterData(values);
                setPage(1);
              }}
              filterData={filterData}
              atLeastOneRepoChecked={atLeastOneRepoChecked}
              numberOfReposChecked={checkedRepositories.size}
              deleteCheckedRepos={deleteCheckedRepos}
            />
            <FlexItem>
              <Hide hide={countIsZero}>
                <Pagination
                  id='top-pagination-id'
                  widgetId='topPaginationWidgetId'
                  perPageComponent='button'
                  isDisabled={isLoading}
                  itemCount={count}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  isCompact
                  onPerPageSelect={onPerPageSelect}
                />
              </Hide>
            </FlexItem>
          </Flex>
          <Hide hide={!isLoading}>
            <Grid className={classes.mainContainer}>
              <SkeletonTable
                rowSize={perPage}
                colSize={columnHeaders.length}
                variant={TableVariant.compact}
              />
            </Grid>
          </Hide>
          <Hide hide={countIsZero || isLoading}>
            <>
              <TableComposable
                aria-label='Custom repositories table'
                ouiaId='custom_repositories_table'
                variant='compact'
              >
                <Thead>
                  <Tr>
                    <Hide hide={!rbac?.write}>
                      <Th
                        className={classes.checkboxMinWidth}
                        select={{
                          onSelect: selectAllRepos,
                          isSelected: areAllReposSelected,
                          isHeaderSelectDisabled: areAllReposPending,
                        }}
                      />
                    </Hide>
                    {columnHeaders.map((columnHeader, index) => (
                      <Th key={columnHeader + 'column'} sort={sortParams(index)}>
                        {columnHeader}
                      </Th>
                    ))}
                    <Th>
                      <Spinner size='md' className={actionTakingPlace ? '' : classes.invisible} />
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {contentList.map((rowData: ContentItem, index) => {
                    const {
                      uuid,
                      name,
                      url,
                      distribution_arch,
                      distribution_versions,
                      last_introspection_time,
                    } = rowData;
                    return (
                      <Tr key={uuid}>
                        <Hide hide={!rbac?.write}>
                          <Td
                            select={{
                              rowIndex: index,
                              onSelect: (_event, isSelecting) =>
                                onSelectRepo(rowData.uuid, isSelecting),
                              isSelected: checkedRepositories.has(rowData.uuid),
                              disable: !repoCanBeChecked(rowData),
                            }}
                          />
                        </Hide>
                        <Td>
                          {name}
                          <br />
                          <UrlWithExternalIcon href={url} />
                        </Td>
                        <Td>{archesDisplay(distribution_arch)}</Td>
                        <Td>{versionDisplay(distribution_versions)}</Td>
                        <Td>
                          <PackageCount rowData={rowData} />
                        </Td>
                        <Td>{lastIntrospectionDisplay(last_introspection_time)}</Td>
                        <Td>
                          <StatusIcon rowData={rowData} retryHandler={introspectRepoForUuid} />
                        </Td>
                        <Td isActionCell>
                          <ConditionalTooltip
                            content={
                              rowData?.status == 'Pending'
                                ? 'Introspection is in progress'
                                : 'You do not have the required permissions to perform this action.'
                            }
                            show={!rbac?.write || rowData?.status === 'Pending'}
                            setDisabled
                          >
                            <ActionsColumn items={rowActions(rowData)} />
                          </ConditionalTooltip>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </TableComposable>
              <Flex className={classes.bottomContainer}>
                <FlexItem />
                <FlexItem>
                  <Pagination
                    id='bottom-pagination-id'
                    widgetId='bottomPaginationWidgetId'
                    perPageComponent='button'
                    itemCount={count}
                    perPage={perPage}
                    page={page}
                    onSetPage={onSetPage}
                    variant={PaginationVariant.bottom}
                    onPerPageSelect={onPerPageSelect}
                  />
                </FlexItem>
              </Flex>
            </>
          </Hide>
          <Hide hide={!countIsZero || isLoading}>
            <EmptyTableState
              notFiltered={notFiltered}
              clearFilters={clearFilters}
              itemName={itemName}
              notFilteredBody={notFilteredBody}
              notFilteredButton={
                <ConditionalTooltip
                  content='You do not have the required permissions to perform this action.'
                  show={!rbac?.write}
                  setDisabled
                >
                  <Button
                    id='createContentSourceButton'
                    ouiaId='create_content_source'
                    variant='primary'
                    isDisabled={isLoading}
                    onClick={() => navigate('add-repository')}
                  >
                    Add repositories
                  </Button>
                </ConditionalTooltip>
              }
            />
          </Hide>
        </Grid>
      )}
    </>
  );
};

export const useContentListOutletContext = () =>
  useOutletContext<{ clearCheckedRepositories: () => void }>();

export default ContentListTable;
